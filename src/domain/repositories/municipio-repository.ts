import type { Municipio } from "@/domain/entities";
import type { EntityId, EntityQuery, PageResult } from "@/domain/shared/types";

export interface MunicipioRepository {
  findById(id: EntityId): Promise<Municipio | null>;
  findMany(query?: EntityQuery): Promise<PageResult<Municipio>>;
  save(municipio: Municipio): Promise<Municipio>;
  delete(id: EntityId): Promise<void>;
}
