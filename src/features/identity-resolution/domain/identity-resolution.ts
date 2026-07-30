import type { TerritorialEntity } from "@/features/territorial-engine/domain";

export interface IdentityResolutionWeights {
  name: number;
  location: number;
  address: number;
  category: number;
  externalId: number;
}

export interface IdentityResolutionConfiguration {
  weights: IdentityResolutionWeights;
  automaticThreshold: number;
  reviewThreshold: number;
  maximumDistanceMeters: number;
}

export interface IdentityEvidence {
  name: number;
  location: number;
  address: number;
  category: number;
  externalId: number;
  distanceMeters?: number;
}

export interface IdentityMatch {
  id: string;
  left: TerritorialEntity;
  right: TerritorialEntity;
  score: number;
  evidence: IdentityEvidence;
  status: "automatic" | "review" | "ignored";
  reasons: string[];
}

export interface CanonicalTerritorialEntity extends TerritorialEntity {
  alternateNames: string[];
  externalIds: string[];
  sources: Array<{
    name: string;
    url?: string;
    license?: string;
    externalId: string;
  }>;
  identityHistory: Array<{
    at: string;
    action: "created" | "automatic_merge" | "manual_merge" | "ignored";
    entityIds: string[];
    score?: number;
  }>;
}

export interface IdentityResolutionResult {
  entities: CanonicalTerritorialEntity[];
  automaticMatches: IdentityMatch[];
  reviewMatches: IdentityMatch[];
}

