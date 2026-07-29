"use client";

import { useState } from "react";
import type { TerritoryLayer, TerritoryLayerId } from "@/features/territorio-map";

const groups: Array<{ label: string; ids: TerritoryLayerId[] }> = [
  { label: "Divisiones", ids: ["municipality", "localities", "neighborhoods", "circuits", "streets"] },
  { label: "Equipamiento", ids: ["schools", "hospitals", "health_centers", "clubs", "firefighters", "police", "libraries", "cultural_centers", "green_spaces", "institutions"] },
  { label: "Gestión", ids: ["activities", "neighbors", "problems", "proposals", "commitments", "documents", "photos", "custom_markers", "heat"] },
];

export function LayerControl({ layers, enabled, onToggle }: { layers: TerritoryLayer[]; enabled: Set<TerritoryLayerId>; onToggle: (id: TerritoryLayerId) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-3 shadow-xl backdrop-blur">
      <button type="button" onClick={() => setCollapsed((value) => !value)} aria-expanded={!collapsed} className="flex w-full items-center justify-between gap-3 px-1 text-left">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">Administrador de capas</span>
        <span aria-hidden>{collapsed ? "+" : "−"}</span>
      </button>
      {!collapsed && <div className="mt-2 max-h-[50vh] space-y-3 overflow-y-auto pr-1">
        {groups.map((group) => (
          <section key={group.label}>
            <p className="px-1 text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">{group.label}</p>
            <div className="mt-1 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
              {layers.filter((layer) => group.ids.includes(layer.id)).map((layer) => {
                const active = enabled.has(layer.id);
                return (
                  <button key={layer.id} type="button" onClick={() => onToggle(layer.id)} aria-pressed={active} title={layer.description} className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-bold transition ${active ? "bg-[var(--surface-muted)] text-[var(--foreground)]" : "text-[var(--muted)] opacity-55"}`}>
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: layer.color }} />
                    <span className="min-w-0 flex-1 truncate">{layer.label}</span>
                    <span className="text-[10px]">{active ? "●" : "○"}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>}
    </div>
  );
}
