"use client";

import { useMemo, useState } from "react";
import type { KnowledgeEntityType } from "@/features/relaciones";
import { RelationshipEngine } from "@/features/relaciones";
import { mockKnowledgeSnapshot } from "@/mock";
import { ContextSummary } from "./context-summary";
import { EntityCard } from "./entity-card";
import { EntityHeader } from "./entity-header";
import { EntitySidebar } from "./entity-sidebar";
import { RelatedItemsPanel } from "./related-items-panel";
import { RelationshipGraph } from "./relationship-graph";
import { TimelinePanel } from "./timeline-panel";

const engine = new RelationshipEngine(mockKnowledgeSnapshot);
const typeFilters: Array<{ id: KnowledgeEntityType | "all"; label: string }> = [
  { id: "all", label: "Todo" },
  { id: "neighborhood", label: "Barrios" },
  { id: "activity", label: "Actividades" },
  { id: "institution", label: "Instituciones" },
  { id: "person", label: "Personas" },
  { id: "document", label: "Documentos" },
  { id: "problem", label: "Problemas" },
  { id: "commitment", label: "Compromisos" },
  { id: "proposal", label: "Propuestas" },
];

export function RelationshipExplorer({ initialEntityId }: { initialEntityId?: string }) {
  const defaultId = engine.getCompleteContext(initialEntityId ?? "")
    ? initialEntityId!
    : "barrio-san-fernando-centro";
  const [selectedId, setSelectedId] = useState(defaultId);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<KnowledgeEntityType | "all">("all");

  const nodes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");
    return engine
      .getNodes()
      .filter((node) => type === "all" || node.type === type)
      .filter(
        (node) =>
          !query ||
          node.title.toLocaleLowerCase("es").includes(query) ||
          node.summary.toLocaleLowerCase("es").includes(query) ||
          node.tags.some((tag) => tag.toLocaleLowerCase("es").includes(query)),
      )
      .sort(
        (a, b) =>
          engine.calculateConnections(b.id).total -
          engine.calculateConnections(a.id).total,
      );
  }, [search, type]);

  const context = engine.getCompleteContext(selectedId);

  function selectEntity(id: string) {
    setSelectedId(id);
    window.history.replaceState(null, "", engine.resolveNavigation(id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!context) return null;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Memoria institucional</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">Explorador de Relaciones</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Navegá la red de actividades, territorio, personas, instituciones y decisiones sin perder el contexto.
          </p>
        </div>
        <div className="flex gap-4 text-xs font-bold text-[var(--muted)]">
          <span><strong className="text-[var(--foreground)]">{engine.getNodes().length}</strong> entidades</span>
          <span><strong className="text-[var(--foreground)]">{engine.getEdges().length}</strong> relaciones</span>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 xl:sticky xl:top-20 xl:h-[calc(100vh-6rem)]">
          <label className="block">
            <span className="sr-only">Buscar entidades</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar en la memoria…"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </label>
          <div className="mt-3 flex gap-1 overflow-x-auto pb-2 xl:flex-wrap">
            {typeFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setType(filter.id)}
                aria-pressed={type === filter.id}
                className={`shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-extrabold ${
                  type === filter.id
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--surface-muted)] text-[var(--muted)]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="mt-2 max-h-72 space-y-1 overflow-y-auto xl:max-h-[calc(100vh-14rem)]">
            {nodes.map((node) => (
              <EntityCard
                key={node.id}
                node={node}
                selected={node.id === selectedId}
                connections={engine.calculateConnections(node.id).total}
                onSelect={selectEntity}
              />
            ))}
            {nodes.length === 0 && (
              <p className="p-4 text-center text-xs leading-5 text-[var(--muted)]">No hay entidades que coincidan con la búsqueda.</p>
            )}
          </div>
        </aside>

        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]">
          <EntityHeader context={context} />
          <div className="grid gap-5 p-4 sm:p-6 2xl:grid-cols-[minmax(0,1fr)_270px]">
            <main className="min-w-0 space-y-6">
              <ContextSummary context={context} />
              <RelatedItemsPanel context={context} onSelect={selectEntity} />
              <TimelinePanel items={context.timeline} />
              <details className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <summary className="cursor-pointer text-sm font-extrabold">Ver grafo de relaciones</summary>
                <p className="mt-2 text-xs text-[var(--muted)]">Vista secundaria para explorar conexiones visuales entre entidades.</p>
                <div className="mt-4"><RelationshipGraph context={context} onSelect={selectEntity} /></div>
              </details>
            </main>
            <EntitySidebar context={context} onSelect={selectEntity} />
          </div>
        </div>
      </div>
    </div>
  );
}
