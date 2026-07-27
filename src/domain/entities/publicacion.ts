import type { AuditMetadata, EntityId, ISODateTime, MediaAsset, StateChange, TenantScoped } from "@/domain/shared/types";

export type PublicationChannel = "instagram" | "facebook" | "tiktok" | "youtube" | "whatsapp" | "x" | "website";
export type PublicationStatus = "idea" | "draft" | "review" | "approved" | "scheduled" | "published" | "cancelled";

export interface PublicationVariant {
  channel: PublicationChannel;
  copy: string;
  assets: MediaAsset[];
  callToAction?: string;
  externalUrl?: string;
}

export interface Publicacion extends TenantScoped {
  id: EntityId;
  title: string;
  objective: string;
  status: PublicationStatus;
  statusHistory: StateChange<PublicationStatus>[];
  variants: PublicationVariant[];
  scheduledAt?: ISODateTime;
  publishedAt?: ISODateTime;
  ownerMemberId?: EntityId;
  campaignTags: string[];
  proposalIds: EntityId[];
  documentIds: EntityId[];
  barrioIds: EntityId[];
  audit: AuditMetadata;
}
