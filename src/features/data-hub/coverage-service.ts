import type { TerritoryFeature, TerritoryNeighborhood, TerritorySnapshot } from "@/features/territorio-map";

export interface DataCoverageIndicator {
  id: string;
  label: string;
  percentage: number;
  loadedRecords: number;
  completeRecords: number;
  scope: "record-quality";
  explanation: string;
}

function completeFeature(feature: TerritoryFeature) {
  return Boolean(
    feature.id &&
    feature.title &&
    feature.localidad &&
    feature.source &&
    Number.isFinite(feature.point.latitude) &&
    Number.isFinite(feature.point.longitude),
  );
}

function completeBoundary(area: TerritoryNeighborhood) {
  return Boolean(area.id && area.name && area.locality && area.source && area.boundaries.length);
}

function indicator(id: string, label: string, records: TerritoryFeature[] | TerritoryNeighborhood[]): DataCoverageIndicator {
  const completeRecords = records.filter((record) =>
    "point" in record ? completeFeature(record) : completeBoundary(record),
  ).length;
  return {
    id,
    label,
    percentage: records.length ? Math.round((completeRecords / records.length) * 100) : 0,
    loadedRecords: records.length,
    completeRecords,
    scope: "record-quality",
    explanation: records.length
      ? "Porcentaje de registros cargados con identidad, ubicación y fuente completas."
      : "Sin dataset aceptado; ATIY no estima un universo inexistente.",
  };
}

export class TerritorialDataCoverageService {
  calculate(snapshot: TerritorySnapshot): DataCoverageIndicator[] {
    const institutions = snapshot.features.filter((feature) => feature.kind === "institution");
    const subtype = (terms: string[]) => institutions.filter((feature) => terms.some((term) => feature.subtype?.toLocaleLowerCase("es-AR").includes(term)));
    return [
      indicator("areas", "Localidades y barrios", snapshot.neighborhoods),
      indicator("schools", "Escuelas y jardines", subtype(["escuela", "jardín"])),
      indicator("hospitals", "Hospitales y CAPS", subtype(["hospital", "caps", "centro de salud"])),
      indicator("clubs", "Clubes y polideportivos", subtype(["club", "polideportivo"])),
      indicator("squares", "Plazas y espacios verdes", subtype(["plaza", "espacio verde"])),
      indicator("institutions", "Instituciones", institutions),
    ];
  }
}
