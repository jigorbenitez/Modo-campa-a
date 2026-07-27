import type { AuditMetadata, EntityId, ISODate, StateChange, TenantScoped } from "@/domain/shared/types";

export type CommitmentStatus = "open" | "assigned" | "in_progress" | "blocked" | "completed" | "cancelled";
export type CommitmentPriority = "low" | "medium" | "high" | "urgent";

export interface Compromiso extends TenantScoped {
  id: EntityId;
  title: string;
  description: string;
  status: CommitmentStatus;
  priority: CommitmentPriority;
  dueDate?: ISODate;
  assignedMemberIds: EntityId[];
  originType: "tour" | "event" | "resident" | "proposal" | "internal" | "other";
  originEntityId?: EntityId;
  barrioId?: EntityId;
  departmentId?: EntityId;
  evidenceDocumentIds: EntityId[];
  statusHistory: StateChange<CommitmentStatus>[];
  completionNote?: string;
  audit: AuditMetadata;
}
