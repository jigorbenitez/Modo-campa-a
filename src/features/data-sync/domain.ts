export type SyncFormat = "geojson" | "csv" | "shapefile" | "geopackage" | "kml" | "osmjson";
export type SyncFrequency = "manual" | "daily" | "weekly" | "monthly";
export type ConfidenceLevel = "verified" | "high" | "medium" | "low";
export type DatasetCategory =
  | "municipality" | "locality" | "neighborhood" | "electoral_circuit"
  | "school" | "kindergarten" | "university" | "hospital" | "primary_care_center"
  | "police" | "fire_station" | "club" | "square" | "park" | "station"
  | "main_street" | "municipal_office" | "public_institution" | "point_of_interest";

export interface MunicipalitySelection {
  municipalityId: string;
  municipalityName: string;
  provinceId: string;
  provinceName: string;
  georefId?: string;
  bounds?: [number, number, number, number];
}

export interface DiscoveredDataset {
  id: string;
  connectorId: string;
  name: string;
  category: DatasetCategory;
  downloadUrl: string;
  sourcePageUrl: string;
  publisher: string;
  license: string;
  format: SyncFormat;
  version: string;
  publishedAt?: string;
  confidence: ConfidenceLevel;
}

export interface NormalizedFeature {
  externalId: string;
  category: DatasetCategory;
  name: string;
  geometry: Record<string, unknown> | null;
  properties: Record<string, unknown>;
  sourceDatasetId: string;
  fingerprint: string;
}

export interface DatasetVersion {
  id: string;
  municipalityId: string;
  dataset: DiscoveredDataset;
  checkedAt: string;
  checksum: string;
  features: NormalizedFeature[];
  errors: SyncIssue[];
}

export interface SyncIssue {
  code: string;
  message: string;
  severity: "warning" | "error";
  recordId?: string;
}

export interface SyncDelta {
  added: NormalizedFeature[];
  updated: NormalizedFeature[];
  removed: NormalizedFeature[];
  unchanged: number;
}

export interface DatasetSyncResult {
  dataset: DiscoveredDataset;
  status: "updated" | "unchanged" | "failed" | "unavailable";
  delta: SyncDelta;
  imported: number;
  discarded: number;
  issues: SyncIssue[];
}

export interface TerritorialSyncRun {
  id: string;
  municipalityId: string;
  startedAt: string;
  finishedAt: string;
  status: "completed" | "partial" | "failed";
  results: DatasetSyncResult[];
  coverage: SyncCoverage[];
}

export interface SyncCoverage {
  category: DatasetCategory;
  loaded: number;
  estimated: number | null;
  percentage: number | null;
  source: string | null;
  checkedAt: string;
  status: "measured" | "pending_manual";
}
