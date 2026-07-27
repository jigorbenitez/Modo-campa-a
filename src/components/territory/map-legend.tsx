import type { TerritoryLayer, TerritoryLayerId } from "@/features/territorio-map";

export function MapLegend({ layers, enabled }: { layers: TerritoryLayer[]; enabled: Set<TerritoryLayerId> }) {
  const visible = layers.filter((layer) => enabled.has(layer.id) && !["neighborhoods", "heat"].includes(layer.id));
  return (
    <div className="flex max-w-full gap-3 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]/90 px-3 py-2 text-[10px] font-bold text-[var(--muted)] shadow-lg backdrop-blur">
      {visible.map((layer) => (
        <span key={layer.id} className="flex shrink-0 items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: layer.color }} />
          {layer.label}
        </span>
      ))}
    </div>
  );
}
