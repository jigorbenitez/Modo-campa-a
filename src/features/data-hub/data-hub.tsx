"use client";

import Link from "next/link";
import { useState } from "react";
import { sanFernandoPublicDatasets } from "./catalog";
import type { PublicDataset } from "./domain";
import { TerritorialDataCoverageService } from "./coverage-service";
import { territorialBaseSnapshot } from "@/data/territorial-base";
import { DataSyncPanel } from "@/features/data-sync";
import { territorialEntityToMapFeature, useTerritorialEntities } from "@/features/territorial-engine";

const statusLabel = { verified: "Verificado", pending: "Pendiente", update_available: "Actualización", rejected: "Rechazado" };

function activeMunicipalityBounds(): [number, number, number, number] | undefined {
  const points = territorialBaseSnapshot.municipalityBoundaries.flat();
  if (!points.length) return undefined;
  const longitudes = points.map((point) => point.longitude);
  const latitudes = points.map((point) => point.latitude);
  return [Math.min(...longitudes), Math.min(...latitudes), Math.max(...longitudes), Math.max(...latitudes)];
}

export function DataHub({ municipalityId, municipalityName = "Municipio" }: { municipalityId: string; municipalityName?: string }) {
  const entities = useTerritorialEntities();
  const datasets = sanFernandoPublicDatasets.filter((dataset) => dataset.municipalityId === municipalityId);
  const [selected, setSelected] = useState<PublicDataset | undefined>(datasets[0]);
  const coverage = new TerritorialDataCoverageService().calculate({
    ...territorialBaseSnapshot,
    features: entities
      .map((entity) => territorialEntityToMapFeature(entity, territorialBaseSnapshot.neighborhoods, territorialBaseSnapshot.circuits))
      .filter((feature) => feature !== null),
  });

  return (
    <section className="mt-8 border-t border-[var(--border)] pt-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">DataHub</p><h2 className="mt-2 text-2xl font-black">Fuentes públicas y versiones</h2><p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">Catálogo trazable por municipio. Los datos oficiales permanecen separados de las observaciones propias.</p></div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          {datasets.map((dataset) => (
            <button type="button" key={dataset.id} onClick={() => setSelected(dataset)} className="grid w-full gap-2 border-b border-[var(--border)] p-4 text-left last:border-0 sm:grid-cols-[1fr_auto]">
              <div><p className="text-sm font-black">{dataset.name}</p><p className="mt-1 text-xs text-[var(--muted)]">{dataset.publisher} · {dataset.format} · {dataset.recordCount} registros</p></div>
              <span className="self-start rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-black">{statusLabel[dataset.status]}</span>
            </button>
          ))}
        </div>
        <aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          {selected && <><p className="text-[10px] font-extrabold uppercase text-[var(--muted)]">Ficha de procedencia</p><h3 className="mt-2 font-black">{selected.name}</h3><dl className="mt-4 space-y-3 text-xs"><Row label="Versión" value={selected.version} /><Row label="Licencia" value={selected.license} /><Row label="Validación" value={selected.validation} /><Row label="Separación" value={selected.provenance} /></dl><a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="mt-5 inline-block text-xs font-extrabold text-[var(--accent-strong)]">Abrir fuente pública ↗</a></>}
        </aside>
      </div>
      <section className="mt-6">
        <h3 className="text-sm font-black">Cobertura automática de los registros aceptados</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">Mide calidad y trazabilidad de lo cargado; no inventa el tamaño del universo municipal.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {coverage.map((item) => <article key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"><div className="flex items-end justify-between"><p className="text-xs font-bold">{item.label}</p><strong className="text-xl">{item.percentage}%</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className="h-full bg-[var(--accent)]" style={{ width: `${item.percentage}%` }} /></div><p className="mt-2 text-[10px] text-[var(--muted)]">{item.completeRecords}/{item.loadedRecords} registros completos. {item.explanation}</p></article>)}
        </div>
      </section>
      <p className="mt-4 text-xs text-[var(--muted)]">Formatos reales: GeoJSON, CSV, Shapefile, GeoPackage, KML y respuestas OSM/Overpass.</p>
      <DataSyncPanel
        municipalityId={municipalityId}
        municipalityName={municipalityName}
        bounds={municipalityName === "San Fernando" ? activeMunicipalityBounds() : undefined}
      />
      <Link href="/admin/data-sync" className="mt-4 inline-flex rounded-xl border border-[var(--border)] px-4 py-3 text-xs font-extrabold">
        Abrir centro de sincronización e historial →
      </Link>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div><dt className="font-extrabold">{label}</dt><dd className="mt-1 leading-5 text-[var(--muted)]">{value}</dd></div>;
}
