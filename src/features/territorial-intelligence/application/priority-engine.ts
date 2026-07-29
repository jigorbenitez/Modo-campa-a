import type {
  PriorityConfiguration,
  PriorityInput,
  PriorityLevel,
  PriorityReason,
  PriorityResult,
  PriorityVariable,
} from "../domain";

export const defaultPriorityConfiguration: PriorityConfiguration = {
  municipalityId: "municipio-san-fernando",
  updatedAt: "2026-07-29T00:00:00.000Z",
  thresholds: { critical: 75, high: 50, medium: 25, low: 1 },
  colors: { critical: "#dc2626", high: "#ea580c", medium: "#ca8a04", low: "#16a34a", none: "#94a3b8" },
  rules: [
    { id: "daysSinceLastTour", label: "Días desde la última recorrida", enabled: true, weight: 28, cap: 90 },
    { id: "openCommitments", label: "Compromisos abiertos", enabled: true, weight: 15, cap: 8 },
    { id: "overdueCommitments", label: "Compromisos vencidos", enabled: true, weight: 20, cap: 5 },
    { id: "pendingProposals", label: "Propuestas pendientes", enabled: true, weight: 8, cap: 5 },
    { id: "coverageGap", label: "Brecha de cobertura", enabled: true, weight: 25, cap: 100 },
    { id: "unvisitedInstitutions", label: "Instituciones sin visitar", enabled: true, weight: 12, cap: 8 },
    { id: "pendingDocuments", label: "Documentos pendientes", enabled: true, weight: 8, cap: 5 },
    { id: "pendingPhotos", label: "Fotografías pendientes", enabled: true, weight: 6, cap: 5 },
    { id: "recentActivity", label: "Actividad reciente", enabled: true, weight: 12, cap: 8, inverse: true },
    { id: "upcomingEvents", label: "Eventos próximos", enabled: true, weight: 5, cap: 4 },
    { id: "openAlerts", label: "Alertas abiertas", enabled: true, weight: 12, cap: 5 },
    { id: "registeredProblems", label: "Problemas registrados", enabled: true, weight: 14, cap: 8 },
  ],
};

const reasonTemplates: Record<PriorityVariable, (value: number) => string> = {
  daysSinceLastTour: (value) => value >= 365 ? "No existen recorridas registradas." : `Hace ${Math.round(value)} días que no se realiza una recorrida.`,
  openCommitments: (value) => `Existen ${Math.round(value)} compromisos abiertos.`,
  overdueCommitments: (value) => `Hay ${Math.round(value)} compromisos vencidos.`,
  pendingProposals: (value) => `${Math.round(value)} propuestas permanecen pendientes.`,
  coverageGap: (value) => `La brecha de cobertura territorial es del ${Math.round(value)}%.`,
  unvisitedInstitutions: (value) => `${Math.round(value)} instituciones no tienen visita documentada.`,
  pendingDocuments: (value) => `${Math.round(value)} documentos están pendientes.`,
  pendingPhotos: (value) => `${Math.round(value)} registros necesitan fotografías.`,
  recentActivity: (value) => `${Math.round(value)} actividades recientes reducen la urgencia.`,
  upcomingEvents: (value) => `${Math.round(value)} eventos próximos requieren preparación.`,
  openAlerts: (value) => `${Math.round(value)} alertas permanecen abiertas.`,
  registeredProblems: (value) => `${Math.round(value)} problemas están registrados.`,
};

export class TerritorialPriorityEngine {
  calculate(input: PriorityInput, configuration: PriorityConfiguration, referenceDate: string): PriorityResult {
    const reasons: PriorityReason[] = [];
    let rawScore = 0;
    for (const rule of configuration.rules) {
      if (!rule.enabled) continue;
      const rawValue = Math.max(0, input.variables[rule.id] ?? 0);
      const normalized = Math.min(1, rawValue / Math.max(1, rule.cap));
      const contribution = normalized * rule.weight * (rule.inverse ? -1 : 1);
      rawScore += contribution;
      if (rawValue > 0 && Math.abs(contribution) >= 0.5) reasons.push({ ruleId: rule.id, message: reasonTemplates[rule.id](rawValue), rawValue, contribution: Math.round(contribution * 10) / 10 });
    }
    const score = Math.round(Math.max(0, Math.min(100, rawScore)));
    const level = this.classify(score, configuration);
    return {
      entityId: input.entityId,
      entityName: input.entityName,
      entityType: input.entityType,
      score,
      level,
      reasons: reasons.sort((left, right) => Math.abs(right.contribution) - Math.abs(left.contribution)),
      location: input.location,
      relatedIds: input.relatedIds,
      calculatedAt: referenceDate,
      configurationVersion: configuration.updatedAt,
    };
  }

  calculateAll(inputs: PriorityInput[], configuration: PriorityConfiguration, referenceDate: string) {
    return inputs.map((input) => this.calculate(input, configuration, referenceDate)).sort((left, right) => right.score - left.score || left.entityName.localeCompare(right.entityName, "es"));
  }

  private classify(score: number, configuration: PriorityConfiguration): PriorityLevel {
    if (score >= configuration.thresholds.critical) return "critical";
    if (score >= configuration.thresholds.high) return "high";
    if (score >= configuration.thresholds.medium) return "medium";
    if (score >= configuration.thresholds.low) return "low";
    return "none";
  }
}
