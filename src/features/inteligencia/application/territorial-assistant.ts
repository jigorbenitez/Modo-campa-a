import type { TerritorySnapshot } from "@/features/territorio-map";

export type TerritorialQuestion =
  | { intent: "inactive_areas" }
  | { intent: "pending_commitments_by_circuit" }
  | { intent: "plan_tour"; areaIds?: string[] }
  | { intent: "territorial_report"; areaId?: string };

export interface TerritorialAssistantAnswer {
  title: string;
  summary: string;
  entityIds: string[];
  evidence: Array<{ label: string; value: string }>;
  generatedAt: string;
}

export interface TerritorialAssistantPort {
  answer(question: TerritorialQuestion, snapshot: TerritorySnapshot): TerritorialAssistantAnswer;
}

export class RuleBasedTerritorialAssistant implements TerritorialAssistantPort {
  answer(question: TerritorialQuestion, snapshot: TerritorySnapshot): TerritorialAssistantAnswer {
    const generatedAt = new Date().toISOString();
    if (question.intent === "inactive_areas") {
      const active = new Set(snapshot.features.filter((feature) => feature.kind === "activity").map((feature) => feature.barrioId));
      const areas = snapshot.neighborhoods.filter((area) => !active.has(area.id));
      return { title: "Áreas sin recorridas", summary: areas.length ? `${areas.length} áreas no poseen recorridas en la información disponible.` : "Todas las áreas disponibles poseen actividad.", entityIds: areas.map((area) => area.id), evidence: [{ label: "Áreas analizadas", value: String(snapshot.neighborhoods.length) }], generatedAt };
    }
    if (question.intent === "pending_commitments_by_circuit") {
      const counts = new Map<string, number>();
      snapshot.features.filter((feature) => feature.kind === "commitment" && feature.circuitId && feature.status !== "completed").forEach((feature) => counts.set(feature.circuitId!, (counts.get(feature.circuitId!) ?? 0) + 1));
      const leader = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
      const circuit = snapshot.circuits.find((item) => item.id === leader?.[0]);
      return { title: "Compromisos pendientes por circuito", summary: circuit ? `${circuit.name} concentra ${leader[1]} compromisos pendientes.` : "No hay compromisos georreferenciados pendientes.", entityIds: circuit ? [circuit.id] : [], evidence: [{ label: "Circuitos analizados", value: String(snapshot.circuits.length) }], generatedAt };
    }
    if (question.intent === "plan_tour") {
      const areas = question.areaIds?.length ? snapshot.neighborhoods.filter((area) => question.areaIds!.includes(area.id)) : snapshot.neighborhoods.slice(0, 3);
      return { title: "Borrador de recorrido", summary: areas.length ? `Secuencia territorial sugerida por cobertura: ${areas.map((area) => area.name).join(" → ")}.` : "No hay áreas disponibles para preparar el recorrido.", entityIds: areas.map((area) => area.id), evidence: [{ label: "Criterio", value: "Cobertura territorial disponible" }], generatedAt };
    }
    const area = question.areaId ? snapshot.neighborhoods.find((item) => item.id === question.areaId) : undefined;
    const features = area ? snapshot.features.filter((feature) => feature.barrioId === area.id) : snapshot.features;
    return { title: area ? `Informe territorial · ${area.name}` : "Informe territorial", summary: `${features.length} elementos y ${snapshot.circuits.length} circuitos forman el contexto disponible.`, entityIds: area ? [area.id, ...features.map((feature) => feature.id)] : features.map((feature) => feature.id), evidence: [{ label: "Fuente", value: "Snapshot territorial ATIY" }], generatedAt };
  }
}
