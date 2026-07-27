import type { Insight } from "@/features/inteligencia";
import { cn } from "@/lib/utils";

const severityStyles = {
  information: "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/35 dark:text-sky-100",
  opportunity: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/35 dark:text-emerald-100",
  warning: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/35 dark:text-amber-100",
  critical: "border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950/35 dark:text-rose-100",
};

const severityLabels = {
  information: "Información",
  opportunity: "Oportunidad",
  warning: "Atención",
  critical: "Prioridad crítica",
};

export function InsightCard({ insight, featured = false }: { insight: Insight; featured?: boolean }) {
  return (
    <article className={cn("rounded-2xl border p-5", severityStyles[insight.severity], featured && "md:p-6")}>
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-current opacity-70" />
        <span className="text-[11px] font-extrabold uppercase tracking-[0.14em]">
          {severityLabels[insight.severity]}
        </span>
      </div>
      <h3 className={cn("mt-4 font-extrabold tracking-tight", featured ? "text-xl" : "text-base")}>
        {insight.title}
      </h3>
      <p className="mt-2 text-sm leading-6 opacity-80">{insight.message}</p>
      {insight.suggestedAction && (
        <p className="mt-4 border-t border-current/10 pt-3 text-xs font-bold leading-5">
          Siguiente paso: {insight.suggestedAction}
        </p>
      )}
    </article>
  );
}
