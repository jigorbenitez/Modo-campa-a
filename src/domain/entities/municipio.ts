import type { AuditMetadata, EntityId, MediaAsset, Metric } from "@/domain/shared/types";

export interface MunicipalityBranding {
  primaryColor?: string;
  secondaryColor?: string;
  logo?: MediaAsset;
  coatOfArms?: MediaAsset;
}

export interface MunicipalitySettings {
  timezone: string;
  locale: string;
  currency: string;
  enabledModules: string[];
  branding: MunicipalityBranding;
}

/** Agregado raíz que define el tenant y su información institucional. */
export interface Municipio {
  id: EntityId;
  name: string;
  legalName?: string;
  province: string;
  country: string;
  population?: number;
  areaKm2?: number;
  officialWebsite?: string;
  contactEmail?: string;
  neighborhoodIds: EntityId[];
  departmentIds: EntityId[];
  documentIds: EntityId[];
  indicators: Metric[];
  settings: MunicipalitySettings;
  active: boolean;
  audit: AuditMetadata;
}
