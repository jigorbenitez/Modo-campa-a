"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  territoryElectoralCircuits,
} from "@/data/territorial-base";
import { useTerritorialEntities } from "@/features/territorial-engine";

interface MunicipalityState {
  name: string;
  legalName: string;
  mayor: string;
  province: string;
  country: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  secretariats: string[];
  delegations: string[];
  localities: string[];
  neighborhoods: string[];
}

const storageKey = "atiy:municipality-profile:v1";
const initialState: MunicipalityState = {
  name: "San Fernando",
  legalName: "Municipalidad de San Fernando",
  mayor: "Juan Andreotti",
  province: "Buenos Aires",
  country: "Argentina",
  website: "https://www.sanfernando.gob.ar",
  email: "vecinos@sanfernando.gov.ar",
  phone: "0800-777-6864",
  address: "Constitución 1046, San Fernando",
  secretariats: [
    "Secretaría de Gobierno",
    "Secretaría de Privada y Coordinación",
    "Secretaría de Desarrollo Social, Educación y Medio Ambiente",
    "Secretaría de Salud Pública",
    "Secretaría de Deporte",
    "Secretaría de Economía",
    "Secretaría de Servicios e Higiene Urbana",
    "Secretaría de Cultura y Turismo",
    "Secretaría de Espacios Verdes y Alumbrado Público",
    "Secretaría de Obras e Infraestructura Pública",
    "Secretaría de Protección Ciudadana",
    "Secretaría de Modernización y Gestión Informática",
    "Secretaría de Producción, Empleo y Nuevas Tecnologías",
  ],
  delegations: [],
  localities: ["San Fernando", "Victoria", "Virreyes", "Islas"],
  neighborhoods: ["Barrio Infico"],
};

export function MunicipalityPanel() {
  const territorialEntities = useTerritorialEntities();
  const [state, setState] = useState<MunicipalityState>(initialState);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) setState(JSON.parse(stored) as MunicipalityState);
      } catch {
        setState(initialState);
      }
    });
  }, []);

  function update(key: keyof MunicipalityState, value: string | string[]) {
    setState((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function save() {
    localStorage.setItem(storageKey, JSON.stringify(state));
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header className="flex flex-col justify-between gap-6 border-b border-[var(--border)] pb-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">
            Panel municipal
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">Municipio</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Información institucional, organización y cobertura territorial de San Fernando.
          </p>
        </div>
        <button type="button" onClick={save} className="premium-button h-12 px-5 text-sm font-extrabold">
          {saved ? "Cambios guardados" : "Guardar cambios"}
        </button>
      </header>

      <section aria-label="Indicadores municipales" className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Localidades", state.localities.length],
          ["Barrios verificados", state.neighborhoods.length],
          ["Circuitos oficiales", territoryElectoralCircuits.length],
          ["Entidades geolocalizadas", territorialEntities.length],
          ["Secretarías", state.secretariats.length],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
            <p className="mt-2 text-2xl font-black">{value}</p>
          </article>
        ))}
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_0.82fr]">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <h2 className="text-xl font-extrabold">Información general</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextField label="Nombre" value={state.name} onChange={(value) => update("name", value)} />
            <TextField label="Razón institucional" value={state.legalName} onChange={(value) => update("legalName", value)} />
            <TextField label="Intendente" value={state.mayor} onChange={(value) => update("mayor", value)} />
            <TextField label="Provincia" value={state.province} onChange={(value) => update("province", value)} />
            <TextField label="País" value={state.country} onChange={(value) => update("country", value)} />
            <TextField label="Sitio web" value={state.website} onChange={(value) => update("website", value)} />
            <TextField label="Correo" value={state.email} onChange={(value) => update("email", value)} />
            <TextField label="Teléfono" value={state.phone} onChange={(value) => update("phone", value)} />
            <div className="sm:col-span-2">
              <TextField label="Dirección" value={state.address} onChange={(value) => update("address", value)} />
            </div>
          </div>
        </section>

        <div className="space-y-5">
          <EditableList title="Secretarías" items={state.secretariats} onChange={(items) => update("secretariats", items)} />
          <EditableList title="Delegaciones" items={state.delegations} onChange={(items) => update("delegations", items)} />
        </div>
      </div>

      <section id="territorio" className="mt-6 grid gap-5 lg:grid-cols-3">
        <EditableList title="Localidades" items={state.localities} onChange={(items) => update("localities", items)} />
        <EditableList title="Barrios" items={state.neighborhoods} onChange={(items) => update("neighborhoods", items)} />
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Circuitos electorales</h2>
            <span className="text-xs font-bold text-[var(--muted)]">{territoryElectoralCircuits.length}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {territoryElectoralCircuits.map((circuit) => (
              <span key={circuit.id} className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-extrabold text-[var(--accent-strong)]">
                {circuit.code.replace(/^0+/, "")}
              </span>
            ))}
          </div>
          <Link href="/territorio" className="mt-5 inline-flex text-xs font-extrabold text-[var(--accent)]">
            Abrir capa cartográfica →
          </Link>
        </article>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-extrabold">Presupuesto</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            La gestión detallada de partidas y documentos se realiza en el gestor presupuestario.
          </p>
          <Link href="/presupuesto" className="mt-4 inline-flex text-xs font-extrabold text-[var(--accent)]">Gestionar presupuesto →</Link>
        </article>
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-extrabold">Instituciones</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {territorialEntities.length} puntos con coordenadas y fuente disponibles en el repositorio territorial.
          </p>
          <Link href="/territorio/entidades" className="mt-4 inline-flex text-xs font-extrabold text-[var(--accent)]">Gestionar instituciones →</Link>
        </article>
      </section>

      <p className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-xs leading-5 text-[var(--muted)]">
        Sólo Barrio Infico posee actualmente un polígono barrial publicado y verificable en las fuentes integradas. Los demás nombres pueden administrarse, pero ATIY no dibuja límites sin una fuente pública trazable.
      </p>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-extrabold text-[var(--muted)]">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-sm outline-none focus:border-[var(--accent)]" />
    </label>
  );
}

function EditableList({ title, items, onChange }: { title: string; items: string[]; onChange: (items: string[]) => void }) {
  const [value, setValue] = useState("");
  return (
    <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold">{title}</h2>
        <span className="text-xs font-bold text-[var(--muted)]">{items.length}</span>
      </div>
      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-muted)] p-3">
            <span className="text-xs font-bold">{item}</span>
            <button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="text-sm text-[var(--danger)]" aria-label={`Eliminar ${item}`}>×</button>
          </div>
        ))}
        {!items.length ? <p className="py-3 text-xs text-[var(--muted)]">Sin registros cargados.</p> : null}
      </div>
      <div className="mt-3 flex gap-2">
        <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={`Agregar ${title.toLocaleLowerCase("es-AR")}`} className="h-10 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs" />
        <button type="button" onClick={() => { const next = value.trim(); if (!next) return; onChange([...items, next]); setValue(""); }} className="rounded-xl bg-[var(--surface-muted)] px-3 text-xs font-extrabold">Agregar</button>
      </div>
    </article>
  );
}
