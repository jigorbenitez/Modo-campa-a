import type { TerritorialEntity } from "@/features/territorial-engine/domain";
import type { EnrichmentCoverage, EnrichmentProvider, EnrichmentRepository, EnrichmentRun } from "../domain/enrichment";

const priority: Record<string, number> = { hospital: 0, primary_care_center: 1, school: 2, kindergarten: 3, club: 5, square: 6, municipal_office: 7, institution: 8 };

export class TerritorialEnrichmentEngine {
  private readonly providers: EnrichmentProvider[];
  private readonly repository: EnrichmentRepository;
  private readonly now: () => Date;
  constructor(providers: EnrichmentProvider[], repository: EnrichmentRepository, now = () => new Date()) {
    this.providers = providers;
    this.repository = repository;
    this.now = now;
  }

  async enrich(municipalityId: string): Promise<EnrichmentRun> {
    const startedAt = this.now().toISOString();
    const entities = (await this.repository.listEntities(municipalityId)).sort((a, b) => (priority[a.type] ?? 4) - (priority[b.type] ?? 4));
    const settled = await Promise.allSettled(entities.flatMap((entity) => this.providers.map((provider) => provider.enrich(entity, startedAt))));
    const candidates = settled.flatMap((result) => result.status === "fulfilled" ? result.value : []);
    const run: EnrichmentRun = {
      municipalityId,
      startedAt,
      finishedAt: this.now().toISOString(),
      entitiesReviewed: entities.length,
      entitiesEnriched: new Set(candidates.filter((item) => item.status === "applied").map((item) => item.entityId)).size,
      applied: candidates.filter((item) => item.status === "applied").length,
      conflicts: candidates.filter((item) => item.status === "conflict").length,
      rejected: candidates.filter((item) => item.status === "rejected").length,
      sources: [...new Set(candidates.map((item) => item.source.name))],
      candidates,
    };
    await this.repository.saveRun(run);
    return run;
  }
}

export function calculateEnrichmentCoverage(entity: TerritorialEntity): EnrichmentCoverage {
  const values = {
    address: entity.address?.formatted, phone: entity.phone, email: entity.email, website: entity.website,
    photo: entity.metadata.photo, openingHours: entity.openingHours, responsibleOrganization: entity.metadata.responsibleOrganization,
    neighborhood: entity.neighborhoodName, locality: entity.localityName, electoralCircuit: entity.metadata.electoralCircuit,
  };
  const populated = Object.entries(values).filter(([, value]) => value !== undefined && value !== "");
  const fields = Object.fromEntries(Object.keys(values).map((key) => [key, values[key as keyof typeof values] ? 100 : 0])) as EnrichmentCoverage["fields"];
  const classification = Number((entity.metadata.classification as { confidence?: number } | undefined)?.confidence ?? 0.5);
  return { total: Object.keys(values).length, completeness: Math.round(populated.length / Object.keys(values).length * 100), quality: Math.round(classification * 100), fields, missing: Object.entries(values).flatMap(([key, value]) => value ? [] : [key]) };
}

export function validateEnrichmentData(entity: TerritorialEntity) {
  const issues: string[] = [];
  if (entity.phone && !/^\+?[\d\s().-]{7,24}$/.test(entity.phone)) issues.push("Teléfono inválido");
  if (entity.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entity.email)) issues.push("Email inválido");
  if (entity.website) { try { new URL(entity.website); } catch { issues.push("URL inválida"); } }
  if ((entity.latitude === undefined) !== (entity.longitude === undefined)) issues.push("Coordenadas inconsistentes");
  return issues;
}
