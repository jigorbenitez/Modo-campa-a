"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IdentityResolutionEngine, type IdentityMatch } from "@/features/identity-resolution";
import { useTerritorialEntities } from "@/features/territorial-engine";
import { TerritorialAuditService, territorialTaxonomy, type QualityIssueType } from "@/features/territorial-quality";

type Decision = "merged" | "ignored" | "later";
type ReviewState = "approved" | "rejected";

export function DataQualityScreen({ municipalityId }: { municipalityId: string }) {
  const entities = useTerritorialEntities();
  const identity = useMemo(() => new IdentityResolutionEngine().resolve(entities), [entities]);
  const report = useMemo(() => new TerritorialAuditService().audit(entities), [entities]);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [reviews, setReviews] = useState<Record<string, ReviewState>>({});
  const [issueType, setIssueType] = useState<QualityIssueType | "all">("all");
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>({});
  const pending = identity.reviewMatches.filter((match) => !decisions[match.id]);
  const resolvedDuplicates = entities.reduce((total, entity) => total + Math.max(0, (entity.externalIds?.length ?? 1) - 1), 0);
  const visibleIssues = report.issues.filter((issue) => (issueType === "all" || issue.type === issueType) && !reviews[issue.id]);
  const issueCount = (type: QualityIssueType) => report.issues.filter((issue) => issue.type === type).length;

  async function decide(match: IdentityMatch, decision: Decision) {
    setDecisions((current) => ({ ...current, [match.id]: decision }));
    await fetch("/api/identity-resolution/decisions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ municipalityId, matchId: match.id, leftId: match.left.id, rightId: match.right.id, score: match.score, decision, evidence: match.evidence }) }).catch(() => undefined);
  }

  async function review(issueId: string, entityId: string, action: ReviewState) {
    setReviews((current) => ({ ...current, [issueId]: action }));
    await fetch("/api/territorial-quality/decisions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ municipalityId, issueId, entityId, action, category: selectedCategories[issueId] }) }).catch(() => undefined);
  }

  return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
    <Link href="/admin" className="text-xs font-extrabold text-[var(--accent-strong)]">← Administración</Link>
    <header className="mt-5 border-b border-[var(--border)] pb-7">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Gemelo Digital 1.0</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Auditoría Territorial</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">Calidad, clasificación, cobertura e identidades evaluadas con reglas reproducibles. Ningún dato fuente se elimina.</p>
    </header>

    <section aria-label="Métricas de calidad" className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Calidad general" value={`${report.qualityScore}%`} />
      <Metric label="Entidades canónicas" value={report.entities} />
      <Metric label="Duplicados resueltos" value={resolvedDuplicates} />
      <Metric label="Duplicados pendientes" value={pending.length} />
      <Metric label="Sin categoría" value={issueCount("category")} />
      <Metric label="Sin coordenadas" value={issueCount("coordinates")} />
      <Metric label="Sin dirección" value={issueCount("address")} />
      <Metric label="Clasificación pendiente" value={issueCount("classification")} />
      <Metric label="Entidades reclasificadas" value={report.correctedClassifications} />
    </section>

    <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">Cobertura del Municipio</p><h2 className="mt-1 text-2xl font-black">Completitud por categoría</h2></div><p className="max-w-md text-right text-xs text-[var(--muted)]">Sin universo oficial publicado: ATIY informa completitud de lo cargado y no inventa faltantes externos.</p></div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {report.coverage.map((metric) => <article key={metric.id} className="rounded-xl bg-[var(--surface-muted)] p-4">
          <div className="flex items-end justify-between"><div><h3 className="font-extrabold">{metric.label}</h3><p className="mt-1 text-[10px] text-[var(--muted)]">{metric.loaded} cargados · universo esperado no publicado</p></div><strong className="text-2xl">{metric.percentage}%</strong></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full bg-[var(--accent)]" style={{ width: `${metric.percentage}%` }} /></div>
          <p className="mt-3 text-[10px] text-[var(--muted)]">{metric.missing} sin dirección · {metric.duplicates} posibles duplicados · {metric.unclassified} sin clasificar</p>
        </article>)}
      </div>
    </section>

    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">Control administrativo</p><h2 className="mt-1 text-2xl font-black">Errores y sugerencias</h2></div>
        <select value={issueType} onChange={(event) => setIssueType(event.target.value as QualityIssueType | "all")} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-bold"><option value="all">Todos ({visibleIssues.length})</option>{["duplicate","name","classification","coordinates","outside","address","source","category"].map((type) => <option key={type} value={type}>{type} ({issueCount(type as QualityIssueType)})</option>)}</select>
      </div>
      <div className="mt-4 space-y-3">
        {visibleIssues.slice(0, 100).map((issue) => { const entity = entities.find((item) => item.id === issue.entityId); return <article key={issue.id} className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-[var(--surface-muted)] px-2 py-1 text-[10px] font-extrabold uppercase">{issue.type}</span><span className="rounded-full bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-extrabold">{issue.severity}</span></div><h3 className="mt-2 font-black">{entity?.name ?? issue.entityId}</h3><p className="mt-1 text-xs text-[var(--muted)]">{issue.message} {issue.suggestion}</p></div>
          <div className="flex flex-wrap items-center gap-2">{issue.type === "classification" && <select value={selectedCategories[issue.id] ?? entity?.category ?? ""} onChange={(event) => setSelectedCategories((current) => ({ ...current, [issue.id]: event.target.value }))} className="max-w-48 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs">{Object.entries(territorialTaxonomy).map(([id, item]) => <option key={id} value={id}>{item.family} · {item.label}</option>)}</select>}<button type="button" onClick={() => review(issue.id, issue.entityId, "approved")} className="rounded-xl bg-[var(--primary)] px-3 py-2 text-xs font-extrabold text-white">Aprobar cambio</button><button type="button" onClick={() => review(issue.id, issue.entityId, "rejected")} className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-extrabold">Rechazar</button></div>
        </article>})}
        {!visibleIssues.length && <p className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">No hay incidencias pendientes para este filtro.</p>}
      </div>
    </section>

    <section className="mt-8"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">Resolución de identidad</p><h2 className="mt-1 text-2xl font-black">Posibles coincidencias</h2></div><span className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-extrabold">{pending.length} pendientes</span></div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">{pending.map((match) => <article key={match.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h3 className="font-black">{match.left.name}</h3><p className="mt-1 text-sm font-bold text-[var(--muted)]">{match.right.name}</p></div><span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-black text-[var(--accent-strong)]">{Math.round(match.score * 100)}%</span></div><ul className="mt-4 space-y-1 text-xs text-[var(--muted)]">{match.reasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => decide(match, "merged")} className="rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-extrabold text-white">Fusionar</button><button type="button" onClick={() => decide(match, "ignored")} className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-extrabold">Ignorar</button><button type="button" onClick={() => decide(match, "later")} className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-extrabold">Revisar luego</button></div></article>)}</div>
    </section>
  </div>;
}

function Metric({ label, value }: { label: string; value: number | string }) { return <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></article>; }
