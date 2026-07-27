import type { InsightRule } from "../domain/rule";
import type { IntelligenceSnapshot } from "../domain/insight";
import { createInsight, daysBetween } from "./helpers";

export const territoryActivityRule: InsightRule = {
  id: "territory.activity-gap",
  description: "Detecta barrios sin recorridas durante los últimos 30 días.",
  evaluate(snapshot: IntelligenceSnapshot) {
    const staleBarrios = snapshot.barrios.filter((barrio) => {
      const tours = snapshot.recorridas.filter((tour) => tour.barrioId === barrio.id);
      const latest = tours.sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0];
      return !latest || daysBetween(latest.startsAt, snapshot.generatedAt) > 30;
    });

    if (staleBarrios.length === 0) return [];

    return [
      createInsight(snapshot, {
        ruleId: this.id,
        category: "territory",
        severity: staleBarrios.length >= 3 ? "warning" : "information",
        title: "Cobertura territorial para reforzar",
        message: `${staleBarrios.length} ${staleBarrios.length === 1 ? "barrio no registra" : "barrios no registran"} recorridas en los últimos 30 días.`,
        suggestedAction: "Programar una recorrida en las zonas con menor actividad.",
        evidence: staleBarrios.map((barrio) => barrio.name),
        references: staleBarrios.map((barrio) => ({ resource: "barrio", id: barrio.id })),
      }),
    ];
  },
};
