import type {
  TerritorialEntity,
  TerritorialEntityPage,
  TerritorialEntityQuery,
  TerritorialEntityRepository,
} from "../domain";

/**
 * Adaptador de arranque deliberadamente vacío.
 * Permite validar la presentación y reemplazarlo por Supabase/PostGIS sin
 * modificar servicios ni componentes.
 */
export class EmptyTerritorialEntityRepository implements TerritorialEntityRepository {
  async findById(municipalityId: string, id: string): Promise<TerritorialEntity | null> {
    void municipalityId;
    void id;
    return null;
  }

  async search(
    municipalityId: string,
    query: TerritorialEntityQuery,
  ): Promise<TerritorialEntityPage> {
    void municipalityId;
    return {
      items: [],
      total: 0,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 24,
    };
  }

  async listCategories(municipalityId: string): Promise<string[]> {
    void municipalityId;
    return [];
  }

  async listLocalities(municipalityId: string): Promise<Array<{ id: string; name: string }>> {
    void municipalityId;
    return [];
  }

  async listNeighborhoods(municipalityId: string): Promise<Array<{ id: string; name: string }>> {
    void municipalityId;
    return [];
  }

  async save(entity: TerritorialEntity): Promise<TerritorialEntity> {
    void entity;
    throw new Error("La persistencia territorial se habilitará en el Sprint 13.");
  }

  async saveMany(entities: TerritorialEntity[]): Promise<{ saved: number; rejected: number }> {
    void entities;
    throw new Error("La importación territorial se habilitará en el Sprint 13.");
  }

  async delete(municipalityId: string, id: string): Promise<void> {
    void municipalityId;
    void id;
    throw new Error("La persistencia territorial se habilitará en el Sprint 13.");
  }
}
