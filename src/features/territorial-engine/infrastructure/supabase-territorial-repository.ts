import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  TerritorialEntity,
  TerritorialEntityPage,
  TerritorialEntityQuery,
  TerritorialEntityRepository,
} from "../domain";
import {
  canonicalizeTerritorialEntities,
  synchronizedRecordToEntity,
} from "./verified-territorial-repository";

type FeatureRow = {
  external_id: string;
  category: string;
  name: string;
  geometry: { type?: string; coordinates?: number[] } | null;
  properties: Record<string, unknown>;
  fingerprint: string;
  updated_at: string;
  publisher?: string;
  source_url?: string;
  license?: string;
  confidence?: string;
};

export class SupabaseTerritorialRepository implements TerritorialEntityRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(municipalityId: string, id: string) {
    const result = await this.search(municipalityId, { pageSize: 5000 });
    return result.items.find((entity) => entity.id === id || entity.externalIds?.includes(id)) ?? null;
  }

  async search(municipalityId: string, query: TerritorialEntityQuery): Promise<TerritorialEntityPage> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 1000;
    let request = this.baseQuery(municipalityId);
    if (query.search) request = request.ilike("name", `%${query.search}%`);
    if (query.categories?.length) request = request.in("category", query.categories);
    if (query.statuses?.length) request = request.in("status", query.statuses);
    const start = (page - 1) * pageSize;
    const { data, error, count } = await request.order("name").range(start, start + pageSize - 1);
    if (error) throw error;
    const items = canonicalizeTerritorialEntities(
      ((data ?? []) as FeatureRow[]).map((row) => this.toEntity(row, municipalityId)),
    );
    return {
      items,
      total: query.search || query.categories?.length ? items.length : Math.min(count ?? items.length, items.length),
      page,
      pageSize,
    };
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
  async save(entity: TerritorialEntity): Promise<TerritorialEntity> { void entity; throw new Error("Las escrituras se realizan mediante TerritorialDataSyncEngine."); }
  async saveMany(entities: TerritorialEntity[]): Promise<{ saved: number; rejected: number }> { void entities; throw new Error("Las escrituras se realizan mediante TerritorialDataSyncEngine."); }
  async delete(municipalityId: string, id: string): Promise<void> { void municipalityId; void id; throw new Error("Las bajas se realizan mediante TerritorialDataSyncEngine."); }

  private baseQuery(municipalityId: string) {
    return this.client
      .from("territorial_registry")
      .select("external_id, category, name, geometry, properties, fingerprint, updated_at, publisher, source_url, license, confidence", { count: "exact" })
      .eq("municipality_id", municipalityId);
  }

  private toEntity(row: FeatureRow, municipalityId: string): TerritorialEntity {
    const coordinates = row.geometry?.type === "Point" ? row.geometry.coordinates : undefined;
    return {
      ...synchronizedRecordToEntity({
        id: row.external_id,
        name: row.name,
        category: row.category,
        latitude: coordinates?.[1] ?? Number.NaN,
        longitude: coordinates?.[0] ?? Number.NaN,
        source: row.publisher ?? "Fuente pública",
        sourceUrl: row.source_url ?? "",
        license: row.license ?? "Sin licencia informada",
        confidence: row.confidence ?? "low",
        syncedAt: row.updated_at,
        properties: row.properties,
      }),
      municipalityId,
    };
  }
}
