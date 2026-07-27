import type { Barrio } from "@/domain/entities";
import type { EntityId, EntityQuery } from "@/domain/shared/types";
import type { Repository } from "./repository";

export interface BarrioQuery extends EntityQuery { hasOpenProblems?: boolean }
export interface BarrioRepository extends Repository<Barrio, BarrioQuery> {
  findByName(municipioId: EntityId, name: string): Promise<Barrio | null>;
}
