import type { Address, AuditMetadata, EntityId, MediaAsset, StateChange, TenantScoped } from "@/domain/shared/types";

export type ProblemSeverity = "low" | "medium" | "high" | "critical";
export type ProblemPriority = "low" | "medium" | "high" | "urgent";
export type ProblemStatus = "reported" | "validated" | "planned" | "in_progress" | "resolved" | "dismissed";
export type ProblemOrigin = "resident" | "territorial_tour" | "team" | "document" | "public_data" | "other";

export interface ProblemEvidence {
  description: string;
  assets: MediaAsset[];
  documentIds: EntityId[];
  capturedAt?: string;
}

export interface Problema extends TenantScoped {
  id: EntityId;
  barrioId?: EntityId;
  title: string;
  description: string;
  category: string;
  severity: ProblemSeverity;
  impact: string;
  priority: ProblemPriority;
  location?: Address;
  evidence: ProblemEvidence[];
  origin: ProblemOrigin;
  status: ProblemStatus;
  statusHistory: StateChange<ProblemStatus>[];
  relatedProblemIds: EntityId[];
  responsibleDepartmentId?: EntityId;
  tags: string[];
  audit: AuditMetadata;
}
