import type { EntityContext } from "@/features/relaciones";

export function EntitySidebar({
  context,
  onSelect,
}: {
  context: EntityContext;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="space-y-5">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">Enlaces rápidos</p>
        <div className="mt-3 space-y-1">
          {context.quickLinks.map((link) => (
            <button key={link.id} type="button" onClick={() => onSelect(link.id)} className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-extrabold transition hover:bg-[var(--surface-muted)]">
              <span className="truncate">{link.label}</span><span className="text-[var(--muted)]">→</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">Actividad reciente</p>
        <div className="mt-3 space-y-3">
          {context.recentActivity.length ? context.recentActivity.map((activity) => (
            <button key={activity.id} type="button" onClick={() => onSelect(activity.id)} className="w-full border-b border-[var(--border)] pb-3 text-left last:border-0 last:pb-0">
              <span className="block text-xs font-extrabold">{activity.title}</span>
              {activity.occurredAt && (
                <span className="mt-1 block text-[10px] text-[var(--muted)]">
                  {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(activity.occurredAt))}
                </span>
              )}
            </button>
          )) : <p className="text-xs leading-5 text-[var(--muted)]">No hay actividades directas en este contexto.</p>}
        </div>
      </section>
    </aside>
  );
}
