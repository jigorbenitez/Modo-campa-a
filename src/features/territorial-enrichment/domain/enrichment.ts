import type { TerritorialEntity } from "@/features/territorial-engine/domain";

export const enrichmentFields = [
  "address", "street", "number", "postalCode", "locality", "neighborhood", "electoralCircuit",
  "phone", "email", "website", "openingHours", "responsibleOrganization", "photo", "socialProfiles",
  "institutionalDetails", "alternateNames", "sourceUpdatedAt", "metadata",
] as const;

export type EnrichmentField = (typeof enrichmentFields)[number];
export type EnrichmentStatus = "applied" | "conflict" | "rejected";

export interface EnrichmentSource {
  name: string;
  url?: string;
  license: string;
  retrievedAt: string;
  confidence: number;
  externalId?: string;
}

export interface EnrichmentCandidate {
  id: string;
  entityId: string;
  field: EnrichmentField;
  previousValue?: unknown;
  proposedValue: unknown;
  status: EnrichmentStatus;
  source: EnrichmentSource;
  reason: string;
}

export interface EnrichmentRun {
  municipalityId: string;
  startedAt: string;
  finishedAt: string;
  entitiesReviewed: number;
  entitiesEnriched: number;
  applied: number;
  conflicts: number;
  rejected: number;
  sources: string[];
  candidates: EnrichmentCandidate[];
}

export interface EnrichmentCoverage {
  total: number;
  quality: number;
  completeness: number;
  fields: Record<"address" | "phone" | "email" | "website" | "photo" | "openingHours" | "responsibleOrganization" | "neighborhood" | "locality" | "electoralCircuit", number>;
  missing: string[];
}

export interface EnrichmentProvider {
  id: string;
  enrich(entity: TerritorialEntity, now: string): Promise<EnrichmentCandidate[]> | EnrichmentCandidate[];
}

export interface EnrichmentRepository {
  listEntities(municipalityId: string): Promise<TerritorialEntity[]>;
  saveRun(run: EnrichmentRun): Promise<void>;
}
