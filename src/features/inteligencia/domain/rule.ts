import type { Insight, IntelligenceSnapshot } from "./insight";

export interface InsightRule<TContext = IntelligenceSnapshot> {
  readonly id: string;
  readonly description: string;
  evaluate(context: TContext): Insight[];
}

export interface RuleEvaluation {
  ruleId: string;
  durationMs: number;
  insightCount: number;
  error?: string;
}

export interface RuleEngineResult {
  insights: Insight[];
  evaluations: RuleEvaluation[];
}
