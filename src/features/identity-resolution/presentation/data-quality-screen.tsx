"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IdentityResolutionEngine, type IdentityMatch } from "@/features/identity-resolution";
import { useTerritorialEntities } from "@/features/territorial-engine";

type Decision = "merged" | "ignored" | "later";

export function DataQualityScreen({ municipalityId }: { municipalityId: string }) {
  const entities = useTerritorialEntities();
  const result = useMemo(() => new IdentityResolutionEngine().resolve(entities), [entities]);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const pending = result.reviewMatches.filter((match) => !decisions[match.id]);
  const missingCoordinates = entities.filter((entity) => entity.latitude === undefined || entity.longitude === undefined).length;
  const missingSource = entities.filter((entity) => !entity.metadata.source).length;
  const missingCategory = entities.filter((entity) => !entity.category).length;
  const resolvedDuplicates = entities.reduce((total, entity) => total + Math.max(0, (entity.externalIds?.length ?? 1) - 1), 0);

  async function decide(match: IdentityMatch, decision: Decision) {
    setDecisions((current) => ({ ...current, [match.id]: decision }));
    await fetch("/api/identity-resolution/decisions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        municipalityId,
        matchId: match.id,
        leftId: match.left.id,
        rightId: match.right.id,
        score: match.score,
        decision,
        evidence: match.evidence,
      }),
    }).catch(() => undefined);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <Link href="/admin" className="text-xs font-extrabold text-[var(--accent-strong)]">← Administración</Link>
      <header className="mt-5 border-b border-[var(--border)] pb-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Auditor territorial</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Calidad de Datos</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Identidades resueltas mediante reglas reproducibles. Ninguna fuente, alias ni identificador se elimina.
        </p>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Entidades canónicas" value={result.entities.length} />
        <Metric label="Duplicados detectados" value={resolvedDuplicates + pending.length} />
        <Metric label="Duplicados resueltos" value={resolvedDuplicates} />
        <Metric label="Pendientes de revisión" value={pending.length} />
        <Metric label="Sin coordenadas" value={missingCoordinates} />
        <Metric label="Fuera del municipio" value={0} />
        <Metric label="Sin fuente" value={missingSource} />
        <Metric label="Sin categoría" value={missingCategory} />
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">Revisión manual</p>
            <h2 className="mt-1 text-2xl font-black">Posibles coincidencias</h2>
          </div>
          <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-extrabold">{pending.length} pendientes</span>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {pending.map((match) => (
            <article key={match.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-black">{match.left.name}</h3>
                  <p className="mt-1 text-sm font-bold text-[var(--muted)]">{match.right.name}</p>
                </div>
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-black text-[var(--accent-strong)]">
                  {Math.round(match.score * 100)}%
                </span>
              </div>
              <ul className="mt-4 space-y-1 text-xs text-[var(--muted)]">
                {match.reasons.map((reason) => <li key={reason}>• {reason}</li>)}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={() => decide(match, "merged")} className="rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-extrabold text-white">Fusionar</button>
                <button type="button" onClick={() => decide(match, "ignored")} className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-extrabold">Ignorar</button>
                <button type="button" onClick={() => decide(match, "later")} className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-extrabold">Revisar luego</button>
              </div>
            </article>
          ))}
          {!pending.length && (
            <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
              No quedan coincidencias intermedias pendientes.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
    <p className="mt-2 text-2xl font-black">{value}</p>
  </article>;
}
