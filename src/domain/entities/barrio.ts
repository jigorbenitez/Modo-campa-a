import type { AuditMetadata, EntityId, MediaAsset, Metric, TenantScoped } from "@/domain/shared/types";

export interface DemographicProfile {
  population?: number;
  households?: number;
  averageAge?: number;
  densityPerKm2?: number;
  notes?: string;
  sourceDocumentIds: EntityId[];
}

export interface TerritorialMap {
  center?: { latitude: number; longitude: number };
  geoJsonReference?: string;
  boundaryDescription?: string;
}

/** Unidad territorial rica; nunca debe reducirse a una etiqueta de navegación. */
export interface Barrio extends TenantScoped {
  id: EntityId;
  name: string;
  description?: string;
  areaKm2?: number;
  map?: TerritorialMap;
  demographics: DemographicProfile;
  problemIds: EntityId[];
  strengths: string[];
  projectIds: EntityId[];
  tourIds: EntityId[];
  contactIds: EntityId[];
  photos: MediaAsset[];
  indicators: Metric[];
  documentIds: EntityId[];
  tags: string[];
  active: boolean;
  audit: AuditMetadata;
}
