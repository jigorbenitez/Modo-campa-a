import type {
  TerritorialEntity,
  TerritorialEntityPage,
  TerritorialEntityQuery,
  TerritorialEntityRepository,
} from "../domain";

/**
 * Supabase es la fuente primaria. La caché secundaria es la proyección exacta
 * del último sync oficial y sólo se usa si la base aún no tiene filas o está
 * temporalmente inaccesible (PWA/offline); nunca mezcla ambos conjuntos.
 */
export class SupabaseFirstTerritorialRepository implements TerritorialEntityRepository {
  constructor(
    private readonly primary: TerritorialEntityRepository,
    private readonly synchronizedCache: TerritorialEntityRepository,
  ) {}

  async findById(municipalityId: string, id: string) {
    try {
      const entity = await this.primary.findById(municipalityId, id);
      if (entity) return entity;
      const firstPage = await this.primary.search(municipalityId, { pageSize: 1 });
      if (firstPage.total > 0) return null;
    } catch {
      // La proyección sincronizada mantiene la misma identidad durante offline.
    }
    return this.synchronizedCache.findById(municipalityId, id);
  }

  async search(municipalityId: string, query: TerritorialEntityQuery): Promise<TerritorialEntityPage> {
    try {
      const result = await this.primary.search(municipalityId, query);
      if (result.total > 0) return result;
    } catch {
      // No se combinan resultados parciales: se selecciona una única fuente.
    }
    return this.synchronizedCache.search(municipalityId, query);
  }

  async listCategories(municipalityId: string) {
    const result = await this.search(municipalityId, { pageSize: 5000 });
    return [...new Set(result.items.map((entity) => entity.category))].sort();
  }
  async listLocalities(municipalityId: string) {
    const result = await this.search(municipalityId, { categories: ["locality"], pageSize: 5000 });
    return result.items.map(({ id, name }) => ({ id, name }));
  }
  async listNeighborhoods(municipalityId: string) {
    const result = await this.search(municipalityId, { categories: ["neighborhood"], pageSize: 5000 });
    return result.items.map(({ id, name }) => ({ id, name }));
  }
  save(entity: TerritorialEntity) { return this.primary.save(entity); }
  saveMany(entities: TerritorialEntity[]) { return this.primary.saveMany(entities); }
  delete(municipalityId: string, id: string) { return this.primary.delete(municipalityId, id); }
}
