import type { TerritoryFeature } from "@/features/territorio-map";
import type { DecisionRecommendation } from "./decision-service";

export interface PlannerRequest {
  availableMinutes: number;
  areaId?: string;
  circuitId?: string;
  center?: { latitude: number; longitude: number };
}

export interface PlannedAction {
  decision: DecisionRecommendation;
  sequence: number;
  travelDistanceKm: number;
}

export interface TerritorialPlan {
  actions: PlannedAction[];
  totalMinutes: number;
  totalDistanceKm: number;
  explanation: string;
}

function distanceKm(left: { latitude: number; longitude: number }, right: { latitude: number; longitude: number }) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const latitude = radians(right.latitude - left.latitude);
  const longitude = radians(right.longitude - left.longitude);
  const a = Math.sin(latitude / 2) ** 2 + Math.cos(radians(left.latitude)) * Math.cos(radians(right.latitude)) * Math.sin(longitude / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export class TerritorialPlannerService {
  plan(request: PlannerRequest, decisions: DecisionRecommendation[], features: TerritoryFeature[]): TerritorialPlan {
    const filtered = decisions.filter((decision) => {
      if (request.areaId && !decision.relatedIds.includes(request.areaId) && decision.priority.entityId !== request.areaId) return false;
      if (request.circuitId && !decision.relatedIds.includes(request.circuitId) && decision.priority.entityId !== request.circuitId) return false;
      return Boolean(decision.location);
    });
    const remaining = [...filtered];
    const actions: PlannedAction[] = [];
    let elapsed = 0;
    let distance = 0;
    let cursor = request.center ?? remaining[0]?.location;
    while (remaining.length && cursor) {
      remaining.sort((left, right) => {
        const leftDistance = left.location ? distanceKm(cursor!, left.location) : Infinity;
        const rightDistance = right.location ? distanceKm(cursor!, right.location) : Infinity;
        const leftValue = left.priority.score / Math.max(0.2, leftDistance);
        const rightValue = right.priority.score / Math.max(0.2, rightDistance);
        return rightValue - leftValue || right.priority.score - left.priority.score;
      });
      const next = remaining.shift()!;
      if (!next.location) continue;
      const travel = distanceKm(cursor, next.location);
      const travelMinutes = Math.ceil((travel / 20) * 60);
      if (elapsed + next.estimatedMinutes + travelMinutes > request.availableMinutes) continue;
      elapsed += next.estimatedMinutes + travelMinutes;
      distance += travel;
      actions.push({ decision: next, sequence: actions.length + 1, travelDistanceKm: Math.round(travel * 10) / 10 });
      cursor = next.location;
    }
    const institutions = actions.filter((action) => features.some((feature) => feature.id === action.decision.priority.entityId && feature.kind === "institution")).length;
    return {
      actions,
      totalMinutes: elapsed,
      totalDistanceKm: Math.round(distance * 10) / 10,
      explanation: `Plan determinístico: prioriza puntaje por cercanía, incluye ${institutions} instituciones y no supera ${request.availableMinutes} minutos.`,
    };
  }
}
