import type { AuditMetadata, EntityId, TenantScoped } from "@/domain/shared/types";

export type TeamArea = "volunteers" | "press" | "design" | "territory" | "electoral_oversight" | "communications" | "logistics" | "management" | "other";
export type Permission = string;

export interface TeamRole {
  id: EntityId;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface TeamMember {
  id: EntityId;
  displayName: string;
  email?: string;
  phone?: string;
  area: TeamArea;
  roleIds: EntityId[];
  barrioIds: EntityId[];
  active: boolean;
}

export interface Equipo extends TenantScoped {
  id: EntityId;
  name: string;
  description?: string;
  areas: TeamArea[];
  roles: TeamRole[];
  members: TeamMember[];
  active: boolean;
  audit: AuditMetadata;
}
