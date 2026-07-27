import type { EntityContext } from "@/features/relaciones";

export function RelationshipGraph({
  context,
  onSelect,
}: {
  context: EntityContext;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--sidebar)] p-5 text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-300">Mapa de contexto</p>
          <h2 className="mt-1 text-lg font-extrabold">Red inmediata</h2>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-[var(--sidebar-muted)]">
          {context.connectionCount} nodos
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="col-span-2 rounded-xl bg-emerald-400 p-3 text-emerald-950 sm:col-span-3">
          <p className="text-[10px] font-black uppercase tracking-wide">Entidad actual</p>
          <p className="mt-1 truncate text-sm font-extrabold">{context.entity.title}</p>
        </div>
        {context.relatedNodes.slice(0, 9).map((node) => (
          <button key={node.id} type="button" onClick={() => onSelect(node.id)} className="min-w-0 rounded-xl bg-white/8 p-3 text-left transition hover:bg-white/14">
            <span className="block truncate text-xs font-extrabold">{node.title}</span>
            <span className="mt-1 block text-[9px] uppercase tracking-wide text-[var(--sidebar-muted)]">{node.type}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-[10px] leading-4 text-[var(--sidebar-muted)]">
        Vista accesible preparada para evolucionar hacia un grafo interactivo, sin depender hoy de una librería visual.
      </p>
    </section>
  );
}
