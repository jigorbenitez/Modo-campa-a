import type { TerritoryFeature, TerritorySnapshot } from "@/features/territorio-map";
import type { CoverageFactor, CoverageLevel, TerritorialCoverage } from "../domain";

const factorDefinitions = [
  { id: "recentTours", label: "Recorridas recientes", weight: 30 },
  { id: "surveyedInstitutions", label: "Instituciones relevadas", weight: 20 },
  { id: "activeCommitments", label: "Compromisos activos", weight: 10 },
  { id: "documents", label: "Documentación", weight: 15 },
  { id: "photos", label: "Fotografías", weight: 10 },
  { id: "recentActivity", label: "Actividad reciente", weight: 15 },
] as const;

function levelFor(percentage: number): CoverageLevel {
  if (percentage >= 85) return "excellent";
  if (percentage >= 70) return "good";
  if (percentage >= 50) return "medium";
  if (percentage >= 25) return "low";
  return "critical";
}

function calculateFactors(features: TerritoryFeature[], referenceDate: string): CoverageFactor[] {
  const reference = new Date(referenceDate).getTime();
  const recent = features.filter((feature) => reference - new Date(feature.occurredAt).getTime() <= 60 * 86_400_000);
  const tours = recent.filter((feature) => feature.kind === "activity");
  const institutions = features.filter((feature) => feature.kind === "institution");
  const surveyed = institutions.filter((feature) => feature.documents.length || feature.photos.length || feature.history.some((item) => /visit|relev/i.test(item.label)));
  const commitments = features.filter((feature) => feature.kind === "commitment" && feature.status !== "completed");
  const documents = features.reduce((total, feature) => total + feature.documents.length + (feature.kind === "document" ? 1 : 0), 0);
  const photos = features.reduce((total, feature) => total + feature.photos.length + (feature.kind === "photo" ? 1 : 0), 0);
  const completions = {
    recentTours: Math.min(1, tours.length / 2),
    surveyedInstitutions: institutions.length ? surveyed.length / institutions.length : 0,
    activeCommitments: Math.min(1, commitments.length / 3),
    documents: Math.min(1, documents / 3),
    photos: Math.min(1, photos / 4),
    recentActivity: Math.min(1, recent.length / 5),
  };
  const evidence = {
    recentTours: `${tours.length} recorridas en los últimos 60 días`,
    surveyedInstitutions: `${surveyed.length} de ${institutions.length} instituciones con evidencia`,
    activeCommitments: `${commitments.length} compromisos activos`,
    documents: `${documents} documentos vinculados`,
    photos: `${photos} fotografías vinculadas`,
    recentActivity: `${recent.length} elementos con actividad reciente`,
  };
  return factorDefinitions.map((definition) => {
    const completion = completions[definition.id];
    return { ...definition, completion, contribution: completion * definition.weight, evidence: evidence[definition.id] };
  });
}

export class TerritorialCoverageService {
  calculate(snapshot: TerritorySnapshot, referenceDate: string): TerritorialCoverage[] {
    const areaCoverage = snapshot.neighborhoods.map((area) =>
      this.calculateOne(area.id, area.name, area.level, snapshot.features.filter((feature) => feature.barrioId === area.id), referenceDate),
    );
    const circuitCoverage = snapshot.circuits.map((circuit) =>
      this.calculateOne(circuit.id, circuit.name, "circuit", snapshot.features.filter((feature) => feature.circuitId === circuit.id), referenceDate),
    );
    return [...areaCoverage, ...circuitCoverage];
  }

  private calculateOne(entityId: string, entityName: string, entityType: TerritorialCoverage["entityType"], features: TerritoryFeature[], referenceDate: string): TerritorialCoverage {
    const factors = calculateFactors(features, referenceDate);
    const percentage = Math.round(factors.reduce((total, factor) => total + factor.contribution, 0));
    return { entityId, entityName, entityType, percentage, level: levelFor(percentage), factors, calculatedAt: referenceDate };
  }
}
