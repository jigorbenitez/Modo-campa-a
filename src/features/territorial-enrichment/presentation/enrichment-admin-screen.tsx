"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { TerritorialEntity } from "@/features/territorial-engine/domain";
import { calculateEnrichmentCoverage, PublicMetadataEnrichmentProvider, TerritorialEnrichmentEngine, validateEnrichmentData } from "../application";
import type { EnrichmentRun } from "../domain";
import { categoryLabel } from "@/features/territorial-quality";

const fieldLabels: Record<string, string> = { address: "Dirección", phone: "Teléfono", email: "Email", website: "Web", photo: "Foto", openingHours: "Horario", responsibleOrganization: "Organismo", neighborhood: "Barrio", locality: "Localidad", electoralCircuit: "Circuito" };

export function EnrichmentAdminScreen({ municipalityId, municipalityName, entities }: { municipalityId: string; municipalityName: string; entities: TerritorialEntity[] }) {
  const [loading, setLoading] = useState(false);
  const [run, setRun] = useState<EnrichmentRun | null>(null);
  const [message, setMessage] = useState("");
  const coverage = useMemo(() => entities.map((entity) => ({ entity, coverage: calculateEnrichmentCoverage(entity), issues: validateEnrichmentData(entity) })), [entities]);
  const aggregate = (field: keyof (typeof coverage)[number]["coverage"]["fields"]) => entities.length ? Math.round(coverage.filter((item) => item.coverage.fields[field] === 100).length / entities.length * 100) : 0;
  const completeness = entities.length ? Math.round(coverage.reduce((sum, item) => sum + item.coverage.completeness, 0) / entities.length) : 0;
  const quality = entities.length ? Math.round(coverage.reduce((sum, item) => sum + item.coverage.quality, 0) / entities.length) : 0;
  const categories = useMemo(() => [...new Set(entities.map((entity) => entity.category))].map((category) => {
    const records = coverage.filter((item) => item.entity.category === category);
    return { category, count: records.length, completeness: Math.round(records.reduce((sum, item) => sum + item.coverage.completeness, 0) / records.length) };
  }).sort((a, b) => b.count - a.count), [coverage, entities]);

  async function execute() {
    setLoading(true); setMessage("Consultando metadatos públicos y preservando valores existentes…");
    try {
      const response = await fetch("/api/territorial-enrichment", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "run", municipalityId }) });
      const payload = await response.json();
      if (!response.ok && response.status === 503) {
        const local = await new TerritorialEnrichmentEngine([new PublicMetadataEnrichmentProvider()], { listEntities: async () => entities, saveRun: async () => undefined }).enrich(municipalityId);
        setRun(local); setMessage("Vista previa completada sobre la caché verificable. Configurá Supabase para persistir decisiones e historial.");
      } else {
        if (!response.ok) throw new Error(payload.error ?? "No fue posible enriquecer.");
        setRun(payload.data); setMessage("Enriquecimiento completado. Los conflictos requieren revisión humana.");
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "No fue posible enriquecer."); }
    finally { setLoading(false); }
  }

  async function decide(candidateId: string, action: "accept" | "reject") {
    await fetch("/api/territorial-enrichment", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, municipalityId, candidateId }) });
    setRun((current) => current ? { ...current, candidates: current.candidates.filter((candidate) => candidate.id !== candidateId) } : current);
  }

  return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
    <Link href="/admin" className="text-xs font-extrabold text-[var(--accent)]">← Administración</Link>
    <header className="mt-5 flex flex-col gap-5 border-b border-[var(--border)] pb-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Gemelo Digital</p><h1 className="mt-2 text-3xl font-black">Enriquecimiento Territorial</h1><p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">Completa datos de {municipalityName} desde fuentes trazables sin reemplazar información validada.</p></div><button type="button" onClick={execute} disabled={loading} className="premium-button px-5 py-3 text-xs font-extrabold">{loading ? "Enriqueciendo…" : "Ejecutar enriquecimiento"}</button></header>
    {message && <p aria-live="polite" className="mt-4 rounded-xl bg-[var(--accent-soft)] p-3 text-xs font-bold">{message}</p>}
    <section className="mt-6"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">Estado del Gemelo Digital</p><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[["Entidades", entities.length], ["Calidad", `${quality}%`], ["Completitud", `${completeness}%`], ...(["address","phone","website","photo","openingHours","neighborhood","locality","electoralCircuit"] as const).map((field) => [fieldLabels[field], `${aggregate(field)}%`] as const)].map(([label,value]) => <article key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"><p className="text-[10px] font-extrabold uppercase text-[var(--muted)]">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></article>)}</div></section>
    <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="text-xl font-black">Cobertura por categoría</h2><div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">{categories.slice(0,18).map((item) => <div key={item.category} className="flex items-center justify-between rounded-xl bg-[var(--surface-muted)] p-3 text-xs"><span className="font-bold">{categoryLabel(item.category)} · {item.count}</span><strong>{item.completeness}%</strong></div>)}</div></section>
    <section className="mt-8 grid gap-5 lg:grid-cols-2"><div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="text-xl font-black">Fuentes y cambios</h2>{run ? <div className="mt-4 space-y-2 text-xs"><p>{run.entitiesEnriched} entidades enriquecidas · {run.applied} campos agregados</p><p>{run.conflicts} conflictos · {run.rejected} coincidencias sin cambio</p><p className="text-[var(--muted)]">{run.sources.join(" · ") || "Sin nuevos metadatos verificables"}</p></div> : <p className="mt-3 text-xs text-[var(--muted)]">Ejecutá el motor para ver fuentes consultadas, cambios y conflictos.</p>}</div><div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="text-xl font-black">Auditoría de contacto</h2><p className="mt-3 text-xs text-[var(--muted)]">{coverage.filter((item) => item.issues.length).length} entidades presentan teléfono, email, URL o coordenadas con formato inconsistente.</p></div></section>
    {!!run?.candidates.filter((candidate) => candidate.status === "conflict").length && <section className="mt-8"><h2 className="text-xl font-black">Conflictos pendientes</h2><div className="mt-4 space-y-3">{run.candidates.filter((candidate) => candidate.status === "conflict").slice(0,100).map((candidate) => <article key={candidate.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"><p className="text-xs font-black">{candidate.entityId} · {fieldLabels[candidate.field] ?? candidate.field}</p><p className="mt-2 text-xs text-[var(--muted)]">Actual: {JSON.stringify(candidate.previousValue)} → Propuesto: {JSON.stringify(candidate.proposedValue)}</p><p className="mt-1 text-[10px] text-[var(--muted)]">{candidate.source.name} · {candidate.source.license} · confianza {Math.round(candidate.source.confidence*100)}%</p><div className="mt-3 flex gap-2"><button onClick={() => decide(candidate.id,"accept")} className="rounded-xl bg-[var(--primary)] px-3 py-2 text-xs font-bold text-white">Aceptar</button><button onClick={() => decide(candidate.id,"reject")} className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-bold">Rechazar</button></div></article>)}</div></section>}
  </div>;
}
