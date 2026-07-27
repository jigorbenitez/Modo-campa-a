import { cn } from "@/lib/utils";
import type { StrategicMetric } from "@/features/inteligencia";

const toneStyles: Record<NonNullable<StrategicMetric["tone"]>, string> = {
  neutral: "text-[var(--foreground)]",
  positive: "text-[var(--accent)]",
  warning: "text-amber-600 dark:text-amber-400",
  critical: "text-rose-600 dark:text-rose-400",
};

export function MetricCard({ metric }: { metric: StrategicMetric }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/60 p-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-bold text-[var(--muted)]">{metric.label}</p>
        <p className={cn("text-xl font-extrabold tracking-tight", toneStyles[metric.tone ?? "neutral"])}>
          {metric.value}
        </p>
      </div>
      <p className="mt-1 text-[11px] leading-4 text-[var(--muted)]">{metric.context}</p>
    </div>
  );
}
