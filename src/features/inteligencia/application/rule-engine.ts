import type { InsightRule, RuleEngineResult } from "../domain/rule";

/**
 * Ejecutor síncrono, determinista y tolerante a fallas.
 * Una regla defectuosa no impide evaluar las demás.
 */
export class RuleEngine<TContext> {
  constructor(private readonly rules: ReadonlyArray<InsightRule<TContext>>) {}

  run(context: TContext): RuleEngineResult {
    const insights = [];
    const evaluations = [];

    for (const rule of this.rules) {
      const startedAt = performance.now();

      try {
        const result = rule.evaluate(context);
        insights.push(...result);
        evaluations.push({
          ruleId: rule.id,
          durationMs: performance.now() - startedAt,
          insightCount: result.length,
        });
      } catch (error) {
        evaluations.push({
          ruleId: rule.id,
          durationMs: performance.now() - startedAt,
          insightCount: 0,
          error: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    }

    return { insights, evaluations };
  }
}
