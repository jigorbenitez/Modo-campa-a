import "server-only";
import type { Usuario, UserRole } from "@/domain/entities";
import { AuthorizationService, type Permission } from "@/application/auth";
import { createServerSupabaseClient } from "./server";
import { isSupabaseConfigured } from "./config";

type ProfileViewRow = {
  id: string;
  municipality_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  status: Usuario["status"];
  joined_at: string;
  last_access_at: string | null;
  avatar_url: string | null;
  preferences: Usuario["preferences"];
  created_at: string;
  updated_at: string;
  version: number;
};

export interface PlatformContext {
  user: Usuario;
  municipalityName: string;
  configured: boolean;
}

export interface AdminOverview {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: string;
  }>;
  municipalities: Array<{ id: string; name: string; active: boolean }>;
  configured: boolean;
}

const demoUser: Usuario = {
  id: "usuario-demo-administrador",
  municipioId: "municipio-san-fernando",
  firstName: "Administración",
  lastName: "Demo",
  email: "admin@san-fernando.demo",
  role: "administrator",
  status: "active",
  joinedAt: "2026-07-01T12:00:00.000Z",
  lastAccessAt: "2026-07-26T12:00:00.000Z",
  preferences: {
    theme: "system",
    locale: "es-AR",
    timezone: "America/Argentina/Buenos_Aires",
    emailNotifications: true,
    weeklyDigest: true,
    reducedMotion: false,
  },
  audit: {
    createdAt: "2026-07-01T12:00:00.000Z",
    updatedAt: "2026-07-26T12:00:00.000Z",
    version: 1,
  },
};

export async function getPlatformContext(): Promise<PlatformContext | null> {
  if (!isSupabaseConfigured()) {
    return {
      user: demoUser,
      municipalityName: "San Fernando",
      configured: false,
    };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_profiles_view")
    .select("*")
    .eq("id", user.id)
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const row = data as ProfileViewRow;
  const { data: municipality } = await supabase
    .from("municipalities")
    .select("name")
    .eq("id", row.municipality_id)
    .maybeSingle();

  return {
    user: {
      id: row.id,
      municipioId: row.municipality_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      role: row.role,
      status: row.status,
      joinedAt: row.joined_at,
      lastAccessAt: row.last_access_at ?? undefined,
      avatarUrl: row.avatar_url ?? undefined,
      preferences: row.preferences,
      audit: {
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        version: row.version,
      },
    },
    municipalityName: (municipality as { name?: string } | null)?.name ?? "Municipio",
    configured: true,
  };
}

export async function getAdminOverview(
  context: PlatformContext,
): Promise<AdminOverview> {
  const authorization = new AuthorizationService();
  authorization.assert(context.user.role, "users:read");

  if (!context.configured) {
    return {
      users: [
        {
          id: context.user.id,
          name: `${context.user.firstName} ${context.user.lastName}`,
          email: context.user.email,
          role: context.user.role,
          status: context.user.status,
        },
        {
          id: "usuario-demo-territorio",
          name: "Equipo Territorial",
          email: "territorio@san-fernando.demo",
          role: "territorial_manager",
          status: "active",
        },
        {
          id: "usuario-demo-consultor",
          name: "Consultoría Institucional",
          email: "consultoria@san-fernando.demo",
          role: "consultant",
          status: "invited",
        },
      ],
      municipalities: [
        {
          id: context.user.municipioId,
          name: context.municipalityName,
          active: true,
        },
      ],
      configured: false,
    };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { users: [], municipalities: [], configured: true };
  const [{ data: profiles }, { data: municipalities }] = await Promise.all([
    supabase
      .from("user_profiles_view")
      .select("id, first_name, last_name, email, role, status")
      .eq("municipality_id", context.user.municipioId),
    supabase.from("municipalities").select("id, name, active"),
  ]);

  return {
    users: ((profiles ?? []) as Array<Pick<ProfileViewRow, "id" | "first_name" | "last_name" | "email" | "role" | "status">>).map(
      (profile) => ({
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`.trim(),
        email: profile.email,
        role: profile.role,
        status: profile.status,
      }),
    ),
    municipalities: (municipalities ?? []) as Array<{
      id: string;
      name: string;
      active: boolean;
    }>,
    configured: true,
  };
}

export function canUser(role: UserRole, permission: Permission): boolean {
  return new AuthorizationService().can(role, permission);
}
