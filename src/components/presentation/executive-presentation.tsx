"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { TerritoryViewService } from "@/features/territorio-map";
import { territorialBaseSnapshot } from "@/data/territorial-base";
import { territorialEntityToMapFeature, useTerritorialEntities } from "@/features/territorial-engine";
import { useBetaActivities } from "@/hooks/use-beta-activities";
import { useActivityJournal } from "@/hooks/use-activity-journal";
import type { ActivityRecord } from "@/features/diario";
import { BrandMark } from "@/components/brand/brand-logo";

const TerritoryMap = dynamic(
  () => import("@/components/territory/territory-map").then((module) => module.TerritoryMap),
  {
    ssr: false,
    loading: () => <div className="grid h-full place-items-center bg-[var(--brand-dark-background)] text-sm font-bold text-white/55"><span className="atiy-spinner mr-2 inline-block size-5 animate-spin rounded-full border-2" />Preparando territorio…</div>,
  },
);

const viewService = new TerritoryViewService();
const presentationLayers = new Set(territorialBaseSnapshot.layers.map((layer) => layer.id).filter((id) => id !== "documents" && id !== "photos"));
const emptyActivities: ActivityRecord[] = [];

export function ExecutivePresentation() {
  const entities = useTerritorialEntities();
  const { records } = useActivityJournal(emptyActivities);
  const snapshot = useMemo(() => ({
    ...territorialBaseSnapshot,
    features: entities
      .map((entity) => territorialEntityToMapFeature(entity, territorialBaseSnapshot.neighborhoods, territorialBaseSnapshot.circuits))
      .filter((feature) => feature !== null),
  }), [entities]);
  const [periodIndex, setPeriodIndex] = useState(territorialBaseSnapshot.periods.length - 1);
  const localActivities = useBetaActivities();
  const period = snapshot.periods[periodIndex] ?? snapshot.periods.at(-1)!;
  const view = useMemo(
    () => viewService.project(snapshot, { periodId: period.id, enabledLayers: presentationLayers }),
    [period.id, snapshot],
  );
  const institutions = entities.length;
  const people = localActivities.reduce((total, activity) => total + activity.captures.filter((capture) => capture.kind === "person").length, 0);
  const recent = [
    ...localActivities.map((activity) => ({ title: activity.title, at: activity.finishedAt, label: "Recorrido" })),
    ...records.map((record) => ({ title: record.activity.title, at: `${record.activity.date}T${record.activity.startTime}:00`, label: "Actividad" })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 4);

  return (
    <main className="min-h-screen bg-[var(--brand-dark-background)] text-white">
      <header className="flex h-20 items-center justify-between border-b border-white/8 px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <BrandMark className="size-11 rounded-xl" priority />
          <div><p className="text-sm font-black">San Fernando</p><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Estado municipal · Hoy</p></div>
        </div>
        <Link href="/" className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/60 transition hover:text-white">Salir</Link>
      </header>

      <div className="grid min-h-[calc(100vh-5rem)] xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.55fr)]">
        <section className="relative min-h-[58vh] border-b border-white/8 xl:border-b-0 xl:border-r">
          <TerritoryMap
            center={[snapshot.center.latitude, snapshot.center.longitude]}
            view={view}
            layers={snapshot.layers}
            onSelectFeature={() => undefined}
          onSelectNeighborhood={() => undefined}
          onClearSelection={() => undefined}
          municipalityBoundaries={snapshot.municipalityBoundaries}
          resetToken={0}
          enabledLayers={presentationLayers}
          activeTool="navigate"
          selectedCircuitIds={new Set()}
          onCreatePoint={() => undefined}
          />
          <div className="pointer-events-none absolute inset-x-4 top-4 z-[500] grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Barrios activos", view.stats.activeNeighborhoods],
              ["Problemas abiertos", view.stats.openProblems],
              ["Compromisos", view.stats.pendingCommitments],
              ["Actividad semanal", view.stats.weeklyActivity + localActivities.length],
            ].map(([label, value]) => (
              <article key={label} className="rounded-2xl border border-white/10 bg-[var(--brand-primary)]/90 p-4 shadow-xl backdrop-blur-xl">
                <p className="text-[9px] font-black uppercase tracking-wide text-white/40">{label}</p>
                <p className="mt-1 text-2xl font-black">{value}</p>
              </article>
            ))}
          </div>

          <div className="absolute inset-x-4 bottom-4 z-[500] rounded-2xl border border-white/10 bg-[var(--brand-primary)]/90 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wide text-white/40">
              <span>Evolución territorial</span><span>{period.label}</span>
            </div>
            <input aria-label="Período de presentación" type="range" min={0} max={snapshot.periods.length - 1} value={periodIndex} onChange={(event) => setPeriodIndex(Number(event.target.value))} className="mt-3 w-full accent-[var(--brand-accent)]" />
            <div className="mt-1 flex justify-between text-[9px] font-bold text-white/35">{snapshot.periods.map((item) => <span key={item.id}>{item.label}</span>)}</div>
          </div>
        </section>

        <aside className="p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-accent)]">Dashboard ejecutivo</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em]">Municipio activo, contexto ordenado.</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">La cobertura territorial es estable. San Jorge concentra la mayor necesidad de seguimiento.</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Metric label="Instituciones" value={institutions.toString()} note="red identificada" />
            <Metric label="Personas" value={people.toString()} note="con contexto" />
            <Metric label="Estado general" value="Estable" note="con 1 prioridad" compact />
            <Metric label="Cobertura" value="64%" note="últimos 30 días" />
          </div>

          <section className="mt-7">
            <div className="flex items-center justify-between"><h2 className="text-sm font-black">Actividad reciente</h2><span className="text-[9px] font-bold uppercase text-white/35">En tiempo real</span></div>
            <div className="mt-3 space-y-2">
              {recent.map((item) => (
                <article key={`${item.title}-${item.at}`} className="flex items-center gap-3 rounded-2xl bg-white/[0.055] p-4">
                  <span className="size-2 rounded-full bg-[var(--brand-accent)]" />
                  <div className="min-w-0 flex-1"><p className="truncate text-xs font-black">{item.title}</p><p className="mt-1 text-[10px] text-white/35">{item.label}</p></div>
                  <time className="text-[10px] font-bold text-white/35">{new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(new Date(item.at))}</time>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function Metric({ label, value, note, compact }: { label: string; value: string; note: string; compact?: boolean }) {
  return <article className="rounded-2xl border border-white/8 bg-white/[0.045] p-4"><p className="text-[9px] font-black uppercase tracking-wide text-white/35">{label}</p><p className={`mt-2 font-black ${compact ? "text-xl" : "text-3xl"}`}>{value}</p><p className="mt-1 text-[10px] text-white/35">{note}</p></article>;
}
