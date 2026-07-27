import type {
  Address,
  AuditMetadata,
  EntityId,
  TenantScoped,
} from "@/domain/shared/types";

export type InstitutionType =
  | "school"
  | "university"
  | "club"
  | "health_center"
  | "business"
  | "ngo"
  | "social_organization"
  | "public_office"
  | "other";

export interface Institucion extends TenantScoped {
  id: EntityId;
  name: string;
  type: InstitutionType;
  description: string;
  barrioId: EntityId;
  address?: Address;
  contactPersonIds: EntityId[];
  activityIds: EntityId[];
  problemIds: EntityId[];
  commitmentIds: EntityId[];
  proposalIds: EntityId[];
  documentIds: EntityId[];
  tags: string[];
  active: boolean;
  audit: AuditMetadata;
}
