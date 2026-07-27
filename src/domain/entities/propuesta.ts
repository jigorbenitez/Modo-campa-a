import type { AuditMetadata, EntityId, Metric, Money, StateChange, TenantScoped } from "@/domain/shared/types";

export type ProposalPriority = "low" | "medium" | "high" | "strategic";
export type ProposalStatus = "idea" | "diagnosis" | "draft" | "under_review" | "approved" | "in_execution" | "completed" | "archived";

export interface BeneficiaryGroup {
  name: string;
  description?: string;
  estimatedPeople?: number;
  barrioIds: EntityId[];
}

/** Política pública trazable desde el diagnóstico hasta sus resultados. */
export interface Propuesta extends TenantScoped {
  id: EntityId;
  title: string;
  summary: string;
  objective: string;
  diagnosis: string;
  rationale: string;
  beneficiaries: BeneficiaryGroup[];
  indicators: Metric[];
  estimatedCost?: Money;
  priority: ProposalPriority;
  status: ProposalStatus;
  statusHistory: StateChange<ProposalStatus>[];
  responsibleDepartmentId?: EntityId;
  collaboratingDepartmentIds: EntityId[];
  relatedProblemIds: EntityId[];
  documentIds: EntityId[];
  publicationIds: EntityId[];
  barrioIds: EntityId[];
  tags: string[];
  audit: AuditMetadata;
}
