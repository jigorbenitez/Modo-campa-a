import type { TerritorialEntity, TerritorialEntityType } from "../domain";

export type TerritorialMapLayerGroup =
  | "education"
  | "health"
  | "community"
  | "public_space"
  | "transport"
  | "commerce"
  | "government"
  | "places";

export interface TerritorialMapLayer {
  id: TerritorialMapLayerGroup;
  label: string;
  colorToken: string;
  iconKey: string;
}

export interface TerritorialMapPoint {
  id: string;
  entityId: string;
  layerId: TerritorialMapLayerGroup;
  latitude: number;
  longitude: number;
  title: string;
  type: TerritorialEntityType;
  iconKey: string;
}

export interface TerritorialCluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  pointIds: string[];
}

export interface TerritorialClusterStrategy {
  cluster(points: TerritorialMapPoint[], zoom: number): TerritorialCluster[];
}

const layerByType: Record<TerritorialEntityType, TerritorialMapLayerGroup> = {
  locality: "places",
  neighborhood: "places",
  school: "education",
  kindergarten: "education",
  university: "education",
  club: "community",
  hospital: "health",
  primary_care_center: "health",
  health_center: "health",
  square: "public_space",
  municipal_office: "government",
  institution: "community",
  organization: "community",
  public_space: "public_space",
  station: "transport",
  transport_line: "transport",
  transport_stop: "transport",
  relevant_business: "commerce",
  shopping_center: "commerce",
  religious_place: "places",
  point_of_interest: "places",
};

export const territorialMapLayers: TerritorialMapLayer[] = [
  { id: "education", label: "Educación", colorToken: "--territory-education", iconKey: "graduation-cap" },
  { id: "health", label: "Salud", colorToken: "--territory-health", iconKey: "cross" },
  { id: "community", label: "Comunidad", colorToken: "--territory-community", iconKey: "landmark" },
  { id: "public_space", label: "Espacio público", colorToken: "--territory-public-space", iconKey: "trees" },
  { id: "transport", label: "Transporte", colorToken: "--territory-transport", iconKey: "bus" },
  { id: "commerce", label: "Comercio", colorToken: "--territory-commerce", iconKey: "store" },
  { id: "government", label: "Municipio", colorToken: "--territory-government", iconKey: "building" },
  { id: "places", label: "Lugares", colorToken: "--territory-places", iconKey: "map-pin" },
];

export class TerritorialMapProjectionService {
  project(entities: TerritorialEntity[]): TerritorialMapPoint[] {
    return entities.flatMap((entity) => {
      if (entity.latitude === undefined || entity.longitude === undefined) return [];
      const layerId = layerByType[entity.type];
      const layer = territorialMapLayers.find((item) => item.id === layerId);
      return [{
        id: `territorial-point:${entity.id}`,
        entityId: entity.id,
        layerId,
        latitude: entity.latitude,
        longitude: entity.longitude,
        title: entity.name,
        type: entity.type,
        iconKey: layer?.iconKey ?? "map-pin",
      }];
    });
  }

  suggestedZoom(points: TerritorialMapPoint[]): number {
    if (points.length === 0) return 12;
    if (points.length === 1) return 16;
    const latitudes = points.map((point) => point.latitude);
    const longitudes = points.map((point) => point.longitude);
    const span = Math.max(
      Math.max(...latitudes) - Math.min(...latitudes),
      Math.max(...longitudes) - Math.min(...longitudes),
    );
    if (span < 0.01) return 15;
    if (span < 0.05) return 13;
    if (span < 0.2) return 11;
    return 9;
  }
}
