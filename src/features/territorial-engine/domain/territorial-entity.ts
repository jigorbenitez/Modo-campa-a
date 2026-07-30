export const territorialEntityTypes = [
  "locality",
  "neighborhood",
  "school",
  "kindergarten",
  "university",
  "club",
  "hospital",
  "primary_care_center",
  "health_center",
  "square",
  "municipal_office",
  "institution",
  "organization",
  "public_space",
  "station",
  "transport_line",
  "transport_stop",
  "relevant_business",
  "shopping_center",
  "religious_place",
  "point_of_interest",
] as const;

export type TerritorialEntityType = (typeof territorialEntityTypes)[number];
export type TerritorialEntityStatus = "active" | "inactive" | "pending_review" | "archived";

export interface TerritorialAddress {
  street?: string;
  number?: string;
  floor?: string;
  postalCode?: string;
  formatted?: string;
}

export interface TerritorialOpeningHours {
  timezone: string;
  schedule: Array<{
    day: number;
    opens?: string;
    closes?: string;
    closed?: boolean;
  }>;
  notes?: string;
}

/**
 * Agregado independiente para lugares y recursos territoriales.
 * Las relaciones operativas viven fuera de la entidad para evitar acoplarla
 * a Actividad, Persona, Documento u otros agregados existentes.
 */
export interface TerritorialEntity {
  id: string;
  municipalityId: string;
  name: string;
  alternateNames?: string[];
  externalIds?: string[];
  sources?: Array<{ name: string; url?: string; license?: string; externalId: string }>;
  identityHistory?: Array<{
    at: string;
    action: "created" | "automatic_merge" | "manual_merge" | "ignored";
    entityIds: string[];
    score?: number;
  }>;
  type: TerritorialEntityType;
  category: string;
  subcategory?: string;
  description?: string;
  address?: TerritorialAddress;
  latitude?: number;
  longitude?: number;
  localityId?: string;
  localityName?: string;
  neighborhoodId?: string;
  neighborhoodName?: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: TerritorialOpeningHours;
  notes: string[];
  tags: string[];
  status: TerritorialEntityStatus;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

export type TerritorialRelationTarget =
  | "person"
  | "meeting"
  | "tour"
  | "activity"
  | "problem"
  | "project"
  | "photo"
  | "document"
  | "commitment"
  | "campaign"
  | "event";

export interface TerritorialRelationReference {
  territorialEntityId: string;
  targetType: TerritorialRelationTarget;
  targetId: string;
  relationType: string;
  metadata?: Record<string, unknown>;
}
