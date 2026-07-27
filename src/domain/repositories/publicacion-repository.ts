import type { Publicacion, PublicationChannel, PublicationStatus } from "@/domain/entities";
import type { EntityQuery, ISODateTime } from "@/domain/shared/types";
import type { Repository } from "./repository";

export interface PublicacionQuery extends EntityQuery {
  channel?: PublicationChannel;
  status?: PublicationStatus;
  scheduledFrom?: ISODateTime;
  scheduledTo?: ISODateTime;
}
export type PublicacionRepository = Repository<Publicacion, PublicacionQuery>;
