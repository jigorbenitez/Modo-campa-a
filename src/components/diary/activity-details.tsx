import type { ActivityRecord } from "@/features/diario";
import { ParticipantBadge } from "./participant-badge";
import { AttachmentGallery } from "./attachment-gallery";
import { LinkedEntitiesPanel } from "./linked-entities-panel";

export function ActivityDetails({ record }: { record: ActivityRecord }) {
  return (
    <div className="border-t border-[var(--border)] px-4 py-5 sm:px-6">
      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-6">
          <section>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Observaciones</h3>
            {record.activity.observations.length ? (
              <ul className="mt-3 space-y-2">
                {record.activity.observations.map((observation) => (
                  <li key={observation} className="flex gap-2 text-sm leading-6">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    {observation}
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-sm text-[var(--muted)]">Sin observaciones registradas.</p>}
          </section>

          <section>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Participantes</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {record.participantNames.map((name) => <ParticipantBadge key={name} name={name} />)}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Archivos y fotografías</h3>
            <AttachmentGallery attachments={record.activity.attachments} />
          </section>

          <section>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Historial</h3>
            <div className="mt-3 space-y-3 border-l border-[var(--border)] pl-4">
              {record.activity.statusHistory.map((change) => (
                <div key={`${change.to}-${change.changedAt}`} className="relative">
                  <span className="absolute -left-[1.18rem] top-1.5 size-2 rounded-full bg-[var(--accent)] ring-4 ring-[var(--surface)]" />
                  <p className="text-sm font-bold">Estado: {change.to.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(change.changedAt))}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <LinkedEntitiesPanel record={record} />
      </div>
    </div>
  );
}
