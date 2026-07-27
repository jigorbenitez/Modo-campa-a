import type { Institucion, InstitutionType } from "@/domain/entities";
import type { EntityId, EntityQuery } from "@/domain/shared/types";
import type { Repository } from "./repository";

export interface InstitucionQuery extends EntityQuery {
  type?: InstitutionType;
  barrioId?: EntityId;
}

export type InstitucionRepository = Repository<Institucion, InstitucionQuery>;
