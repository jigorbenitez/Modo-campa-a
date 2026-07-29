"use client";

import { useState } from "react";

export type MapPanel = "layers" | "gis" | "history" | "metrics" | "legend" | null;

export function MapCommandMenu({
  activePanel,
  presentationMode,
  hasSelection,
  onPanel,
  onReset,
  onClearSelection,
  onTogglePresentation,
}: {
  activePanel: MapPanel;
  presentationMode: boolean;
  hasSelection: boolean;
  onPanel: (panel: MapPanel) => void;
  onReset: () => void;
  onClearSelection: () => void;
  onTogglePresentation: () => void;
}) {
  const [open, setOpen] = useState(false);
  const actions: Array<[Exclude<MapPanel, null>, string]> = [
    ["layers", "Capas"],
    ["gis", "Herramientas GIS"],
    ["history", "Modo Historia"],
    ["metrics", "Indicadores"],
    ["legend", "Leyenda"],
  ];
  return (
    <div className="relative">
      <button type="button" aria-expanded={open} aria-label="Abrir herramientas del mapa" onClick={() => setOpen((value) => !value)}
        className="grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 text-lg font-black shadow-xl backdrop-blur">
        ⋮
      </button>
      {open && <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl">
        {actions.map(([id, label]) => <button key={id} type="button" onClick={() => { onPanel(activePanel === id ? null : id); setOpen(false); }} className={`block w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold ${activePanel === id ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "hover:bg-[var(--surface-muted)]"}`}>{label}</button>)}
        <div className="my-1 border-t border-[var(--border)]" />
        <button type="button" onClick={() => { onReset(); setOpen(false); }} className="block w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold hover:bg-[var(--surface-muted)]">Volver al municipio</button>
        {hasSelection && <button type="button" onClick={() => { onClearSelection(); setOpen(false); }} className="block w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold hover:bg-[var(--surface-muted)]">Limpiar selección</button>}
        <button type="button" onClick={() => { onTogglePresentation(); setOpen(false); }} className="block w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold hover:bg-[var(--surface-muted)]">{presentationMode ? "Salir de presentación" : "Modo presentación"}</button>
      </div>}
    </div>
  );
}
