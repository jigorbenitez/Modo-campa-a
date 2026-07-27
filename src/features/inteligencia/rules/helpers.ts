import type { DomainReference } from "@/application/agents";
import type { Insight, InsightCategory, InsightSeverity, IntelligenceSnapshot } from "../domain/insight";

type InsightInput = {
  ruleId: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  message: string;
  suggestedAction?: string;
  evidence: string[];
  references?: DomainReference[];
};

export function createInsight(snapshot: IntelligenceSnapshot, input: InsightInput): Insight {
  return {
    id: `${input.ruleId}-${input.references?.[0]?.id ?? "general"}`,
    references: [],
    ...input,
    generatedAt: snapshot.generatedAt,
  };
}

export function daysBetween(earlier: string, later: string): number {
  return Math.floor(
    (new Date(later).getTime() - new Date(earlier).getTime()) / (1000 * 60 * 60 * 24),
  );
}
