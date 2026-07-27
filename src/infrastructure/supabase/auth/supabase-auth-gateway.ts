import type {
  AuthGateway,
  AuthSession,
  SignInCredentials,
  SignUpInput,
} from "@/application/auth";
import type { Usuario } from "@/domain/entities";
import type { ServiceResult } from "@/application/shared/service-result";
import { createBrowserSupabaseClient } from "../client";

function failure<T>(message: string): ServiceResult<T> {
  return { ok: false, error: { code: "unexpected", message } };
}

export class SupabaseAuthGateway implements AuthGateway {
  async signIn(credentials: SignInCredentials): Promise<ServiceResult<AuthSession>> {
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error || !data.user) return failure(error?.message ?? "No fue posible iniciar sesión.");
    return {
      ok: true,
      value: {
        userId: data.user.id,
        email: data.user.email ?? credentials.email,
        expiresAt: data.session?.expires_at,
      },
    };
  }

  async signUp(input: SignUpInput): Promise<ServiceResult<AuthSession | null>> {
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          first_name: input.firstName,
          last_name: input.lastName,
          municipality_name: input.municipalityName,
        },
      },
    });
    if (error) return failure(error.message);

    if (data.session) {
      const { error: bootstrapError } = await supabase.rpc("bootstrap_municipality", {
        municipality_name: input.municipalityName,
      });
      if (bootstrapError) return failure(bootstrapError.message);
    }

    return {
      ok: true,
      value: data.session && data.user
        ? {
            userId: data.user.id,
            email: data.user.email ?? input.email,
            expiresAt: data.session.expires_at,
          }
        : null,
    };
  }

  async requestPasswordReset(
    email: string,
    redirectTo: string,
  ): Promise<ServiceResult<void>> {
    const { error } = await createBrowserSupabaseClient().auth.resetPasswordForEmail(
      email,
      { redirectTo },
    );
    return error ? failure(error.message) : { ok: true, value: undefined };
  }

  async updatePassword(password: string): Promise<ServiceResult<void>> {
    const { error } = await createBrowserSupabaseClient().auth.updateUser({ password });
    return error ? failure(error.message) : { ok: true, value: undefined };
  }

  async signOut(): Promise<ServiceResult<void>> {
    const { error } = await createBrowserSupabaseClient().auth.signOut();
    return error ? failure(error.message) : { ok: true, value: undefined };
  }

  async getCurrentProfile(): Promise<ServiceResult<Usuario | null>> {
    const supabase = createBrowserSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) return failure(authError.message);
    if (!authData.user) return { ok: true, value: null };

    const { data, error } = await supabase
      .from("user_profiles_view")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();
    if (error) return failure(error.message);
    if (!data) return { ok: true, value: null };

    return {
      ok: true,
      value: {
        id: data.id,
        municipioId: data.municipality_id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        role: data.role,
        status: data.status,
        joinedAt: data.joined_at,
        lastAccessAt: data.last_access_at ?? undefined,
        avatarUrl: data.avatar_url ?? undefined,
        preferences: data.preferences,
        audit: {
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          version: data.version,
        },
      },
    };
  }
}
