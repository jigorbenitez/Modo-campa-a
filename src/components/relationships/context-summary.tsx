import type { EntityContext } from "@/features/relaciones";

export function ContextSummary({ context }: { context: EntityContext }) {
  const metadata = Object.entries(context.entity.metadata).slice(0, 5);
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">Información general</p>
      {metadata.length ? (
        <dl className="mt-4 grid grid-cols-2 gap-3">
          {metadata.map(([key, value]) => (
            <div key={key} className="rounded-xl bg-[var(--surface-muted)] p-3">
              <dt className="text-[10px] font-bold uppercase text-[var(--muted)]">{key.replaceAll("_", " ")}</dt>
              <dd className="mt-1 text-sm font-extrabold">{Array.isArray(value) ? value.join(", ") : String(value)}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-3 text-sm text-[var(--muted)]">La información principal está expresada en sus relaciones y cronología.</p>
      )}
      {context.entity.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {context.entity.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-bold text-[var(--muted)]">{tag}</span>
          ))}
        </div>
      )}
    </section>
  );
}
