import synchronizedData from "@/data/san-fernando-official-sync.json";
import type {
  TerritorialEntity,
  TerritorialEntityPage,
  TerritorialEntityQuery,
  TerritorialEntityRepository,
  TerritorialEntityType,
} from "../domain";

type SynchronizedRecord = {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  source: string;
  sourceUrl: string;
  license: string;
  confidence: string;
  syncedAt: string;
  properties: Record<string, unknown>;
};

const supportedTypes = new Set<string>([
  "locality", "neighborhood", "school", "kindergarten", "university", "club",
  "hospital", "primary_care_center", "square", "municipal_office", "station",
  "point_of_interest",
]);

function asType(category: string): TerritorialEntityType {
  if (supportedTypes.has(category)) return category as TerritorialEntityType;
  if (category === "municipality") return "institution";
  if (category === "police" || category === "fire_station") return "institution";
  if (category === "park") return "public_space";
  return "point_of_interest";
}

function stringProperty(properties: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = properties[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
}

export function synchronizedRecordToEntity(record: SynchronizedRecord): TerritorialEntity {
  return {
    id: record.id,
    municipalityId: synchronizedData.municipality.id,
    name: record.name,
    type: asType(record.category),
    category: record.category,
    subcategory: stringProperty(record.properties, "amenity", "leisure", "nivel"),
    description: `Registro público sincronizado desde ${record.source}.`,
    address: {
      formatted: stringProperty(record.properties, "address", "direccion", "addr:full"),
      street: stringProperty(record.properties, "addr:street"),
      number: stringProperty(record.properties, "addr:housenumber"),
    },
    latitude: record.latitude,
    longitude: record.longitude,
    localityName: stringProperty(record.properties, "localidad", "locality"),
    phone: stringProperty(record.properties, "phone", "contact:phone"),
    email: stringProperty(record.properties, "email", "contact:email"),
    website: stringProperty(record.properties, "website", "contact:website"),
    notes: [],
    tags: [record.category, record.source],
    status: "active",
    createdAt: record.syncedAt,
    updatedAt: record.syncedAt,
    metadata: {
      source: record.source,
      sourceUrl: record.sourceUrl,
      license: record.license,
      confidence: record.confidence,
      sourceProperties: record.properties,
    },
  };
}

function normalizedIdentity(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es-AR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function distanceInMeters(left: TerritorialEntity, right: TerritorialEntity) {
  if (
    left.latitude === undefined || left.longitude === undefined
    || right.latitude === undefined || right.longitude === undefined
  ) return Number.POSITIVE_INFINITY;
  const latitude = (left.latitude + right.latitude) / 2;
  const y = (left.latitude - right.latitude) * 111_320;
  const x = (left.longitude - right.longitude) * 111_320 * Math.cos(latitude * Math.PI / 180);
  return Math.hypot(x, y);
}

function sourcePriority(entity: TerritorialEntity) {
  const source = String(entity.metadata.source ?? "");
  if (source.includes("Datos Abiertos PBA")) return 3;
  if (source.includes("GeoRef")) return 2;
  if (source.includes("OpenStreetMap")) return 1;
  return 0;
}

/**
 * Resuelve la identidad entre fuentes sin colapsar sedes homónimas:
 * mismo tipo, mismo nombre normalizado y distancia máxima de 120 metros.
 */
export function canonicalizeTerritorialEntities(entities: TerritorialEntity[]) {
  const canonical: TerritorialEntity[] = [];
  for (const entity of entities) {
    const duplicateIndex = canonical.findIndex((candidate) =>
      candidate.category === entity.category
      && normalizedIdentity(candidate.name) === normalizedIdentity(entity.name)
      && distanceInMeters(candidate, entity) <= 120
    );
    if (duplicateIndex < 0) canonical.push(entity);
    else if (sourcePriority(entity) > sourcePriority(canonical[duplicateIndex])) {
      canonical[duplicateIndex] = entity;
    }
  }
  return canonical;
}

export const verifiedTerritorialEntities = canonicalizeTerritorialEntities(
  [...new Map(
    (synchronizedData.records as SynchronizedRecord[])
      .map(synchronizedRecordToEntity)
      .map((entity) => [entity.id, entity] as const),
  ).values()],
);

/** Caché verificada para PWA y desarrollo sin infraestructura; nunca genera datos. */
export class VerifiedTerritorialRepository implements TerritorialEntityRepository {
  async findById(municipalityId: string, id: string) {
    const entity = verifiedTerritorialEntities.find((item) => item.id === id);
    return entity ? { ...entity, municipalityId } : null;
  }

  async search(municipalityId: string, query: TerritorialEntityQuery): Promise<TerritorialEntityPage> {
    const normalized = query.search?.trim().toLocaleLowerCase("es-AR");
    const filtered = verifiedTerritorialEntities.filter((entity) =>
      (!normalized || `${entity.name} ${entity.category} ${entity.description}`.toLocaleLowerCase("es-AR").includes(normalized))
      && (!query.types?.length || query.types.includes(entity.type))
      && (!query.categories?.length || query.categories.includes(entity.category))
      && (!query.statuses?.length || query.statuses.includes(entity.status)),
    );
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? filtered.length;
    return {
      items: filtered.slice((page - 1) * pageSize, page * pageSize)
        .map((entity) => ({ ...entity, municipalityId })),
      total: filtered.length,
      page,
      pageSize,
    };
  }

  async listCategories() {
    return [...new Set(verifiedTerritorialEntities.map((entity) => entity.category))].sort();
  }
  async listLocalities() {
    return verifiedTerritorialEntities
      .filter((entity) => entity.type === "locality")
      .map((entity) => ({ id: entity.id, name: entity.name }));
  }
  async listNeighborhoods() {
    return verifiedTerritorialEntities
      .filter((entity) => entity.type === "neighborhood")
      .map((entity) => ({ id: entity.id, name: entity.name }));
  }
  async save(entity: TerritorialEntity): Promise<TerritorialEntity> { void entity; throw new Error("La caché verificada es de solo lectura."); }
  async saveMany(entities: TerritorialEntity[]): Promise<{ saved: number; rejected: number }> { void entities; throw new Error("La caché verificada es de solo lectura."); }
  async delete(municipalityId: string, id: string): Promise<void> { void municipalityId; void id; throw new Error("La caché verificada es de solo lectura."); }
}
