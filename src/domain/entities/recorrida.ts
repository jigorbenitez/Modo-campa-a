import type { Address, AuditMetadata, EntityId, ISODateTime, MediaAsset, TenantScoped } from "@/domain/shared/types";

export type TourStatus = "planned" | "confirmed" | "in_progress" | "completed" | "cancelled";

export interface TourObservation {
  id: EntityId;
  text: string;
  authorMemberId?: EntityId;
  createdAt: ISODateTime;
  tags: string[];
}

export interface Recorrida extends TenantScoped {
  id: EntityId;
  title: string;
  barrioId: EntityId;
  eventId?: EntityId;
  status: TourStatus;
  startsAt: ISODateTime;
  endsAt?: ISODateTime;
  meetingPoint?: Address;
  attendeeMemberIds: EntityId[];
  externalAttendees: string[];
  observations: TourObservation[];
  detectedProblemIds: EntityId[];
  media: MediaAsset[];
  commitmentIds: EntityId[];
  audit: AuditMetadata;
}
