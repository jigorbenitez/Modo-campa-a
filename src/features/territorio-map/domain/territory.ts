import type { GeoPoint, ISODate, ISODateTime } from "@/domain/shared/types";

export type TerritoryLayerId =
  | "municipality"
  | "localities"
  | "streets"
  | "activities"
  | "problems"
  | "commitments"
  | "proposals"
  | "documents"
  | "institutions"
  | "neighborhoods"
  | "circuits"
  | "photos"
  | "schools"
  | "hospitals"
  | "health_centers"
  | "clubs"
  | "firefighters"
  | "police"
  | "libraries"
  | "cultural_centers"
  | "green_spaces"
  | "neighbors"
  | "custom_markers"
  | "heat";

export interface TerritoryLayer {
  id: TerritoryLayerId;
  label: string;
  description: string;
  color: string;
  enabledByDefault: boolean;
}

export type TerritoryFeatureKind =
  | "activity"
  | "problem"
  | "commitment"
  | "proposal"
  | "document"
  | "institution"
  | "photo";

export interface TerritoryRelatedItem {
  id: string;
  title: string;
  status?: string;
}

export interface TerritoryFeature {
  id: string;
  municipioId: string;
  layerId: Exclude<TerritoryLayerId, "municipality" | "localities" | "neighborhoods" | "circuits" | "streets" | "heat">;
  kind: TerritoryFeatureKind;
  subtype?: string;
  title: string;
  description: string;
  point: GeoPoint;
  barrioId: string;
  circuitId?: string;
  localidad: string;
  occurredAt: ISODateTime;
  status: string;
  updatedAt: ISODateTime;
  source: string;
  priority?: "low" | "medium" | "high" | "critical";
  participants: string[];
  problems: TerritoryRelatedItem[];
  commitments: TerritoryRelatedItem[];
  proposals: TerritoryRelatedItem[];
  documents: TerritoryRelatedItem[];
  publications: TerritoryRelatedItem[];
  photos: string[];
  videos: string[];
  history: Array<{ at: ISODateTime; label: string }>;
}

export interface TerritoryIndicator {
  label: string;
  value: string;
  context: string;
}

export interface TerritoryNeighborhood {
  id: string;
  municipioId: string;
  name: string;
  locality: string;
  description: string;
  center: GeoPoint;
  boundary: GeoPoint[];
  boundaries: GeoPoint[][];
  level: "locality" | "neighborhood";
  population: number;
  generalStatus: "stable" | "attention" | "priority";
  indicators: TerritoryIndicator[];
  updatedAt: ISODateTime;
  source: string;
}

export interface TerritoryCircuit {
  id: string;
  municipioId: string;
  code: string;
  name: string;
  center: GeoPoint;
  boundaries: GeoPoint[][];
  updatedAt: ISODateTime;
  source: string;
  sourceUrl: string;
  license: string;
}

export interface TerritoryPeriod {
  id: string;
  label: string;
  cutoff: ISODate;
}

export interface TerritorySnapshot {
  municipioId: string;
  municipalityName: string;
  center: GeoPoint;
  municipalityBoundaries: GeoPoint[][];
  layers: TerritoryLayer[];
  neighborhoods: TerritoryNeighborhood[];
  circuits: TerritoryCircuit[];
  features: TerritoryFeature[];
  periods: TerritoryPeriod[];
}

export interface TerritoryFilters {
  periodId: string;
  enabledLayers: Set<TerritoryLayerId>;
  selectedNeighborhoodId?: string;
  selectedCircuitId?: string;
  search?: string;
  category?: string;
}

export interface TerritoryStatsView {
  activeNeighborhoods: number;
  openProblems: number;
  pendingCommitments: number;
  weeklyActivity: number;
  latestTour?: { title: string; occurredAt: ISODateTime };
}

export interface NeighborhoodContextView {
  neighborhood: TerritoryNeighborhood;
  latestActivity?: TerritoryFeature;
  tours: number;
  activeProblems: number;
  commitments: number;
  proposals: number;
  documents: number;
  publications: number;
  schools: number;
  kindergartens: number;
  clubs: number;
  squares: number;
  healthCenters: number;
  institutions: number;
  activities: number;
  photos: number;
  latestTours: TerritoryFeature[];
  features: TerritoryFeature[];
}

export interface TerritoryHeatPoint {
  barrioId: string;
  point: GeoPoint;
  intensity: number;
  activityCount: number;
  problemCount: number;
  commitmentCount: number;
}

export interface TerritoryCircuitContextView {
  circuit: TerritoryCircuit;
  features: TerritoryFeature[];
  activities: number;
  problems: number;
  commitments: number;
  institutions: number;
  neighbors: number;
  schools: number;
  clubs: number;
  hospitals: number;
  healthCenters: number;
  tours: number;
  proposals: number;
  documents: number;
  photos: number;
}

export interface TerritoryView {
  cutoff: ISODate;
  visibleFeatures: TerritoryFeature[];
  visibleNeighborhoods: TerritoryNeighborhood[];
  visibleCircuits: TerritoryCircuit[];
  stats: TerritoryStatsView;
  selectedNeighborhood?: NeighborhoodContextView;
  selectedCircuit?: TerritoryCircuitContextView;
  heatPoints: TerritoryHeatPoint[];
}
