"use client";

import { useState } from "react";
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

export function ActivityCard({ record, defaultOpen = false }: { record: ActivityRecord; defaultOpen?: boolean }) {
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
              {record.organizerName && <span>Organiza: {record.organizerName}</span>}
            </div>
            <div className="mt-5">
              <ActivitySummary record={record} />
            </div>
          </div>
        </div>
      </button>
      {expanded && <ActivityDetails record={record} />}
    </article>
  );
}
