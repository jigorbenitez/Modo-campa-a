import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { MetricCard } from "./metric-card";

export function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">Panel general</p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">La campaña, en foco.</h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">Una vista clara de las prioridades, el territorio y las próximas acciones del equipo.</p>
        </div>
        <Link href="/agenda" className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-5 text-sm font-extrabold text-white transition hover:bg-[var(--accent-strong)]">Ver agenda →</Link>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Días de trabajo" value="12" note="Semana en curso" accent />
        <MetricCard label="Barrios activos" value="4" note="Con acciones planificadas" />
        <MetricCard label="Propuestas" value="8" note="En etapa de revisión" />
        <MetricCard label="Próximos eventos" value="3" note="Durante los próximos 7 días" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Prioridades</p><h2 className="mt-1 text-xl font-extrabold">Esta semana</h2></div>
            <StatusPill tone="green">En marcha</StatusPill>
          </div>
          <div className="mt-6 space-y-3">
            {[
              ["Reunión con referentes barriales", "Territorio", "Martes"],
              ["Revisar propuesta de movilidad", "Propuestas", "Miércoles"],
              ["Preparar piezas para redes", "Marketing", "Viernes"],
            ].map(([title, area, day]) => (
              <div key={title} className="flex items-center gap-4 rounded-xl bg-[var(--surface-muted)] p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface)] font-extrabold text-[var(--accent)]">{day.slice(0, 2)}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{title}</p><p className="mt-1 text-xs text-[var(--muted)]">{area}</p></div>
                <span className="text-xs font-bold text-[var(--muted)]">{day}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Pulso territorial</p>
          <h2 className="mt-1 text-xl font-extrabold">Barrios en agenda</h2>
          <div className="mt-6 space-y-5">
            {[["Centro", 78], ["Norte", 64], ["Oeste", 51], ["Sur", 39]].map(([name, value]) => (
              <div key={name}>
                <div className="mb-2 flex justify-between text-sm"><span className="font-bold">{name}</span><span className="text-[var(--muted)]">{value}%</span></div>
                <div className="h-2 rounded-full bg-[var(--surface-muted)]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
