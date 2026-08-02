"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ActivityRecord } from "@/features/diario";
import { useActivityJournal } from "@/hooks/use-activity-journal";
import { useBetaActivities } from "@/hooks/use-beta-activities";
import { territorialBaseSnapshot } from "@/data/territorial-base";
import { useTerritorialEntities } from "@/features/territorial-engine";
import { MetricCard } from "./metric-card";

type OperationalRecord = { id: string; status: string; createdAt: string; values: Record<string, string> };
const emptyActivities: ActivityRecord[] = [];

function readRecords(key: string): OperationalRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(key) ?? "[]") as OperationalRecord[]; } catch { return []; }
}

export function Dashboard() {
  const territorialEntities = useTerritorialEntities();
  const { records } = useActivityJournal(emptyActivities);
  const tours = useBetaActivities();
  const [agenda] = useState(() => readRecords("atiy:agenda:v1"));
  const [proposals] = useState(() => readRecords("atiy:proposals:v1"));
  const [referenceTime] = useState(() => new Date());
  const today = referenceTime.toISOString().slice(0, 10);
  const weekStart = referenceTime.getTime() - 7 * 86_400_000;
  const activities = useMemo(() => records
    .map((record) => ({ title: record.activity.title, date: record.activity.date, neighborhood: record.activity.barrioIds[0] ?? "Sin barrio" }))
    .sort((a, b) => b.date.localeCompare(a.date)), [records]);
  const institutions = territorialEntities.filter((entity) =>
    !["municipality", "locality", "neighborhood"].includes(entity.category),
  );
  const circuitActivity = new Map<string, number>();
  tours.filter((tour) => tour.circuitId).forEach((tour) => circuitActivity.set(tour.circuitId!, (circuitActivity.get(tour.circuitId!) ?? 0) + 1));
  const leadingCircuits = [...circuitActivity.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const activeAreas = new Set(activities.map((activity) => activity.neighborhood).filter(Boolean));
  const inactiveAreas = territorialBaseSnapshot.neighborhoods.filter((area) => area.level === "neighborhood" && !activeAreas.has(area.id) && !activeAreas.has(area.name));
  const upcoming = agenda.filter((item) => item.status !== "completed" && item.values.startsAt && item.values.startsAt >= referenceTime.toISOString().slice(0, 16)).sort((a, b) => a.values.startsAt.localeCompare(b.values.startsAt));
  const weekly = activities.filter((activity) => new Date(`${activity.date}T12:00:00`).getTime() >= weekStart).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
      <header className="flex flex-col justify-between gap-5 border-b border-[var(--border)] pb-7 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Panel ejecutivo · San Fernando</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Estado territorial</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">Actividad, compromisos y cobertura construidos con la información disponible en ATIY.</p>
        </div>
        <div className="flex gap-2"><Link href="/recorrido" className="premium-button px-4 py-3 text-xs font-extrabold">Iniciar recorrida</Link><Link href="/territorio" className="rounded-xl border border-[var(--border)] px-4 py-3 text-xs font-extrabold">Abrir mapa</Link></div>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principales">
        <MetricCard label="Actividad de hoy" value={String(activities.filter((item) => item.date === today).length)} note="actividades únicas del Diario" accent />
        <MetricCard label="Actividad semanal" value={String(weekly)} note="actividades únicas · últimos 7 días" />
        <MetricCard label="Compromisos próximos" value={String(upcoming.filter((item) => item.values.view === "commitment").length)} note="en agenda" />
        <MetricCard label="Entidades territoriales" value={String(territorialEntities.length)} note="lugares e instituciones del repositorio canónico" />
      </section>
      <p className="mt-3 text-[10px] leading-5 text-[var(--muted)]">
        Actividades contabiliza registros únicos del Diario; recorridas describe únicamente sesiones de campo; compromisos proviene de Agenda y entidades territoriales del repositorio canónico.
      </p>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <section className="premium-card p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)]">Operación</p><h2 className="mt-1 text-xl font-extrabold">Últimas recorridas y actividades</h2></div><Link href="/diario" className="text-xs font-extrabold text-[var(--accent-strong)]">Ver diario</Link></div>
          <div className="mt-5 space-y-2">
            {activities.length ? activities.slice(0, 6).map((activity, index) => <article key={`${activity.title}-${activity.date}-${index}`} className="flex items-center justify-between gap-4 rounded-xl bg-[var(--surface-muted)] p-4"><div><h3 className="text-sm font-extrabold">{activity.title}</h3><p className="mt-1 text-xs text-[var(--muted)]">{activity.neighborhood}</p></div><time className="text-xs font-bold text-[var(--muted)]">{new Intl.DateTimeFormat("es-AR").format(new Date(`${activity.date}T12:00:00`))}</time></article>) : <EmptyState text="Todavía no hay recorridas registradas. La primera actividad aparecerá aquí." action="/recorrido" label="Iniciar recorrida" />}
          </div>
        </section>
        <section className="premium-card p-5 sm:p-6">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)]">Alertas</p>
          <h2 className="mt-1 text-xl font-extrabold">Atención requerida</h2>
          <div className="mt-5 space-y-2">
            <Alert label="Barrios sin actividad" value={inactiveAreas.length} note={inactiveAreas.length ? inactiveAreas.map((area) => area.name).join(", ") : "Cobertura registrada"} />
            <Alert label="Instituciones pendientes" value={institutions.filter((item) => item.status !== "active").length} note="según estado del repositorio" />
            <Alert label="Propuestas incompletas" value={proposals.filter((item) => item.status === "study").length} note="en estudio" />
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="premium-card p-5 sm:p-6"><h2 className="text-lg font-extrabold">Circuitos con mayor actividad</h2><div className="mt-4 space-y-3">{leadingCircuits.length ? leadingCircuits.map(([id, count]) => { const circuit = territorialBaseSnapshot.circuits.find((item) => item.id === id); return <div key={id} className="flex items-center justify-between rounded-xl bg-[var(--surface-muted)] p-3 text-sm"><span className="font-bold">{circuit?.name ?? id}</span><strong>{count}</strong></div>; }) : <p className="rounded-xl bg-[var(--surface-muted)] p-4 text-xs text-[var(--muted)]">Pendiente de actividad georreferenciada.</p>}</div></section>
        <section className="premium-card p-5 sm:p-6"><h2 className="text-lg font-extrabold">Indicadores territoriales</h2><dl className="mt-4 grid grid-cols-2 gap-3">{[["Circuitos oficiales", territorialBaseSnapshot.circuits.length], ["Áreas verificadas", territorialBaseSnapshot.neighborhoods.length], ["Entidades sincronizadas", territorialEntities.length], ["Alertas activas", inactiveAreas.length]].map(([label, value]) => <div key={label} className="rounded-xl bg-[var(--surface-muted)] p-4"><dd className="text-2xl font-black">{value}</dd><dt className="mt-1 text-[10px] font-bold uppercase text-[var(--muted)]">{label}</dt></div>)}</dl></section>
      </div>
    </div>
  );
}

function Alert({ label, value, note }: { label: string; value: number; note: string }) {
  return <div className="rounded-xl border border-[var(--border)] p-4"><div className="flex items-center justify-between"><span className="text-xs font-extrabold">{label}</span><strong className="text-lg">{value}</strong></div><p className="mt-1 text-[10px] text-[var(--muted)]">{note}</p></div>;
}

function EmptyState({ text, action, label }: { text: string; action: string; label: string }) {
  return <div className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-center"><p className="text-sm text-[var(--muted)]">{text}</p><Link href={action} className="mt-4 inline-flex rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-extrabold text-white">{label}</Link></div>;
}
