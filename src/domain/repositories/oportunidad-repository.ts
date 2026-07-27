import type { Oportunidad, OpportunityStatus } from "@/domain/entities";
import type { EntityId, EntityQuery } from "@/domain/shared/types";
import type { Repository } from "./repository";

export interface OportunidadQuery extends EntityQuery {
  status?: OpportunityStatus;
  barrioId?: EntityId;
  activityId?: EntityId;
}

export type OportunidadRepository = Repository<Oportunidad, OportunidadQuery>;
