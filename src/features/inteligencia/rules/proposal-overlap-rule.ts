import type { InsightRule } from "../domain/rule";
import type { IntelligenceSnapshot } from "../domain/insight";
import { createInsight } from "./helpers";

export const proposalOverlapRule: InsightRule = {
  id: "proposals.possible-overlap",
  description: "Detecta propuestas activas con etiquetas compartidas.",
  evaluate(snapshot: IntelligenceSnapshot) {
    const active = snapshot.propuestas.filter((proposal) => !["completed", "archived"].includes(proposal.status));
    const overlapping = active.filter((proposal, index) =>
      active.slice(index + 1).some((other) => proposal.tags.some((tag) => other.tags.includes(tag))),
    );

    if (overlapping.length === 0) return [];

    return [
      createInsight(snapshot, {
        ruleId: this.id,
        category: "proposals",
        severity: "opportunity",
        title: "Propuestas relacionadas",
        message: "Existen propuestas con objetivos o etiquetas compartidas que podrían revisarse de forma conjunta.",
        suggestedAction: "Comparar alcance, responsables e indicadores antes de avanzar.",
        evidence: overlapping.map((proposal) => proposal.title),
        references: overlapping.map((proposal) => ({ resource: "propuesta", id: proposal.id })),
      }),
    ];
  },
};
