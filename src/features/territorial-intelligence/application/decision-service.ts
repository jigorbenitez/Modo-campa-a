import type { PriorityResult } from "../domain";

export interface DecisionRecommendation {
  id: string;
  title: string;
  priority: PriorityResult;
  reason: string;
  expectedImpact: string;
  estimatedMinutes: number;
  location?: PriorityResult["location"];
  relatedIds: string[];
  generatedAt: string;
}

export type DecisionStatus = "pending" | "completed" | "postponed" | "discarded";

export class DecisionService {
  generate(priorities: PriorityResult[], generatedAt: string): DecisionRecommendation[] {
    return priorities.filter((priority) => priority.level !== "none").slice(0, 30).map((priority) => {
      const isArea = priority.entityType === "circuit" || priority.entityType === "neighborhood" || priority.entityType === "locality";
      const topReason = priority.reasons[0]?.message ?? "La configuración vigente asigna atención a este elemento.";
      return {
        id: `decision-${priority.entityId}`,
        title: isArea ? `Recorrer ${priority.entityName}` : `Actualizar ${priority.entityName}`,
        priority,
        reason: topReason,
        expectedImpact: isArea ? "Mejorar cobertura y actualizar el contexto territorial." : "Reducir pendientes de documentación y relevamiento.",
        estimatedMinutes: isArea ? 60 : 25,
        location: priority.location,
        relatedIds: priority.relatedIds,
        generatedAt,
      };
    });
  }
}
