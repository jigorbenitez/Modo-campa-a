import type { SupabaseClient } from "@supabase/supabase-js";
import type { Repository } from "@/domain/repositories";
import type {
  EntityQuery,
  PageResult,
} from "@/domain/shared/types";

type PersistentEntity = {
  id: string;
  municipioId: string;
  audit?: { updatedAt?: string };
};

type PersistenceRow = {
  id: string;
  municipality_id: string;
  title?: string;
  name?: string;
  data: unknown;
};

/**
 * Adaptador progresivo. Persiste el agregado completo en JSONB y mantiene
 * columnas de proyección para búsquedas e índices.
 */
export class SupabaseRepository<
  TEntity extends PersistentEntity,
  TQuery extends EntityQuery = EntityQuery,
> implements Repository<TEntity, TQuery> {
  constructor(
    private readonly client: SupabaseClient,
    private readonly table: string,
    private readonly displayField: "title" | "name" = "title",
  ) {}

  async findById(municipioId: string, id: string): Promise<TEntity | null> {
    const { data, error } = await this.client
      .from(this.table)
      .select("id, municipality_id, data")
      .eq("municipality_id", municipioId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? this.toEntity(data as PersistenceRow) : null;
  }

  async findMany(
    municipioId: string,
    query: TQuery = {} as TQuery,
  ): Promise<PageResult<TEntity>> {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 50, 100);
    const start = (page - 1) * pageSize;
    let request = this.client
      .from(this.table)
      .select("id, municipality_id, data", { count: "exact" })
      .eq("municipality_id", municipioId);

    if (query.search) {
      request = request.ilike(this.displayField, `%${query.search}%`);
    }

    const { data, error, count } = await request
      .order("updated_at", { ascending: false })
      .range(start, start + pageSize - 1);
    if (error) throw error;

    return {
      items: (data ?? []).map((row) => this.toEntity(row as PersistenceRow)),
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  async save(entity: TEntity): Promise<TEntity> {
    const displayValue = this.getDisplayValue(entity);
    const payload = {
      id: entity.id,
      municipality_id: entity.municipioId,
      [this.displayField]: displayValue,
      data: entity,
      updated_at: entity.audit?.updatedAt ?? new Date().toISOString(),
    };
    const { data, error } = await this.client
      .from(this.table)
      .upsert(payload)
      .select("id, municipality_id, data")
      .single();
    if (error) throw error;
    return this.toEntity(data as PersistenceRow);
  }

  async delete(municipioId: string, id: string): Promise<void> {
    const { error } = await this.client
      .from(this.table)
      .delete()
      .eq("municipality_id", municipioId)
      .eq("id", id);
    if (error) throw error;
  }

  private toEntity(row: PersistenceRow): TEntity {
    const stored = row.data as TEntity;
    return { ...stored, id: row.id, municipioId: row.municipality_id };
  }

  private getDisplayValue(entity: TEntity): string {
    const record = entity as TEntity & { title?: string; name?: string; displayName?: string };
    return record.title ?? record.name ?? record.displayName ?? entity.id;
  }
}
