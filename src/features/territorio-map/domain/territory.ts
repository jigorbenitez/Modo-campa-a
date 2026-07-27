import type { GeoPoint, ISODate, ISODateTime } from "@/domain/shared/types";

export type TerritoryLayerId =
  | "activities"
  | "problems"
  | "commitments"
  | "proposals"
  | "documents"
  | "institutions"
  | "neighborhoods"
  | "photos"
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
  layerId: Exclude<TerritoryLayerId, "neighborhoods" | "heat">;
  kind: TerritoryFeatureKind;
  subtype?: string;
  title: string;
  description: string;
  point: GeoPoint;
  barrioId: string;
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
  population: number;
  generalStatus: "stable" | "attention" | "priority";
  indicators: TerritoryIndicator[];
  updatedAt: ISODateTime;
  source: string;
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
  layers: TerritoryLayer[];
  neighborhoods: TerritoryNeighborhood[];
  features: TerritoryFeature[];
  periods: TerritoryPeriod[];
}

export interface TerritoryFilters {
  periodId: string;
  enabledLayers: Set<TerritoryLayerId>;
  selectedNeighborhoodId?: string;
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

export interface TerritoryView {
  cutoff: ISODate;
  visibleFeatures: TerritoryFeature[];
  visibleNeighborhoods: TerritoryNeighborhood[];
  stats: TerritoryStatsView;
  selectedNeighborhood?: NeighborhoodContextView;
  heatPoints: TerritoryHeatPoint[];
}
