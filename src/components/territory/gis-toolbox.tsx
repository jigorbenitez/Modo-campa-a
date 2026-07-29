"use client";

import { useState } from "react";
import type { TerritoryCircuit, TerritoryFeature, TerritoryNeighborhood } from "@/features/territorio-map";

type Tool = "navigate" | "distance" | "area" | "zone" | "multi" | "create";

export function GisToolbox({
  activeTool,
  onToolChange,
  circuits,
  neighborhoods,
  features,
  selectedCircuitIds,
  onClearMultiSelection,
}: {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  circuits: TerritoryCircuit[];
  neighborhoods: TerritoryNeighborhood[];
  features: TerritoryFeature[];
  selectedCircuitIds: Set<string>;
  onClearMultiSelection: () => void;
}) {
  const [open, setOpen] = useState(false);

  function download(name: string, content: string, type: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function exportGeoJson() {
    const selected = selectedCircuitIds.size ? circuits.filter((item) => selectedCircuitIds.has(item.id)) : circuits;
    const collection = {
      type: "FeatureCollection",
      features: [
        ...selected.map((circuit) => ({
          type: "Feature",
          properties: { id: circuit.id, code: circuit.code, name: circuit.name, source: circuit.source, license: circuit.license },
          geometry: { type: "MultiPolygon", coordinates: circuit.boundaries.map((ring) => [ring.map((point) => [point.longitude, point.latitude])]) },
        })),
        ...features.map((feature) => ({
          type: "Feature",
          properties: { id: feature.id, title: feature.title, type: feature.kind, status: feature.status },
          geometry: { type: "Point", coordinates: [feature.point.longitude, feature.point.latitude] },
        })),
      ],
    };
    download("atiy-seleccion-territorial.geojson", JSON.stringify(collection, null, 2), "application/geo+json");
  }

  function exportPng() {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 900;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#F8FAFC";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#0A1D3D";
    context.font = "700 38px sans-serif";
    context.fillText("ATIY · Selección territorial", 60, 70);
    const selected = selectedCircuitIds.size ? circuits.filter((item) => selectedCircuitIds.has(item.id)) : circuits;
    const points = selected.flatMap((item) => item.boundaries.flat());
    if (!points.length) return;
    const minX = Math.min(...points.map((point) => point.longitude));
    const maxX = Math.max(...points.map((point) => point.longitude));
    const minY = Math.min(...points.map((point) => point.latitude));
    const maxY = Math.max(...points.map((point) => point.latitude));
    const project = (longitude: number, latitude: number) => [80 + ((longitude - minX) / (maxX - minX || 1)) * 1440, 830 - ((latitude - minY) / (maxY - minY || 1)) * 700] as const;
    selected.forEach((circuit) => circuit.boundaries.forEach((ring) => {
      context.beginPath();
      ring.forEach((point, index) => {
        const [x, y] = project(point.longitude, point.latitude);
        if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
      });
      context.closePath();
      context.fillStyle = "rgba(0,187,212,.10)";
      context.strokeStyle = "#00BBD4";
      context.lineWidth = 3;
      context.fill();
      context.stroke();
    }));
    const link = document.createElement("a");
    link.download = "atiy-vista-territorial.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const tools: Array<[Tool, string]> = [["navigate", "Navegar"], ["distance", "Medir distancia"], ["area", "Medir superficie"], ["zone", "Zona temporal"], ["multi", "Selección múltiple"], ["create", "Crear marcador"]];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-2 shadow-xl backdrop-blur">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs font-extrabold">
        Herramientas GIS <span>{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-1 w-64 space-y-1">
        {tools.map(([id, label]) => <button key={id} type="button" onClick={() => onToolChange(id)} aria-pressed={activeTool === id} className={`block w-full rounded-lg px-3 py-2 text-left text-xs font-bold ${activeTool === id ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--surface-muted)]"}`}>{label}</button>)}
        {activeTool !== "navigate" && <p className="rounded-lg bg-[var(--accent-soft)] p-2 text-[10px] leading-4 text-[var(--accent-strong)]">{activeTool === "multi" ? "Tocá circuitos para agregarlos o quitarlos de la selección." : activeTool === "create" ? "Tocá el mapa para crear un punto georreferenciado." : "Tocá el mapa para registrar vértices de la medición temporal."}</p>}
        {selectedCircuitIds.size > 0 && <button type="button" onClick={onClearMultiSelection} className="block w-full rounded-lg border border-[var(--border)] px-3 py-2 text-left text-xs font-bold">Limpiar {selectedCircuitIds.size} seleccionados</button>}
        <div className="my-2 border-t border-[var(--border)]" />
        <button type="button" onClick={exportGeoJson} className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold hover:bg-[var(--surface-muted)]">Exportar GeoJSON</button>
        <button type="button" onClick={exportPng} className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold hover:bg-[var(--surface-muted)]">Exportar imagen PNG</button>
        <button type="button" onClick={() => window.print()} className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold hover:bg-[var(--surface-muted)]">Imprimir / guardar PDF</button>
        <p className="px-3 pb-1 text-[9px] text-[var(--muted)]">{neighborhoods.length} áreas y {features.length} elementos en la vista.</p>
      </div>}
    </div>
  );
}

export type GisTool = Tool;
