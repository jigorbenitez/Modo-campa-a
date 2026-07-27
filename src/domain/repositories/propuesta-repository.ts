import type { Propuesta, ProposalPriority, ProposalStatus } from "@/domain/entities";
import type { EntityId, EntityQuery } from "@/domain/shared/types";
import type { Repository } from "./repository";

export interface PropuestaQuery extends EntityQuery {
  status?: ProposalStatus;
  priority?: ProposalPriority;
  departmentId?: EntityId;
  barrioId?: EntityId;
}
export type PropuestaRepository = Repository<Propuesta, PropuestaQuery>;
