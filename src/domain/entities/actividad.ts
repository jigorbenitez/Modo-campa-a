import type {
  Address,
  AuditMetadata,
  EntityId,
  ISODate,
  MediaAsset,
  StateChange,
  TenantScoped,
} from "@/domain/shared/types";

export type ActivityType =
  | "walk"
  | "meeting"
  | "visit"
  | "talk"
  | "event"
  | "conference"
  | "university"
  | "club"
  | "business"
  | "ngo"
  | "institution"
  | "other";

export type ActivityStatus = "draft" | "planned" | "confirmed" | "in_progress" | "completed" | "cancelled";
export type ActivityPriority = "low" | "medium" | "high" | "critical";

/** Agregado operativo que conecta una acción del equipo con su contexto y resultados. */
export interface Actividad extends TenantScoped {
  id: EntityId;
  type: ActivityType;
  title: string;
  description: string;
  date: ISODate;
  startTime: string;
  endTime?: string;
  status: ActivityStatus;
  statusHistory: StateChange<ActivityStatus>[];
  barrioIds: EntityId[];
  location?: Address;
  organizerMemberId?: EntityId;
  participantMemberIds: EntityId[];
  externalParticipants: string[];
  observations: string[];
  attachments: MediaAsset[];
  tags: string[];
  priority: ActivityPriority;
  problemIds: EntityId[];
  opportunityIds: EntityId[];
  commitmentIds: EntityId[];
  proposalIds: EntityId[];
  documentIds: EntityId[];
  publicationIds: EntityId[];
  teamIds: EntityId[];
  eventIds: EntityId[];
  tourIds: EntityId[];
  audit: AuditMetadata;
}
