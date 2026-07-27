import type { InsightRule } from "../domain/rule";
import type { IntelligenceSnapshot } from "../domain/insight";
import { createInsight } from "./helpers";

export const problemConcentrationRule: InsightRule = {
  id: "problems.category-concentration",
  description: "Detecta concentraciones de tres o más problemas de una categoría por barrio.",
  evaluate(snapshot: IntelligenceSnapshot) {
    const groups = new Map<string, typeof snapshot.problemas>();

    for (const problem of snapshot.problemas) {
      if (!problem.barrioId || problem.status === "resolved" || problem.status === "dismissed") continue;
      const key = `${problem.barrioId}::${problem.category.toLocaleLowerCase("es")}`;
      groups.set(key, [...(groups.get(key) ?? []), problem]);
    }

    return [...groups.entries()].flatMap(([key, problems]) => {
      if (problems.length < 3) return [];
      const [barrioId] = key.split("::");
      const barrio = snapshot.barrios.find((item) => item.id === barrioId);

      return [
        createInsight(snapshot, {
          ruleId: this.id,
          category: "problems",
          severity: problems.some((problem) => problem.severity === "critical") ? "critical" : "warning",
          title: `Concentración de ${problems[0].category.toLocaleLowerCase("es")}`,
          message: `Se observa una concentración de ${problems.length} registros vinculados a ${problems[0].category.toLocaleLowerCase("es")} en ${barrio?.name ?? "un barrio"}.`,
          suggestedAction: "Revisar los casos en conjunto y evaluar una respuesta territorial común.",
          evidence: problems.map((problem) => problem.title),
          references: problems.map((problem) => ({ resource: "problema", id: problem.id })),
        }),
      ];
    });
  },
};
