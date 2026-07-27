import type {
  AuditMetadata,
  EntityId,
  ISODateTime,
  TenantScoped,
} from "@/domain/shared/types";

export type UserRole =
  | "administrator"
  | "coordinator"
  | "territorial_manager"
  | "institutional_manager"
  | "volunteer"
  | "consultant"
  | "guest"
  | "read_only";

export type UserStatus = "invited" | "active" | "suspended" | "disabled";

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  locale: string;
  timezone: string;
  emailNotifications: boolean;
  weeklyDigest: boolean;
  reducedMotion: boolean;
}

/** Perfil de aplicación; la identidad y credenciales pertenecen a Supabase Auth. */
export interface Usuario extends TenantScoped {
  id: EntityId;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: ISODateTime;
  lastAccessAt?: ISODateTime;
  avatarUrl?: string;
  preferences: UserPreferences;
  audit: AuditMetadata;
}
