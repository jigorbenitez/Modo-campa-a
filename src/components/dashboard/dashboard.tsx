import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { MetricCard } from "./metric-card";
import { mockMunicipio, mockTerritorySnapshot } from "@/mock";

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
        <MetricCard label="Municipio" value={mockMunicipio.name} note="Provincia de Buenos Aires" accent />
        <MetricCard label="Población" value={(mockMunicipio.population ?? 0).toLocaleString("es-AR")} note="Censo 2022" />
        <MetricCard label="Áreas territoriales" value={String(mockTerritorySnapshot.neighborhoods.length)} note="Base inicial disponible" />
        <MetricCard label="Puntos verificados" value={String(mockTerritorySnapshot.features.length)} note="Sin actividad operativa simulada" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Estado de datos</p><h2 className="mt-1 text-xl font-extrabold">Base territorial inicial</h2></div>
            <StatusPill tone="green">Verificada</StatusPill>
          </div>
          <div className="mt-7 space-y-3">
            {[
              ["Municipio y localidades", "San Fernando", "Base"],
              ["Instituciones y estaciones", "Fuentes públicas", "Mapa"],
              ["Actividad operativa", "Sin datos simulados", "Pendiente"],
            ].map(([title, area, state]) => (
              <div key={title} className="flex items-center gap-4 rounded-2xl bg-[var(--surface-muted)] p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface)] font-extrabold text-[var(--accent)]">{state.slice(0, 2)}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{title}</p><p className="mt-1 text-xs text-[var(--muted)]">{area}</p></div>
                <span className="text-xs font-bold text-[var(--muted)]">{state}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Base territorial</p>
          <h2 className="mt-1 text-xl font-extrabold">Cobertura de San Fernando</h2>
          <div className="mt-7 space-y-5">
            {mockTerritorySnapshot.neighborhoods.slice(0, 4).map((area) => (
              <div key={area.id}>
                <div className="mb-2 flex justify-between text-sm"><span className="font-bold">{area.name}</span><span className="text-[var(--muted)]">{area.locality}</span></div>
                <div className="h-2 rounded-full bg-[var(--surface-muted)]"><div className="h-full w-full rounded-full bg-[var(--brand-accent)]" /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
