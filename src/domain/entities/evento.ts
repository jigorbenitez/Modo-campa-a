import type { Address, AuditMetadata, EntityId, ISODateTime, StateChange, TenantScoped } from "@/domain/shared/types";

export type EventType = "meeting" | "rally" | "walk" | "visit" | "conference" | "session" | "inauguration" | "other";
export type EventStatus = "draft" | "scheduled" | "confirmed" | "completed" | "cancelled";

export interface Evento extends TenantScoped {
  id: EntityId;
  title: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  statusHistory: StateChange<EventStatus>[];
  startsAt: ISODateTime;
  endsAt?: ISODateTime;
  location?: Address;
  barrioId?: EntityId;
  organizerMemberId?: EntityId;
  attendeeMemberIds: EntityId[];
  externalAttendees: string[];
  relatedEntityIds: EntityId[];
  notes?: string;
  audit: AuditMetadata;
}
