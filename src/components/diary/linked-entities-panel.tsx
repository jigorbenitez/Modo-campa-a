import type { ActivityRecord, LinkedItem } from "@/features/diario";

type DisplayItem = LinkedItem & { tone?: string };

function EntitySection({ title, items }: { title: string; items: DisplayItem[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">{title}</h4>
        <span className="text-xs font-bold text-[var(--muted)]">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold">{item.title}</p>
                {item.description && <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.description}</p>}
              </div>
              {item.status && (
                <span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--muted)]">
                  {item.status.replaceAll("_", " ")}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function LinkedEntitiesPanel({ record }: { record: ActivityRecord }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <EntitySection title="Problemas relacionados" items={record.problems.map((item) => ({ ...item, status: item.status }))} />
      <EntitySection title="Oportunidades" items={record.opportunities.map((item) => ({ ...item, status: item.status }))} />
      <EntitySection title="Compromisos" items={record.commitments.map((item) => ({ ...item, status: item.status }))} />
      <EntitySection title="Propuestas relacionadas" items={record.proposals} />
      <EntitySection title="Documentos" items={record.documents} />
      <EntitySection title="Publicaciones" items={record.publications} />
    </div>
  );
}
