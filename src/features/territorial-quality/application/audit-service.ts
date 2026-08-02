import type { TerritorialEntity } from "@/features/territorial-engine/domain";
import { IdentityResolutionEngine } from "@/features/identity-resolution";
import { categoryLabel, territorialTaxonomy, type TerritorialCategoryId } from "../domain/taxonomy";
import { entitySource, type TerritorialAuditReport, type TerritorialCoverageMetric, type TerritorialQualityIssue } from "../domain/audit";
import { TerritorialClassificationEngine } from "./classification-engine";
import municipalityBoundary from "@/data/san-fernando-municipality-from-circuits.json";

type Position = [number, number];
const municipalityPolygons = municipalityBoundary.features[0]?.geometry.coordinates ?? [];

function pointInRing(point: Position, ring: number[][]): boolean {
  let inside = false;
  for (let current = 0, previous = ring.length - 1; current < ring.length; previous = current++) {
    const [currentX, currentY] = ring[current];
    const [previousX, previousY] = ring[previous];
    const intersects = currentY > point[1] !== previousY > point[1]
      && point[0] < ((previousX - currentX) * (point[1] - currentY)) / (previousY - currentY) + currentX;
    if (intersects) inside = !inside;
  }
  return inside;
}

function belongsToMunicipality(longitude: number, latitude: number): boolean {
  return municipalityPolygons.some((polygon) => {
    const [outerRing, ...holes] = polygon;
    return pointInRing([longitude, latitude], outerRing)
      && !holes.some((hole) => pointInRing([longitude, latitude], hole));
  });
}

export class TerritorialAuditService {
  audit(entities: TerritorialEntity[], generatedAt = new Date().toISOString()): TerritorialAuditReport {
    const issues: TerritorialQualityIssue[] = [];
    const classifier = new TerritorialClassificationEngine();
    const identity = new IdentityResolutionEngine().resolve(entities);
    identity.reviewMatches.forEach((match) => issues.push({ id: `duplicate:${match.id}`, entityId: match.left.id, type: "duplicate", severity: "medium", message: `Posible coincidencia con ${match.right.name} (${Math.round(match.score * 100)}%).`, suggestion: "Revisar identidad." }));
    for (const entity of entities) {
      if (!entity.name.trim() || /\s{2,}/.test(entity.name)) issues.push(this.issue(entity, "name", "low", "Nombre vacío o con espacios inconsistentes.", "Normalizar nombre."));
      if (entity.name === entity.name.toLocaleUpperCase("es-AR") && entity.name.length > 4) issues.push(this.issue(entity, "name", "low", "Nombre completamente en mayúsculas.", "Aplicar capitalización editorial."));
      if (entity.latitude === undefined || entity.longitude === undefined || !Number.isFinite(entity.latitude) || !Number.isFinite(entity.longitude)) issues.push(this.issue(entity, "coordinates", "high", "Entidad sin coordenadas válidas."));
      else if (!belongsToMunicipality(entity.longitude, entity.latitude)) issues.push(this.issue(entity, "outside", "high", "Coordenadas fuera de la geometría municipal disponible.", "Revisar contra la geometría municipal derivada de circuitos oficiales."));
      if (!entity.address?.formatted) issues.push(this.issue(entity, "address", "medium", "Dirección no informada."));
      if (!entitySource(entity)) issues.push(this.issue(entity, "source", "high", "Fuente no informada."));
      if (!entity.category || !(entity.category in territorialTaxonomy)) issues.push(this.issue(entity, "category", "high", "Categoría ausente o fuera de la taxonomía."));
      const suggestion = classifier.classify(entity);
      if (suggestion.category !== entity.category && suggestion.confidence >= 0.8) issues.push(this.issue(entity, "classification", "medium", `Clasificación sugerida: ${categoryLabel(suggestion.category)}.`, suggestion.reason));
    }
    const coverage = this.coverage(entities, issues);
    const criticalWeight = issues.reduce((sum, issue) => sum + (issue.severity === "high" ? 3 : issue.severity === "medium" ? 1 : 0.25), 0);
    const qualityScore = entities.length ? Math.max(0, Math.round((1 - criticalWeight / (entities.length * 6)) * 100)) : 0;
    return { generatedAt, entities: entities.length, qualityScore, issues, coverage, correctedClassifications: entities.filter((entity) => entity.metadata.sourceCategory && entity.metadata.sourceCategory !== entity.category).length };
  }

  private coverage(entities: TerritorialEntity[], issues: TerritorialQualityIssue[]): TerritorialCoverageMetric[] {
    const groups: Array<[string, string, TerritorialCategoryId[]]> = [
      ["schools", "Escuelas", ["education_primary", "education_secondary", "education_technical", "education_school"]],
      ["kindergartens", "Jardines", ["education_kindergarten"]], ["hospitals", "Hospitales", ["health_hospital"]],
      ["caps", "CAPS", ["health_caps"]], ["sports-centers", "Polideportivos", ["sport_sports_center"]],
      ["clubs", "Clubes", ["sport_club"]], ["squares", "Plazas", ["public_square"]],
    ];
    return groups.map(([id, label, categories]) => {
      const records = entities.filter((entity) => categories.includes(entity.category as TerritorialCategoryId));
      const recordIds = new Set(records.map((entity) => entity.id));
      const relevant = issues.filter((issue) => recordIds.has(issue.entityId));
      const incompleteIds = new Set(relevant.filter((issue) => ["coordinates", "source", "category"].includes(issue.type)).map((issue) => issue.entityId));
      return { id, label, loaded: records.length, complete: records.length - incompleteIds.size, percentage: records.length ? Math.round(((records.length - incompleteIds.size) / records.length) * 100) : 0, missing: relevant.filter((issue) => issue.type === "address").length, duplicates: relevant.filter((issue) => issue.type === "duplicate").length, unclassified: relevant.filter((issue) => issue.type === "classification" || issue.type === "category").length, expected: null };
    });
  }

  private issue(entity: TerritorialEntity, type: TerritorialQualityIssue["type"], severity: TerritorialQualityIssue["severity"], message: string, suggestion?: string): TerritorialQualityIssue {
    return { id: `${type}:${entity.id}`, entityId: entity.id, type, severity, message, suggestion };
  }
}
