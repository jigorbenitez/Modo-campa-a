import type { AuditMetadata, EntityId, TenantScoped } from "@/domain/shared/types";

export type PersonRole =
  | "team_member"
  | "institutional_contact"
  | "community_representative"
  | "specialist"
  | "volunteer"
  | "other";

/** Persona ficticia o contacto autorizado, con datos mínimos y finalidad operativa. */
export interface Persona extends TenantScoped {
  id: EntityId;
  displayName: string;
  role: PersonRole;
  description?: string;
  institutionIds: EntityId[];
  barrioIds: EntityId[];
  activityIds: EntityId[];
  commitmentIds: EntityId[];
  tags: string[];
  active: boolean;
  audit: AuditMetadata;
}
