import type { KnowledgeHistoryItem } from "@/features/relaciones";

export function TimelinePanel({ items }: { items: KnowledgeHistoryItem[] }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">Memoria institucional</p>
      <h2 className="mt-1 text-lg font-extrabold">Cronología relacionada</h2>
      <div className="mt-5 space-y-4 border-l border-[var(--border)] pl-5">
        {items.map((item) => (
          <article key={item.id} className="relative">
            <span className="absolute -left-[1.48rem] top-1 size-2 rounded-full bg-[var(--accent)] ring-4 ring-[var(--surface)]" />
            <p className="text-xs font-extrabold">{item.label}</p>
            {item.description && <p className="mt-1 text-[11px] text-[var(--muted)]">{item.description}</p>}
            <time className="mt-1 block text-[10px] font-bold uppercase text-[var(--muted)]">
              {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.at))}
            </time>
          </article>
        ))}
      </div>
    </section>
  );
}
