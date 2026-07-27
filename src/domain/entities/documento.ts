import type { AuditMetadata, EntityId, ISODate, MediaAsset, TenantScoped } from "@/domain/shared/types";

export type DocumentType = "ordinance" | "decree" | "law" | "budget" | "accountability" | "report" | "statistics" | "resolution" | "other";
export type DocumentStatus = "draft" | "current" | "repealed" | "archived";

export interface DocumentRelation {
  documentId: EntityId;
  type: "modifies" | "repeals" | "regulates" | "supports" | "references" | "related";
  note?: string;
}

export interface Documento extends TenantScoped {
  id: EntityId;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  summary?: string;
  number?: string;
  issueDate?: ISODate;
  effectiveFrom?: ISODate;
  effectiveTo?: ISODate;
  issuingBody?: string;
  sourceUrl?: string;
  asset?: MediaAsset;
  tags: string[];
  relations: DocumentRelation[];
  barrioIds: EntityId[];
  departmentIds: EntityId[];
  proposalIds: EntityId[];
  extractedTextAvailable: boolean;
  audit: AuditMetadata;
}
