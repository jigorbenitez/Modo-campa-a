import type { Persona, PersonRole } from "@/domain/entities";
import type { EntityId, EntityQuery } from "@/domain/shared/types";
import type { Repository } from "./repository";

export interface PersonaQuery extends EntityQuery {
  role?: PersonRole;
  institutionId?: EntityId;
  barrioId?: EntityId;
}

export type PersonaRepository = Repository<Persona, PersonaQuery>;
