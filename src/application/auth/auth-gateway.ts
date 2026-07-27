import type { Usuario } from "@/domain/entities";
import type { ServiceResult } from "@/application/shared/service-result";

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpInput extends SignInCredentials {
  firstName: string;
  lastName: string;
  municipalityName: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  expiresAt?: number;
}

export interface AuthGateway {
  signIn(credentials: SignInCredentials): Promise<ServiceResult<AuthSession>>;
  signUp(input: SignUpInput): Promise<ServiceResult<AuthSession | null>>;
  requestPasswordReset(email: string, redirectTo: string): Promise<ServiceResult<void>>;
  updatePassword(password: string): Promise<ServiceResult<void>>;
  signOut(): Promise<ServiceResult<void>>;
  getCurrentProfile(): Promise<ServiceResult<Usuario | null>>;
}
