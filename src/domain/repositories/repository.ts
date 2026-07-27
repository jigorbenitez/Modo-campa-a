import type { EntityId, EntityQuery, PageResult } from "@/domain/shared/types";

/** Puerto de persistencia. Las implementaciones pertenecen a infraestructura. */
export interface Repository<TEntity, TQuery extends EntityQuery = EntityQuery> {
  findById(municipioId: EntityId, id: EntityId): Promise<TEntity | null>;
  findMany(municipioId: EntityId, query?: TQuery): Promise<PageResult<TEntity>>;
  save(entity: TEntity): Promise<TEntity>;
  delete(municipioId: EntityId, id: EntityId): Promise<void>;
}
