import type { StrategicArea } from "@/features/inteligencia";
import { Card } from "@/components/ui/card";
import { MetricCard } from "./metric-card";
import { TrendCard } from "./trend-card";

const areaLabels: Record<StrategicArea["category"], string> = {
  territory: "TE",
  problems: "PR",
  proposals: "PP",
  documents: "DO",
  agenda: "AG",
  team: "EQ",
};

export function StrategicAreaCard({ area }: { area: StrategicArea }) {
  return (
    <Card className="flex min-h-72 flex-col p-5 shadow-none">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[11px] font-black tracking-wide text-[var(--accent-strong)]">
          {areaLabels[area.category]}
        </span>
        <div>
          <h2 className="font-extrabold tracking-tight">{area.label}</h2>
          <p className="mt-1 text-sm leading-5 text-[var(--muted)]">{area.summary}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {area.metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </div>
      {area.trend && <TrendCard {...area.trend} />}
    </Card>
  );
}
