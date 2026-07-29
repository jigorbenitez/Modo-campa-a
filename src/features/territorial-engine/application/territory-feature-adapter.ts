import type { TerritoryCircuit, TerritoryFeature, TerritoryNeighborhood } from "@/features/territorio-map";
import type { TerritorialEntity } from "../domain";

const layerByCategory: Record<string, TerritoryFeature["layerId"]> = {
  school: "schools",
  kindergarten: "schools",
  university: "schools",
  hospital: "hospitals",
  primary_care_center: "health_centers",
  police: "police",
  fire_station: "firefighters",
  club: "clubs",
  square: "green_spaces",
  park: "green_spaces",
};
const subtypeByCategory: Record<string, string> = {
  school: "Escuela",
  kindergarten: "Jardín",
  university: "Universidad",
  hospital: "Hospital",
  primary_care_center: "CAPS",
  police: "Policía",
  fire_station: "Bomberos",
  club: "Club",
  square: "Plaza",
  park: "Espacio verde",
  municipal_office: "Dependencia municipal",
  station: "Estación de tren",
  point_of_interest: "Punto de interés",
};

function pointInRing(
  point: { latitude: number; longitude: number },
  ring: Array<{ latitude: number; longitude: number }>,
) {
  let inside = false;
  for (let current = 0, previous = ring.length - 1; current < ring.length; previous = current++) {
    const a = ring[current];
    const b = ring[previous];
    const intersects =
      a.latitude > point.latitude !== b.latitude > point.latitude
      && point.longitude < ((b.longitude - a.longitude) * (point.latitude - a.latitude))
        / (b.latitude - a.latitude) + a.longitude;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function territorialEntityToMapFeature(
  entity: TerritorialEntity,
  neighborhoods: TerritoryNeighborhood[],
  circuits: TerritoryCircuit[],
): TerritoryFeature | null {
  if (!Number.isFinite(entity.latitude) || !Number.isFinite(entity.longitude)) return null;
  const point = { latitude: entity.latitude!, longitude: entity.longitude! };
  const area = neighborhoods.find((item) =>
    item.boundaries?.some((ring) => pointInRing(point, ring))
    || pointInRing(point, item.boundary),
  );
  const circuit = circuits.find((item) =>
    item.boundaries.some((ring) => pointInRing(point, ring)),
  );
  return {
    id: entity.id,
    municipioId: entity.municipalityId,
    layerId: layerByCategory[entity.category] ?? "institutions",
    kind: "institution",
    subtype: subtypeByCategory[entity.category] ?? entity.category,
    title: entity.name,
    description: entity.description ?? "",
    point,
    barrioId: area?.id ?? entity.municipalityId,
    circuitId: circuit?.id,
    localidad: area?.locality ?? entity.localityName ?? "San Fernando",
    occurredAt: entity.updatedAt,
    status: entity.status,
    updatedAt: entity.updatedAt,
    source: String(entity.metadata.source ?? "Repositorio territorial"),
    sourceUrl: typeof entity.metadata.sourceUrl === "string" ? entity.metadata.sourceUrl : undefined,
    confidence: ["verified", "high", "medium", "low"].includes(String(entity.metadata.confidence))
      ? entity.metadata.confidence as TerritoryFeature["confidence"]
      : "low",
    participants: [],
    problems: [],
    commitments: [],
    proposals: [],
    documents: [],
    publications: [],
    photos: [],
    videos: [],
    history: [{ at: entity.updatedAt, label: "Sincronizado en el repositorio territorial" }],
  };
}
