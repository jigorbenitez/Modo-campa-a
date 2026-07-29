import type { TerritoryLayerId } from "@/features/territorio-map";

export type CartographicMode = "territorial" | "electoral" | "institutional" | "operational";

export const cartographicModes: Record<CartographicMode, { label: string; description: string; layers: TerritoryLayerId[] }> = {
  territorial: {
    label: "Territorial",
    description: "Municipio, localidades y barrios verificables",
    layers: ["streets", "municipality", "localities", "neighborhoods"],
  },
  electoral: {
    label: "Electoral",
    description: "Circuitos oficiales y establecimientos educativos",
    layers: ["streets", "municipality", "circuits", "schools"],
  },
  institutional: {
    label: "Institucional",
    description: "Servicios y equipamiento público verificado",
    layers: ["streets", "municipality", "institutions", "schools", "hospitals", "health_centers", "clubs", "green_spaces"],
  },
  operational: {
    label: "Operativo",
    description: "Recorridas, compromisos, problemas y propuestas",
    layers: ["streets", "municipality", "activities", "commitments", "problems", "proposals"],
  },
};

export function MapModeSwitcher({ value, onChange }: { value: CartographicMode; onChange: (mode: CartographicMode) => void }) {
  return (
    <div className="flex max-w-[calc(100vw-2rem)] gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-1 shadow-lg backdrop-blur">
      {(Object.entries(cartographicModes) as Array<[CartographicMode, (typeof cartographicModes)[CartographicMode]]>).map(([id, mode]) => (
        <button key={id} type="button" onClick={() => onChange(id)} aria-pressed={value === id} title={mode.description}
          className={`shrink-0 rounded-lg px-3 py-2 text-[10px] font-extrabold transition ${value === id ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:bg-[var(--surface-muted)]"}`}>
          {mode.label}
        </button>
      ))}
    </div>
  );
}
