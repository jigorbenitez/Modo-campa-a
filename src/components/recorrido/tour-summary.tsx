import Link from "next/link";
import type { SavedTourActivity } from "@/features/recorrido";

const kinds = [
  ["photo", "Fotos"],
  ["problem", "Problemas"],
  ["commitment", "Compromisos"],
  ["opportunity", "Oportunidades"],
  ["institution", "Instituciones"],
  ["person", "Personas"],
] as const;

export function TourSummary({ activity }: { activity: SavedTourActivity }) {
  const durationMinutes = Math.max(1, Math.round(activity.durationMs / 60000));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] sm:p-8">
        <div className="grid size-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-2xl">✓</div>
        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">Recorrido guardado</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">{activity.neighborhoodName} quedó actualizado</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{activity.summary}</p>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-[var(--surface-muted)] p-4">
            <p className="text-[10px] font-bold uppercase text-[var(--muted)]">Duración</p>
            <p className="mt-1 text-xl font-black">{durationMinutes} min</p>
          </div>
          <div className="rounded-2xl bg-[var(--surface-muted)] p-4">
            <p className="text-[10px] font-bold uppercase text-[var(--muted)]">Distancia</p>
            <p className="mt-1 text-xl font-black">Pendiente</p>
          </div>
          {kinds.map(([kind, label]) => (
            <div key={kind} className="rounded-2xl bg-[var(--surface-muted)] p-4">
              <p className="text-[10px] font-bold uppercase text-[var(--muted)]">{label}</p>
              <p className="mt-1 text-xl font-black">{activity.captures.filter((capture) => capture.kind === kind).length}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 rounded-2xl border border-[var(--border)] p-4">
          <p className="text-sm font-extrabold">Contexto distribuido</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">El registro local ya está disponible para Diario, Territorio, Relaciones e Inteligencia. Quedará en cola si el dispositivo no tiene conexión.</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/diario" className="premium-button grid h-13 place-items-center text-sm font-extrabold">Ver en el Diario</Link>
          <Link href="/recorrido" className="grid h-13 place-items-center rounded-2xl border border-[var(--border)] text-sm font-extrabold">Nuevo recorrido</Link>
        </div>
      </div>
    </div>
  );
}
