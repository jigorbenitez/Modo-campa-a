import type { Actividad, ActivityStatus, ActivityType } from "@/domain/entities";
import type { EntityId, EntityQuery, ISODate } from "@/domain/shared/types";
import type { Repository } from "./repository";

export interface ActividadQuery extends EntityQuery {
  from?: ISODate;
  to?: ISODate;
  type?: ActivityType;
  status?: ActivityStatus;
  barrioId?: EntityId;
  participantMemberId?: EntityId;
}

export type ActividadRepository = Repository<Actividad, ActividadQuery>;
