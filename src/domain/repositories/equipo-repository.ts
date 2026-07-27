import type { Equipo, TeamArea } from "@/domain/entities";
import type { EntityQuery } from "@/domain/shared/types";
import type { Repository } from "./repository";

export interface EquipoQuery extends EntityQuery { area?: TeamArea }
export type EquipoRepository = Repository<Equipo, EquipoQuery>;
