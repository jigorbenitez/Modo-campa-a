import type {
  PriorityConfiguration,
  PriorityInput,
  PriorityResult,
  SimulationAction,
  SimulationIndicator,
  SimulationResult,
  TerritorialCoverage,
} from "../domain";
import { TerritorialPriorityEngine } from "./priority-engine.ts";

export class TerritorialSimulationService {
  private readonly priorityEngine: TerritorialPriorityEngine;

  constructor(priorityEngine = new TerritorialPriorityEngine()) {
    this.priorityEngine = priorityEngine;
  }

  simulate(
    input: PriorityInput,
    coverage: TerritorialCoverage,
    priorityBefore: PriorityResult,
    actions: SimulationAction[],
    configuration: PriorityConfiguration,
    referenceDate: string,
  ): SimulationResult {
    const variables = { ...input.variables };
    let coverageDelta = 0;
    for (const action of actions) {
      const quantity = Math.max(0, Math.floor(action.quantity));
      if (action.type === "tour") {
        variables.daysSinceLastTour = 0;
        variables.recentActivity += quantity;
        coverageDelta += 15 * quantity;
      } else if (action.type === "closeCommitments") {
        variables.openCommitments = Math.max(0, variables.openCommitments - quantity);
        variables.overdueCommitments = Math.max(0, variables.overdueCommitments - quantity);
        coverageDelta += 2 * quantity;
      } else if (action.type === "registerInstitutions" || action.type === "completeSurveys") {
        variables.unvisitedInstitutions = Math.max(0, variables.unvisitedInstitutions - quantity);
        coverageDelta += 5 * quantity;
      } else if (action.type === "addPhotos") {
        variables.pendingPhotos = Math.max(0, variables.pendingPhotos - quantity);
        coverageDelta += 2.5 * quantity;
      } else if (action.type === "addDocuments" || action.type === "updatePublicData") {
        variables.pendingDocuments = Math.max(0, variables.pendingDocuments - quantity);
        coverageDelta += 3.5 * quantity;
      } else if (action.type === "createProposals") {
        variables.pendingProposals += quantity;
        variables.recentActivity += quantity;
        coverageDelta += quantity;
      } else if (action.type === "registerActivities" || action.type === "addRelationships") {
        variables.recentActivity += quantity;
        coverageDelta += 2 * quantity;
      }
    }
    const coverageAfter = Math.round(Math.min(100, coverage.percentage + coverageDelta));
    variables.coverageGap = 100 - coverageAfter;
    const priorityAfter = this.priorityEngine.calculate({ ...input, variables }, configuration, referenceDate);
    const indicators: SimulationIndicator[] = [
      this.indicator("coverage", "Cobertura territorial", coverage.percentage, coverageAfter, "%", "Recalculada con los pesos de cobertura documentados."),
      this.indicator("priority", "Puntaje de prioridad", priorityBefore.score, priorityAfter.score, "points", "Recalculado por el mismo motor de prioridades."),
      this.indicator("commitments", "Compromisos abiertos", input.variables.openCommitments, variables.openCommitments, "count", "Solo descuenta los cierres simulados."),
      this.indicator("institutions", "Instituciones sin visitar", input.variables.unvisitedInstitutions, variables.unvisitedInstitutions, "count", "Solo descuenta relevamientos simulados."),
      this.indicator("last-tour", "Días desde última recorrida", input.variables.daysSinceLastTour, variables.daysSinceLastTour, "days", "Una recorrida simulada establece el valor en cero."),
    ];
    return { targetEntityId: input.entityId, actions, indicators, priorityBefore, priorityAfter, generatedAt: referenceDate, totalMinutes: actions.reduce((total, action) => total + action.estimatedMinutes * action.quantity, 0) };
  }

  private indicator(id: string, label: string, before: number, after: number, unit: SimulationIndicator["unit"], explanation: string): SimulationIndicator {
    return { id, label, before, after, difference: Math.round((after - before) * 10) / 10, unit, explanation };
  }
}
