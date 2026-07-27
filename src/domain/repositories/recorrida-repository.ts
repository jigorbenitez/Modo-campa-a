import type { Recorrida, TourStatus } from "@/domain/entities";
import type { EntityId, EntityQuery, ISODateTime } from "@/domain/shared/types";
import type { Repository } from "./repository";

export interface RecorridaQuery extends EntityQuery {
  barrioId?: EntityId;
  status?: TourStatus;
  from?: ISODateTime;
  to?: ISODateTime;
}
export type RecorridaRepository = Repository<Recorrida, RecorridaQuery>;
