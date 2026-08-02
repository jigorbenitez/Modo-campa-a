"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import type { FilterDefinition, FilterState } from "@/application/shared/filters";
import { ReusableFilterBar } from "@/components/ui/reusable-filter-bar";
import { normalizeIdentityName } from "@/features/identity-resolution";
import { categoryLabel, categorySearchTerms } from "@/features/territorial-quality";
import type { TerritorialEntity } from "../domain";
import { TerritorialMapProjectionService, territorialMapLayers } from "../application";

export function TerritorialDirectory({
  entities,
  filters,
}: {
  entities: TerritorialEntity[];
  filters: FilterDefinition[];
}) {
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState<FilterState>({});
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("es"));
  const mapPoints = useMemo(() => new TerritorialMapProjectionService().project(entities), [entities]);

  const filteredEntities = useMemo(() => {
      const queryIdentity = normalizeIdentityName(deferredSearch);
      const exactIdentityMatches = deferredSearch ? new Set(entities.filter((entity) =>
        [entity.name, ...(entity.alternateNames ?? [])]
          .some((name) => normalizeIdentityName(name) === queryIdentity),
      ).map((entity) => entity.id)) : new Set<string>();
      return entities.filter((entity) => {
        const matchesText =
          !deferredSearch ||
          (exactIdentityMatches.size > 0
            ? exactIdentityMatches.has(entity.id)
            :
          [entity.name, ...(entity.alternateNames ?? []), entity.category, categorySearchTerms(entity.category), entity.neighborhoodName, entity.localityName, entity.description]
            .filter(Boolean)
            .some((value) => value?.toLocaleLowerCase("es").includes(deferredSearch)));
        const matchesType = !filterState.type || entity.type === filterState.type;
        const matchesCategory = !filterState.category || entity.category === filterState.category;
        const matchesLocality = !filterState.localityId || entity.localityId === filterState.localityId;
        const matchesNeighborhood = !filterState.neighborhoodId || entity.neighborhoodId === filterState.neighborhoodId;
        return matchesText && matchesType && matchesCategory && matchesLocality && matchesNeighborhood;
      });
    },
    [deferredSearch, entities, filterState],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <header className="flex flex-col justify-between gap-6 border-b border-[var(--border)] pb-8 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">Motor Territorial ATIY</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Territorio</h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            Una base preparada para organizar lugares, servicios, instituciones y movilidad con contexto geográfico.
          </p>
        </div>
        <Link href="/territorio" className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-xs font-extrabold shadow-[var(--shadow-sm)]">
          Abrir Mapa Vivo
        </Link>
      </header>

      <section className="mt-7 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
        <label>
          <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Buscar en territorio</span>
          <div className="flex h-13 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 focus-within:border-[var(--brand-accent)]">
            <span className="text-[var(--accent)]" aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nombre, categoría, barrio, localidad o texto libre"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </label>
        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <ReusableFilterBar
            definitions={filters}
            value={filterState}
            onChange={(id, value) => setFilterState((current) => ({ ...current, [id]: value }))}
            onClear={() => setFilterState({})}
          />
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs font-bold text-[var(--muted)]">{filteredEntities.length} entidades disponibles</p>
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-extrabold text-[var(--accent)]">Repositorio canónico</span>
      </div>

      {filteredEntities.length === 0 ? (
        <TerritorialEmptyState hasQuery={Boolean(search || Object.values(filterState).some(Boolean))} />
      ) : (
        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEntities.map((entity) => (
            <Link key={entity.id} href={`/territorio/entidades/${entity.id}`} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">{categoryLabel(entity.category)}</p>
              <h2 className="mt-2 text-lg font-black">{entity.name}</h2>
              <p className="mt-2 text-xs text-[var(--muted)]">{entity.neighborhoodName ?? entity.localityName ?? "Ubicación pendiente"}</p>
            </Link>
          ))}
        </section>
      )}

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">Integración cartográfica</p><h2 className="mt-1 text-xl font-black">Capas preparadas</h2></div>
          <p className="hidden text-xs text-[var(--muted)] sm:block">Marcadores, clustering y zoom inteligente</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {territorialMapLayers.map((layer) => (
            <article key={layer.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <span className="block size-2 rounded-full bg-[var(--brand-accent)]" />
              <p className="mt-3 text-xs font-extrabold">{layer.label}</p>
              <p className="mt-1 text-[10px] text-[var(--muted)]">
                {mapPoints.filter((point) => point.layerId === layer.id).length} puntos
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function TerritorialEmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <section className="mt-5 grid min-h-80 place-items-center rounded-3xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-8 text-center">
      <div className="max-w-lg">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-xl text-[var(--accent)]">⌖</span>
        <h2 className="mt-5 text-xl font-black">{hasQuery ? "No hay coincidencias" : "La base territorial está lista"}</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {hasQuery
            ? "Podés cambiar el texto o limpiar los filtros. La búsqueda funciona aunque todavía no existan registros."
            : "No se cargaron datos ficticios. En el próximo sprint podrán incorporarse fuentes públicas y registros propios mediante repositorios e importadores desacoplados."}
        </p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" disabled className="h-11 rounded-xl bg-[var(--surface-muted)] px-4 text-xs font-extrabold text-[var(--muted)] opacity-70">Importar CSV, JSON o GeoJSON</button>
          <Link href="/territorio" className="premium-button inline-flex h-11 items-center justify-center px-4 text-xs font-extrabold">Ver mapa actual</Link>
        </div>
      </div>
    </section>
  );
}
