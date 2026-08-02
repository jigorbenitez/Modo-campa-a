import type { TerritorialEntity } from "@/features/territorial-engine/domain";
import type {
  CanonicalTerritorialEntity,
  IdentityEvidence,
  IdentityMatch,
  IdentityResolutionConfiguration,
  IdentityResolutionResult,
} from "../domain";
import { normalizeAddress, normalizeIdentityName } from "./identity-normalizer";

export const defaultIdentityResolutionConfiguration: IdentityResolutionConfiguration = {
  weights: { name: 0.4, location: 0.3, address: 0.15, category: 0.1, externalId: 0.05 },
  automaticThreshold: 0.75,
  reviewThreshold: 0.6,
  maximumDistanceMeters: 250,
};

function tokens(value: string) {
  return new Set(value.split(" ").filter(Boolean));
}

function similarity(left: string, right: string) {
  if (!left || !right) return 0;
  if (left === right) return 1;
  const a = tokens(left);
  const b = tokens(right);
  const intersection = [...a].filter((token) => b.has(token)).length;
  return intersection / Math.max(a.size, b.size);
}

function distance(left: TerritorialEntity, right: TerritorialEntity) {
  if (
    left.latitude === undefined || left.longitude === undefined
    || right.latitude === undefined || right.longitude === undefined
  ) return undefined;
  const latitude = (left.latitude + right.latitude) / 2;
  const y = (left.latitude - right.latitude) * 111_320;
  const x = (left.longitude - right.longitude) * 111_320 * Math.cos(latitude * Math.PI / 180);
  return Math.hypot(x, y);
}

function categorySimilarity(left: TerritorialEntity, right: TerritorialEntity) {
  if (left.category === right.category) return 1;
  const education = new Set(["school", "kindergarten", "university", "education_school", "education_kindergarten", "education_primary", "education_secondary", "education_technical", "education_university"]);
  const health = new Set(["hospital", "primary_care_center", "health_center", "health_hospital", "health_caps", "health_clinic"]);
  const sport = new Set(["club", "sport_club", "sport_sports_center", "sport_municipal_field"]);
  const publicSpace = new Set(["square", "park", "public_square", "public_park", "public_waterfront"]);
  if (education.has(left.category) && education.has(right.category)) return 1;
  if (health.has(left.category) && health.has(right.category)) return 0.8;
  if (sport.has(left.category) && sport.has(right.category)) return 0.5;
  if (publicSpace.has(left.category) && publicSpace.has(right.category)) return 0.5;
  return 0;
}

function sourceOf(entity: TerritorialEntity) {
  return {
    name: String(entity.metadata.source ?? "Fuente pública"),
    url: typeof entity.metadata.sourceUrl === "string" ? entity.metadata.sourceUrl : undefined,
    license: typeof entity.metadata.license === "string" ? entity.metadata.license : undefined,
    externalId: entity.id,
  };
}

function sourcePriority(entity: TerritorialEntity) {
  const source = String(entity.metadata.source ?? "");
  if (source.includes("Datos Abiertos PBA")) return 3;
  if (source.includes("GeoRef")) return 2;
  if (source.includes("OpenStreetMap")) return 1;
  return 0;
}

function asCanonical(entity: TerritorialEntity): CanonicalTerritorialEntity {
  return {
    ...entity,
    alternateNames: [],
    externalIds: [entity.id],
    sources: [sourceOf(entity)],
    identityHistory: [{ at: entity.updatedAt, action: "created", entityIds: [entity.id] }],
  };
}

export class IdentityResolutionEngine {
  constructor(
    private readonly configuration: IdentityResolutionConfiguration = defaultIdentityResolutionConfiguration,
  ) {}

  compare(left: TerritorialEntity, right: TerritorialEntity): IdentityMatch {
    const meters = distance(left, right);
    const name = similarity(normalizeIdentityName(left.name), normalizeIdentityName(right.name));
    const leftAddress = normalizeAddress(left.address?.formatted);
    const rightAddress = normalizeAddress(right.address?.formatted);
    const address = leftAddress && rightAddress ? similarity(leftAddress, rightAddress) : 0;
    const location = meters === undefined ? 0 : Math.max(0, 1 - meters / this.configuration.maximumDistanceMeters);
    const category = categorySimilarity(left, right);
    const externalId = left.id === right.id ? 1 : 0;
    const evidence: IdentityEvidence = { name, location, address, category, externalId, distanceMeters: meters };
    const score = Object.entries(this.configuration.weights).reduce(
      (total, [key, weight]) => total + evidence[key as keyof IdentityResolutionWeightsValue] * weight,
      0,
    );
    const status = score >= this.configuration.automaticThreshold
      ? "automatic"
      : score >= this.configuration.reviewThreshold ? "review" : "ignored";
    const reasons = [
      `Nombre ${Math.round(name * 100)}%`,
      meters === undefined ? "Sin distancia comparable" : `Distancia ${Math.round(meters)} m`,
      `Dirección ${Math.round(address * 100)}%`,
      `Categoría ${Math.round(category * 100)}%`,
    ];
    return { id: [left.id, right.id].sort().join("::"), left, right, score, evidence, status, reasons };
  }

  resolve(entities: TerritorialEntity[]): IdentityResolutionResult {
    const canonical: CanonicalTerritorialEntity[] = [];
    const automaticMatches: IdentityMatch[] = [];
    const reviewMatches: IdentityMatch[] = [];
    const tokenIndex = new Map<string, Set<number>>();
    const spatialIndex = new Map<string, Set<number>>();

    const addToIndexes = (entity: TerritorialEntity, index: number) => {
      for (const token of tokens(normalizeIdentityName(entity.name))) {
        const entries = tokenIndex.get(token) ?? new Set<number>();
        entries.add(index);
        tokenIndex.set(token, entries);
      }
      if (entity.latitude !== undefined && entity.longitude !== undefined) {
        const key = `${Math.round(entity.latitude * 500)}:${Math.round(entity.longitude * 500)}`;
        const entries = spatialIndex.get(key) ?? new Set<number>();
        entries.add(index);
        spatialIndex.set(key, entries);
      }
    };

    for (const entity of entities) {
      let best: { index: number; match: IdentityMatch } | undefined;
      const candidates = new Set<number>();
      for (const token of tokens(normalizeIdentityName(entity.name))) {
        tokenIndex.get(token)?.forEach((index) => candidates.add(index));
      }
      if (entity.latitude !== undefined && entity.longitude !== undefined) {
        const latitudeCell = Math.round(entity.latitude * 500);
        const longitudeCell = Math.round(entity.longitude * 500);
        for (let latitudeOffset = -1; latitudeOffset <= 1; latitudeOffset += 1) {
          for (let longitudeOffset = -1; longitudeOffset <= 1; longitudeOffset += 1) {
            spatialIndex.get(`${latitudeCell + latitudeOffset}:${longitudeCell + longitudeOffset}`)
              ?.forEach((index) => candidates.add(index));
          }
        }
      }
      candidates.forEach((index) => {
        const candidate = canonical[index];
        const match = this.compare(candidate, entity);
        if (!best || match.score > best.match.score) best = { index, match };
      });
      if (best && best.match.status === "automatic") {
        automaticMatches.push(best.match);
        canonical[best.index] = this.merge(canonical[best.index], entity, best.match);
        addToIndexes(canonical[best.index], best.index);
      } else {
        if (best && best.match.status === "review") reviewMatches.push(best.match);
        canonical.push(asCanonical(entity));
        addToIndexes(entity, canonical.length - 1);
      }
    }
    return { entities: canonical, automaticMatches, reviewMatches };
  }

  merge(
    current: CanonicalTerritorialEntity,
    incoming: TerritorialEntity,
    match: IdentityMatch,
    action: "automatic_merge" | "manual_merge" = "automatic_merge",
  ): CanonicalTerritorialEntity {
    const primary = sourcePriority(incoming) > sourcePriority(current) ? incoming : current;
    const aliases = new Set([current.name, incoming.name, ...current.alternateNames]);
    aliases.delete(primary.name);
    return {
      ...current,
      ...primary,
      id: primary.id,
      alternateNames: [...aliases].sort(),
      externalIds: [...new Set([...current.externalIds, incoming.id])],
      sources: [...new Map([...current.sources, sourceOf(incoming)].map((source) => [source.externalId, source])).values()],
      notes: [...new Set([...current.notes, ...incoming.notes])],
      tags: [...new Set([...current.tags, ...incoming.tags])],
      metadata: { ...current.metadata, ...incoming.metadata },
      identityHistory: [
        ...current.identityHistory,
        { at: incoming.updatedAt, action, entityIds: [current.id, incoming.id], score: match.score },
      ],
    };
  }
}

type IdentityResolutionWeightsValue = Pick<IdentityEvidence, "name" | "location" | "address" | "category" | "externalId">;
