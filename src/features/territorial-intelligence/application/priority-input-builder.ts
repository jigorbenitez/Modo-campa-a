import type { TerritoryFeature, TerritorySnapshot } from "@/features/territorio-map";
import type { PriorityInput, TerritorialCoverage } from "../domain";

function daysSinceLastTour(features: TerritoryFeature[], referenceDate: string) {
  const latest = features.filter((feature) => feature.kind === "activity").sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];
  return latest ? Math.max(0, Math.floor((new Date(referenceDate).getTime() - new Date(latest.occurredAt).getTime()) / 86_400_000)) : 365;
}

function buildVariables(features: TerritoryFeature[], coverage: number, referenceDate: string): PriorityInput["variables"] {
  const reference = new Date(referenceDate).getTime();
  const institutions = features.filter((feature) => feature.kind === "institution");
  return {
    daysSinceLastTour: daysSinceLastTour(features, referenceDate),
    openCommitments: features.filter((feature) => feature.kind === "commitment" && feature.status !== "completed").length,
    overdueCommitments: features.filter((feature) => feature.kind === "commitment" && feature.status === "overdue").length,
    pendingProposals: features.filter((feature) => feature.kind === "proposal" && feature.status !== "completed").length,
    coverageGap: 100 - coverage,
    unvisitedInstitutions: institutions.filter((institution) => !institution.history.some((item) => /visit|relev/i.test(item.label))).length,
    pendingDocuments: institutions.filter((institution) => institution.documents.length === 0).length,
    pendingPhotos: institutions.filter((institution) => institution.photos.length === 0).length,
    recentActivity: features.filter((feature) => reference - new Date(feature.occurredAt).getTime() <= 30 * 86_400_000).length,
    upcomingEvents: features.filter((feature) => new Date(feature.occurredAt).getTime() > reference).length,
    openAlerts: features.filter((feature) => feature.priority === "critical" || feature.priority === "high").length,
    registeredProblems: features.filter((feature) => feature.kind === "problem" && feature.status !== "completed").length,
  };
}

export function buildPriorityInputs(snapshot: TerritorySnapshot, coverages: TerritorialCoverage[], referenceDate: string): PriorityInput[] {
  const areaInputs = snapshot.neighborhoods.map((area) => {
    const features = snapshot.features.filter((feature) => feature.barrioId === area.id);
    const coverage = coverages.find((item) => item.entityId === area.id)?.percentage ?? 0;
    return { entityId: area.id, entityName: area.name, entityType: area.level, location: area.center, relatedIds: features.map((feature) => feature.id), variables: buildVariables(features, coverage, referenceDate) };
  });
  const circuitInputs = snapshot.circuits.map((circuit) => {
    const features = snapshot.features.filter((feature) => feature.circuitId === circuit.id);
    const coverage = coverages.find((item) => item.entityId === circuit.id)?.percentage ?? 0;
    return { entityId: circuit.id, entityName: circuit.name, entityType: "circuit", location: circuit.center, relatedIds: features.map((feature) => feature.id), variables: buildVariables(features, coverage, referenceDate) };
  });
  const institutionInputs = snapshot.features.filter((feature) => feature.kind === "institution").map((institution) => {
    const coverage = coverages.find((item) => item.entityId === institution.barrioId)?.percentage ?? 0;
    return { entityId: institution.id, entityName: institution.title, entityType: institution.subtype ?? "institution", location: institution.point, relatedIds: [institution.barrioId, ...(institution.circuitId ? [institution.circuitId] : [])], variables: buildVariables([institution], coverage, referenceDate) };
  });
  return [...areaInputs, ...circuitInputs, ...institutionInputs];
}
