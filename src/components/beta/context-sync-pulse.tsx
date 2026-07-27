"use client";

import Link from "next/link";
import { useBetaActivities } from "@/hooks/use-beta-activities";

const moduleCopy = {
  diary: ["Actividad incorporada", "Ya forma parte de la cronología del Diario."],
  territory: ["Territorio actualizado", "El barrio y sus hallazgos recibieron el nuevo contexto."],
  relationships: ["Relaciones actualizadas", "Personas, instituciones y hallazgos quedaron vinculados."],
  intelligence: ["Contexto recalculado", "Las nuevas señales ya están disponibles para las reglas."],
} as const;

export function ContextSyncPulse({ module }: { module: keyof typeof moduleCopy }) {
  const activities = useBetaActivities();
  const latest = activities[0];
  if (!latest) return null;
  const [title, description] = moduleCopy[module];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-10">
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="mt-1 size-2 shrink-0 rounded-full bg-emerald-500" />
          <div>
            <p className="text-xs font-extrabold">{title}: {latest.title}</p>
            <p className="mt-1 text-[11px] text-[var(--muted)]">{description} {latest.captures.length} aportes registrados.</p>
          </div>
        </div>
        <Link href="/recorrido" className="shrink-0 text-xs font-extrabold text-[var(--accent)]">Abrir registro →</Link>
      </div>
    </div>
  );
}
