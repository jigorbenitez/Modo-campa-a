export type TerritorySearchResult = {
  id: string;
  title: string;
  subtitle: string;
  kind: "feature" | "circuit" | "area";
};

export function TerritorySearch({
  query,
  category,
  categories,
  results,
  onQueryChange,
  onCategoryChange,
  onSelect,
}: {
  query: string;
  category: string;
  categories: readonly string[];
  results: TerritorySearchResult[];
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSelect: (result: TerritorySearchResult) => void;
}) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-2 shadow-lg backdrop-blur">
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Dirección, barrio, circuito o institución"
          aria-label="Buscar en el territorio"
          className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
        <select
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          aria-label="Filtrar por categoría"
          className="max-w-36 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-xs font-bold"
        >
          <option value="all">Todas</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      {query.trim() && (
        <div className="mt-2 max-h-48 overflow-y-auto">
          {results.length ? results.slice(0, 10).map((result) => (
            <button
              key={`${result.kind}-${result.id}`}
              type="button"
              onClick={() => onSelect(result)}
              className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-[var(--surface-muted)]"
            >
              <span className="block font-extrabold">{result.title}</span>
              <span className="text-[var(--muted)]">{result.subtitle}</span>
            </button>
          )) : <p className="px-3 py-2 text-xs text-[var(--muted)]">Sin resultados.</p>}
        </div>
      )}
    </div>
  );
}
