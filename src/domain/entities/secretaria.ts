import type { AuditMetadata, EntityId, TenantScoped } from "@/domain/shared/types";

export interface AdministrativeUnit {
  id: EntityId;
  name: string;
  type: "directorate" | "department" | "program" | "coordination" | "other";
  parentUnitId?: EntityId;
  competencies: string[];
  authorityRoleIds: EntityId[];
  documentIds: EntityId[];
  active: boolean;
}

export interface Secretaria extends TenantScoped {
  id: EntityId;
  name: string;
  description?: string;
  mission?: string;
  competencies: string[];
  authorityRoleIds: EntityId[];
  units: AdministrativeUnit[];
  programIds: EntityId[];
  documentIds: EntityId[];
  active: boolean;
  audit: AuditMetadata;
}
