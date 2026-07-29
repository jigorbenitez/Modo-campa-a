"use client";

import { useState } from "react";
import Link from "next/link";
import type { ActivityRecord } from "@/features/diario";
import { ActivityDetails } from "./activity-details";
import { ActivitySummary } from "./activity-summary";

const typeLabels = {
  walk: "Caminata",
  meeting: "Reunión",
  visit: "Visita",
  talk: "Charla",
  event: "Evento",
  conference: "Conferencia",
  university: "Universidad",
  club: "Club",
  business: "Comercio",
  ngo: "ONG",
  institution: "Institución",
  other: "Otra",
};

const priorityStyles = {
  low: "bg-slate-400",
  medium: "bg-sky-500",
  high: "bg-amber-500",
  critical: "bg-rose-500",
};

export function ActivityCard({
  record,
  defaultOpen = false,
  onEdit,
  onDelete,
  onDuplicate,
  onComplete,
  onExport,
}: {
  record: ActivityRecord;
  defaultOpen?: boolean;
  onEdit?: (record: ActivityRecord) => void;
  onDelete?: (record: ActivityRecord) => void;
  onDuplicate?: (record: ActivityRecord) => void;
  onComplete?: (record: ActivityRecord) => void;
  onExport?: (record: ActivityRecord) => void;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const { activity } = record;

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
      <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="w-full p-4 text-left sm:p-6">
        <div className="flex items-start gap-4">
          <div className="hidden w-14 shrink-0 text-center sm:block">
            <p className="text-2xl font-extrabold">{activity.date.slice(8, 10)}</p>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)]">
              {new Intl.DateTimeFormat("es-AR", { month: "short" }).format(new Date(`${activity.date}T12:00:00`))}
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[var(--accent-strong)]">
                {typeLabels[activity.type]}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--muted)]">
                <span className={`size-1.5 rounded-full ${priorityStyles[activity.priority]}`} />
                Prioridad {activity.priority === "high" ? "alta" : activity.priority === "medium" ? "media" : activity.priority}
              </span>
            </div>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight sm:text-xl">{activity.title}</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{activity.description}</p>
              </div>
              <span className={`mt-1 text-xl text-[var(--muted)] transition ${expanded ? "rotate-45" : ""}`} aria-hidden="true">+</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
              <span className="sm:hidden">{activity.date}</span>
              <span>{activity.startTime}{activity.endTime ? `–${activity.endTime}` : ""}</span>
              <span>{record.barrioNames.join(", ")}</span>
              {activity.circuitIds?.length ? (
                <span>
                  {activity.circuitIds
                    .map((id) => `Circuito ${id.replace("circuito-", "").replace(/^0+/, "")}`)
                    .join(", ")}
                </span>
              ) : null}
              {record.organizerName && <span>Organiza: {record.organizerName}</span>}
            </div>
            <div className="mt-5">
              <ActivitySummary record={record} />
            </div>
          </div>
        </div>
      </button>
      {(onEdit || onDelete || onDuplicate || onComplete || onExport) && (
        <div className="flex items-center gap-2 border-t border-[var(--border)] px-4 py-3 sm:px-6">
          <button type="button" onClick={() => setExpanded(true)} className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-xs font-extrabold">Abrir</button>
          <Link href={`/territorio?activity=${encodeURIComponent(activity.id)}`} className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-xs font-extrabold">Ver ubicación</Link>
          <details className="relative ml-auto">
            <summary aria-label={`Acciones para ${activity.title}`} className="grid size-9 cursor-pointer list-none place-items-center rounded-lg border border-[var(--border)] text-lg font-black">⋯</summary>
            <div className="absolute bottom-11 right-0 z-20 w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl">
              {onEdit && <button type="button" onClick={() => onEdit(record)} className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold hover:bg-[var(--surface-muted)]">Editar</button>}
              {onComplete && activity.status !== "completed" && <button type="button" onClick={() => onComplete(record)} className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold hover:bg-[var(--surface-muted)]">Finalizar</button>}
              {onDuplicate && <button type="button" onClick={() => onDuplicate(record)} className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold hover:bg-[var(--surface-muted)]">Duplicar</button>}
              {onExport && <button type="button" onClick={() => onExport(record)} className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold hover:bg-[var(--surface-muted)]">Exportar</button>}
              {onDelete && <button type="button" onClick={() => onDelete(record)} className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">Eliminar</button>}
            </div>
          </details>
        </div>
      )}
      {expanded && <ActivityDetails record={record} />}
    </article>
  );
}
