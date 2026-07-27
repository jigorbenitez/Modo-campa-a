import type { Evento, EventStatus, EventType } from "@/domain/entities";
import type { EntityId, EntityQuery, ISODateTime } from "@/domain/shared/types";
import type { Repository } from "./repository";

export interface EventoQuery extends EntityQuery {
  from?: ISODateTime;
  to?: ISODateTime;
  type?: EventType;
  status?: EventStatus;
  barrioId?: EntityId;
}
export type EventoRepository = Repository<Evento, EventoQuery>;
