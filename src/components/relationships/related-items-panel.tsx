import type { EntityContext, KnowledgeEdge } from "@/features/relaciones";
import { ConnectionBadge } from "./connection-badge";

export function RelatedItemsPanel({
  context,
  onSelect,
}: {
  context: EntityContext;
  onSelect: (id: string) => void;
}) {
  function edgeFor(id: string): KnowledgeEdge | undefined {
    return context.connections.find(
      (edge) => edge.sourceId === id || edge.targetId === id,
    );
  }

  return (
    <section>
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">Contexto conectado</p>
        <h2 className="mt-1 text-xl font-extrabold">Relaciones principales</h2>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {context.groups.map((group) => (
          <div key={group.type} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-[0.1em]">{group.label}</h3>
              <span className="text-xs font-bold text-[var(--muted)]">{group.nodes.length}</span>
            </div>
            <div className="mt-3 space-y-2">
              {group.nodes.map((node) => {
                const edge = edgeFor(node.id);
                return (
                  <button key={node.id} type="button" onClick={() => onSelect(node.id)} className="w-full rounded-xl bg-[var(--surface-muted)] p-3 text-left transition hover:ring-1 hover:ring-[var(--accent)]">
                    <span className="block text-sm font-extrabold">{node.title}</span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[var(--muted)]">{node.summary}</span>
                    {edge && <span className="mt-2 block"><ConnectionBadge edge={edge} /></span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
