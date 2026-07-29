"use client";

import Link from "next/link";
import { useState } from "react";
import { DataSyncPanel } from "./data-sync-panel";

export interface SyncMunicipalityOption {
  id: string;
  name: string;
  provinceName?: string;
  active: boolean;
}

export function DataSyncAdminScreen({
  municipalities,
  initialMunicipalityId,
}: {
  municipalities: SyncMunicipalityOption[];
  initialMunicipalityId: string;
}) {
  const [municipalityId, setMunicipalityId] = useState(initialMunicipalityId);
  const selected = municipalities.find((item) => item.id === municipalityId) ?? municipalities[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <header className="border-b border-[var(--border)] pb-7">
        <Link href="/admin" className="text-xs font-extrabold text-[var(--accent-strong)]">← Administración</Link>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">DataHub</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Sincronizar Datos Públicos</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Elegí un municipio, ejecutá el descubrimiento y revisá entidades importadas, diferencias e historial.
        </p>
      </header>

      <section aria-labelledby="municipality-selection" className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <label id="municipality-selection" htmlFor="sync-municipality" className="text-xs font-extrabold">
          Municipio a sincronizar
        </label>
        <select
          id="sync-municipality"
          value={selected?.id ?? ""}
          onChange={(event) => setMunicipalityId(event.target.value)}
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm sm:max-w-md"
        >
          {municipalities.map((municipality) => (
            <option key={municipality.id} value={municipality.id}>
              {municipality.name}{municipality.active ? "" : " · inactivo"}
            </option>
          ))}
        </select>
        {!selected && <p className="mt-3 text-xs text-[var(--danger)]">No hay municipios disponibles para esta cuenta.</p>}
      </section>

      {selected && (
        <DataSyncPanel
          key={selected.id}
          municipalityId={selected.id}
          municipalityName={selected.name}
          provinceName={selected.provinceName ?? "Buenos Aires"}
        />
      )}
    </div>
  );
}
