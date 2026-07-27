import type { TerritoryStatsView } from "@/features/territorio-map";

export function TerritoryStats({ stats }: { stats: TerritoryStatsView }) {
  const values = [
    ["Barrios activos", stats.activeNeighborhoods, "con actividad"],
    ["Problemas abiertos", stats.openProblems, "requieren contexto"],
    ["Compromisos", stats.pendingCommitments, "pendientes"],
    ["Esta semana", stats.weeklyActivity, "actividades"],
    [
      "Última recorrida",
      stats.latestTour
        ? new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(
            new Date(stats.latestTour.occurredAt),
          )
        : "—",
      stats.latestTour?.title ?? "sin actividad",
    ],
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
      {values.map(([label, value, context]) => (
        <div key={label} className="min-w-0 rounded-2xl border border-white/15 bg-[var(--sidebar)]/94 p-3 text-white shadow-xl backdrop-blur">
          <p className="truncate text-[9px] font-extrabold uppercase tracking-[0.1em] text-emerald-300">{label}</p>
          <p className="mt-1 text-xl font-extrabold">{value}</p>
          <p className="truncate text-[10px] text-[var(--sidebar-muted)]">{context}</p>
        </div>
      ))}
    </div>
  );
}
