import type { Problema, ProblemPriority, ProblemStatus } from "@/domain/entities";
import type { EntityId, EntityQuery } from "@/domain/shared/types";
import type { Repository } from "./repository";

export interface ProblemaQuery extends EntityQuery {
  barrioId?: EntityId;
  status?: ProblemStatus;
  priority?: ProblemPriority;
  category?: string;
}
export type ProblemaRepository = Repository<Problema, ProblemaQuery>;
