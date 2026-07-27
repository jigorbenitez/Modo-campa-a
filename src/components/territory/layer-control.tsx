import type { TerritoryLayer, TerritoryLayerId } from "@/features/territorio-map";

export function LayerControl({
  layers,
  enabled,
  onToggle,
}: {
  layers: TerritoryLayer[];
  enabled: Set<TerritoryLayerId>;
  onToggle: (id: TerritoryLayerId) => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-3 shadow-xl backdrop-blur">
      <p className="px-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">Capas visibles</p>
      <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
        {layers.map((layer) => {
          const active = enabled.has(layer.id);
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onToggle(layer.id)}
              aria-pressed={active}
              title={layer.description}
              className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-bold transition ${
                active ? "bg-[var(--surface-muted)] text-[var(--foreground)]" : "text-[var(--muted)] opacity-55"
              }`}
            >
              <span className="size-2.5 rounded-full" style={{ backgroundColor: layer.color }} />
              <span className="min-w-0 flex-1 truncate">{layer.label}</span>
              <span className="text-[10px]">{active ? "●" : "○"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
