import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { MetricCard } from "./metric-card";

export function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] px-6 py-10 shadow-[var(--shadow-sm)] sm:px-10 sm:py-14 lg:px-14">
        <div className="absolute -right-28 -top-36 size-96 rounded-full bg-[var(--brand-accent)]/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 size-80 rounded-full bg-[var(--primary-soft)] blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="atiy-logo-crop h-24 w-60 sm:h-28 sm:w-72">
            <BrandLogo priority />
          </div>
          <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--accent)]">Inteligencia territorial</p>
          <h1 className="mt-4 text-4xl font-black leading-[1.06] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
            Inteligencia para transformar el territorio.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            Centralizá información territorial, relaciones, actividades y conocimiento para tomar mejores decisiones.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/recorrido" className="premium-button inline-flex h-12 items-center justify-center px-6 text-sm font-extrabold">Iniciar recorrida</Link>
            <Link href="/territorio" className="inline-flex h-12 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-6 text-sm font-extrabold transition hover:border-[var(--brand-accent)] hover:shadow-[var(--shadow-sm)]">Explorar territorio</Link>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Días de trabajo" value="12" note="Semana en curso" accent />
        <MetricCard label="Barrios activos" value="4" note="Con acciones planificadas" />
        <MetricCard label="Propuestas" value="8" note="En etapa de revisión" />
        <MetricCard label="Próximos eventos" value="3" note="Durante los próximos 7 días" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Prioridades</p><h2 className="mt-1 text-xl font-extrabold">Esta semana</h2></div>
            <StatusPill tone="green">En marcha</StatusPill>
          </div>
          <div className="mt-7 space-y-3">
            {[
              ["Reunión con referentes barriales", "Territorio", "Martes"],
              ["Revisar propuesta de movilidad", "Propuestas", "Miércoles"],
              ["Preparar piezas para redes", "Marketing", "Viernes"],
            ].map(([title, area, day]) => (
              <div key={title} className="flex items-center gap-4 rounded-2xl bg-[var(--surface-muted)] p-4">
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
          <div className="mt-7 space-y-5">
            {[["Centro", 78], ["Norte", 64], ["Oeste", 51], ["Sur", 39]].map(([name, value]) => (
              <div key={name}>
                <div className="mb-2 flex justify-between text-sm"><span className="font-bold">{name}</span><span className="text-[var(--muted)]">{value}%</span></div>
                <div className="h-2 rounded-full bg-[var(--surface-muted)]"><div className="h-full rounded-full bg-[var(--brand-accent)]" style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
