"use client";

import { useEffect, useMemo, useState } from "react";
import { TerritorialDataSyncEngine } from "../application/sync-engine";
import { officialTerritorialConnectors } from "../infrastructure/connectors";
import { BoundsTerritorialFilter, BrowserSyncRepository, HttpDatasetDownloader } from "../infrastructure/browser-infrastructure";
import { ApiSyncRepository } from "../infrastructure/api-sync-repository";
import { isSupabaseConfigured } from "@/infrastructure/supabase";
import { CsvParser, GeoJsonParser, KmlParser, OsmJsonParser, ShapefileParser } from "../infrastructure/parsers";
import type { NormalizedFeature, SyncFrequency, TerritorialSyncRun } from "../domain";

const labels: Record<SyncFrequency, string> = {
  manual: "Manual", daily: "Diaria", weekly: "Semanal", monthly: "Mensual",
};

function nextRun(frequency: SyncFrequency) {
  if (frequency === "manual") return null;
  const date = new Date();
  date.setDate(date.getDate() + (frequency === "daily" ? 1 : frequency === "weekly" ? 7 : 30));
  return date.toISOString();
}

export function DataSyncPanel({
  municipalityId,
  municipalityName,
  provinceName = "Buenos Aires",
  bounds,
}: {
  municipalityId: string;
  municipalityName: string;
  provinceName?: string;
  bounds?: [number, number, number, number];
}) {
  const repository = useMemo(
    () => isSupabaseConfigured() ? new ApiSyncRepository() : new BrowserSyncRepository(),
    [],
  );
  const engine = useMemo(() => new TerritorialDataSyncEngine(
    officialTerritorialConnectors(),
    new HttpDatasetDownloader(),
    [new GeoJsonParser(), new CsvParser(), new ShapefileParser(), new KmlParser(), new OsmJsonParser()],
    new BoundsTerritorialFilter(),
    repository,
    () => new Date(),
    {
      resolve: async (municipalityId) => {
        const response = await fetch("/api/identity-resolution/run", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ municipalityId }),
        });
        if (!response.ok && response.status !== 503) throw new Error("No se pudo ejecutar la resolución de identidades.");
      },
    },
  ), [repository]);
  const [frequency, setFrequency] = useState<SyncFrequency>(() => {
    if (typeof window === "undefined") return "manual";
    const saved = localStorage.getItem(`atiy:data-sync:schedule:${municipalityId}`) as SyncFrequency | null;
    return saved && saved in labels ? saved : "manual";
  });
  const [runs, setRuns] = useState<TerritorialSyncRun[]>([]);
  const [current, setCurrent] = useState<TerritorialSyncRun | null>(null);
  const [features, setFeatures] = useState<NormalizedFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    repository.listRuns(municipalityId).then(setRuns);
    repository.listFeatures(municipalityId).then(setFeatures);
  }, [municipalityId, repository]);

  useEffect(() => {
    const dueAt = localStorage.getItem(`atiy:data-sync:next:${municipalityId}`);
    if (frequency === "manual" || !dueAt || new Date(dueAt).getTime() > Date.now()) return;
    const controller = new AbortController();
    engine.synchronize({
      municipalityId, municipalityName, provinceId: "06", provinceName, bounds,
    }, controller.signal).then(async (result) => {
      setCurrent(result);
      setRuns(await repository.listRuns(municipalityId));
      setFeatures(await repository.listFeatures(municipalityId));
      setMessage(result.status === "completed" ? "Sincronización programada completada." : "La sincronización programada fue parcial.");
      const next = nextRun(frequency);
      if (next) localStorage.setItem(`atiy:data-sync:next:${municipalityId}`, next);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : "Falló la sincronización programada.");
    });
    return () => controller.abort();
  }, [bounds, engine, frequency, municipalityId, municipalityName, provinceName, repository]);

  async function synchronize() {
    setLoading(true);
    setMessage("Descubriendo y validando fuentes públicas…");
    try {
      const result = await engine.synchronize({
        municipalityId, municipalityName, provinceId: "06", provinceName, bounds,
      });
      setCurrent(result);
      setRuns(await repository.listRuns(municipalityId));
      setFeatures(await repository.listFeatures(municipalityId));
      setMessage(result.status === "completed"
        ? "Sincronización completada."
        : "Sincronización parcial: revisá los errores por fuente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible sincronizar.");
    } finally {
      setLoading(false);
    }
  }

  function schedule(value: SyncFrequency) {
    setFrequency(value);
    localStorage.setItem(`atiy:data-sync:schedule:${municipalityId}`, value);
    const date = nextRun(value);
    if (date) localStorage.setItem(`atiy:data-sync:next:${municipalityId}`, date);
    else localStorage.removeItem(`atiy:data-sync:next:${municipalityId}`);
  }

  return (
    <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Territorial Data Sync Engine</p>
          <h3 className="mt-2 text-xl font-black">Sincronizar Datos Públicos</h3>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-[var(--muted)]">
            Descubre fuentes compatibles, valida versiones e importa únicamente diferencias del municipio activo.
          </p>
        </div>
        <button type="button" onClick={synchronize} disabled={loading} className="rounded-xl bg-[var(--primary)] px-5 py-3 text-xs font-extrabold text-white disabled:opacity-60">
          {loading ? "Sincronizando…" : "Sincronizar ahora"}
        </button>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <ReadOnlyField label="Provincia" value={provinceName} />
        <ReadOnlyField label="Municipio" value={municipalityName} />
        <label className="text-xs font-bold">Programación
          <select value={frequency} onChange={(event) => schedule(event.target.value as SyncFrequency)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
            {(Object.keys(labels) as SyncFrequency[]).map((value) => <option key={value} value={value}>{labels[value]}</option>)}
          </select>
        </label>
      </div>
      {message && <p aria-live="polite" className="mt-4 rounded-xl bg-[var(--accent-soft)] p-3 text-xs font-bold">{message}</p>}
      {loading && (
        <div role="status" aria-label="Progreso de sincronización" className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-[var(--accent)]" />
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-bold text-[var(--muted)]">
            <span>1. Descubrir fuentes</span><span>2. Descargar y validar</span><span>3. Comparar e importar</span>
          </div>
        </div>
      )}
      {current && <div className="mt-5 space-y-3">
        {current.results.map((result) => <article key={result.dataset.id} className="rounded-xl border border-[var(--border)] p-4">
          <div className="flex flex-wrap justify-between gap-2"><strong className="text-sm">{result.dataset.name}</strong><span className="text-[10px] font-black">{result.status}</span></div>
          <p className="mt-1 text-[10px] text-[var(--muted)]">{result.dataset.publisher} · {result.dataset.license} · {result.dataset.version}</p>
          <p className="mt-3 text-xs">+{result.delta.added.length} altas · {result.delta.updated.length} actualizadas · {result.delta.removed.length} bajas · {result.delta.unchanged} sin cambios</p>
          {result.issues.map((issue) => <p key={`${issue.code}-${issue.message}`} className="mt-2 text-[10px] text-[var(--danger)]">{issue.message}</p>)}
        </article>)}
        <div className="rounded-xl bg-[var(--surface-muted)] p-4 text-xs">
          <p className="font-extrabold">Cobertura publicada</p>
          <p className="mt-2 text-[var(--muted)]">
            {current.coverage.filter((item) => item.status === "measured").length} categorías con fuente · {current.coverage.filter((item) => item.status === "pending_manual").length} pendientes.
          </p>
          <p className="mt-2 text-[10px] text-[var(--muted)]">No existe una fuente pública verificable para las categorías pendientes de carga manual.</p>
        </div>
      </div>}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section>
          <h4 className="text-sm font-black">Entidades importadas</h4>
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
            {features.length === 0 ? <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-xs text-[var(--muted)]">Todavía no hay entidades importadas para este municipio.</p> : features.slice(0, 20).map((feature) => (
              <article key={`${feature.sourceDatasetId}-${feature.externalId}`} className="rounded-xl border border-[var(--border)] p-3">
                <p className="text-xs font-extrabold">{feature.name}</p>
                <p className="mt-1 text-[10px] text-[var(--muted)]">{feature.category} · {feature.sourceDatasetId}</p>
              </article>
            ))}
          </div>
          {features.length > 20 && <p className="mt-2 text-[10px] text-[var(--muted)]">Mostrando 20 de {features.length} registros.</p>}
        </section>
        <section>
          <h4 className="text-sm font-black">Historial</h4>
          <div className="mt-3 space-y-2">
            {runs.length === 0 ? <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-xs text-[var(--muted)]">Todavía no hay sincronizaciones registradas.</p> : runs.slice(0, 5).map((run) => (
              <article key={run.id} className="rounded-xl border border-[var(--border)] p-3">
                <div className="flex justify-between gap-3 text-xs"><strong>{new Date(run.startedAt).toLocaleString("es-AR")}</strong><span>{run.status}</span></div>
                <p className="mt-1 text-[10px] text-[var(--muted)]">{run.results.length} fuentes · {run.results.reduce((total, item) => total + item.imported, 0)} importadas · {run.results.reduce((total, item) => total + item.discarded, 0)} descartadas</p>
              </article>
            ))}
          </div>
        </section>
      </div>
      <p className="mt-5 text-[10px] text-[var(--muted)]">Próxima consulta: {frequency === "manual" ? "bajo demanda" : nextRun(frequency)?.slice(0, 10)}.</p>
    </section>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return <label className="text-xs font-bold">{label}<input value={value} readOnly className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5" /></label>;
}
