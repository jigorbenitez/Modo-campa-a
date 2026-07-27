import type {
  AuditMetadata,
  EntityId,
  StateChange,
  TenantScoped,
} from "@/domain/shared/types";

export type OpportunityStatus = "detected" | "validated" | "under_review" | "converted" | "dismissed";
export type OpportunityPriority = "low" | "medium" | "high";

/** Posibilidad de mejora o articulación detectada durante el trabajo operativo. */
export interface Oportunidad extends TenantScoped {
  id: EntityId;
  title: string;
  description: string;
  category: string;
  status: OpportunityStatus;
  statusHistory: StateChange<OpportunityStatus>[];
  priority: OpportunityPriority;
  barrioIds: EntityId[];
  sourceActivityId: EntityId;
  responsibleMemberId?: EntityId;
  relatedProposalIds: EntityId[];
  tags: string[];
  audit: AuditMetadata;
}
