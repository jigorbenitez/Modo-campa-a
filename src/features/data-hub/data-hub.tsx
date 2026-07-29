"use client";

import { useState } from "react";
import { sanFernandoPublicDatasets } from "./catalog";
import type { DatasetSync, PublicDataset } from "./domain";

const statusLabel = { verified: "Verificado", pending: "Pendiente", update_available: "Actualización", rejected: "Rechazado" };

export function DataHub({ municipalityId }: { municipalityId: string }) {
  const datasets = sanFernandoPublicDatasets.filter((dataset) => dataset.municipalityId === municipalityId);
  const [selected, setSelected] = useState<PublicDataset | undefined>(datasets[0]);
  const [syncs, setSyncs] = useState<DatasetSync[]>([]);

  function checkUpdates() {
    const checkedAt = new Date().toISOString();
    setSyncs(datasets.map((dataset) => ({
      id: `${dataset.id}-${checkedAt}`,
      datasetId: dataset.id,
      checkedAt,
      result: "unchanged",
      note: "Consulta registrada. No se acepta ninguna versión sin comparación y validación humana.",
    })));
  }

  return (
    <section className="mt-8 border-t border-[var(--border)] pt-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">DataHub</p><h2 className="mt-2 text-2xl font-black">Fuentes públicas y versiones</h2><p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">Catálogo trazable por municipio. Los datos oficiales permanecen separados de las observaciones propias.</p></div>
        <button type="button" onClick={checkUpdates} className="rounded-xl bg-[var(--primary)] px-4 py-3 text-xs font-extrabold text-white">Buscar actualizaciones</button>
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
      {syncs.length > 0 && <div className="mt-4 rounded-2xl border border-[var(--border)] p-4"><p className="text-xs font-black">Historial de sincronización</p><p className="mt-2 text-xs text-[var(--muted)]">{syncs.length} fuentes revisadas · sin cambios aceptados automáticamente.</p></div>}
      <p className="mt-4 text-xs text-[var(--muted)]">Formatos admitidos: CSV, GeoJSON, JSON y XLSX. Shapefile queda disponible mediante el puerto de importación para una conversión geoespacial validada.</p>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div><dt className="font-extrabold">{label}</dt><dd className="mt-1 leading-5 text-[var(--muted)]">{value}</dd></div>;
}
