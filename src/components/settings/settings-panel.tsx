"use client";

import { ChangeEvent, useState } from "react";

const STORAGE_KEY = "atiy:settings:v1";
type Settings = { municipality: string; primaryColor: string; accentColor: string; emailNotifications: boolean; activityNotifications: boolean; compactMode: boolean };
const defaults: Settings = { municipality: "Municipio de San Fernando", primaryColor: "#0A1D3D", accentColor: "#00BBD4", emailNotifications: true, activityNotifications: true, compactMode: false };

export function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === "undefined") return defaults;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaults, ...JSON.parse(saved) as Partial<Settings> } : defaults;
  });
  const [message, setMessage] = useState("");

  function save() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    document.documentElement.style.setProperty("--primary", settings.primaryColor);
    document.documentElement.style.setProperty("--accent", settings.accentColor);
    document.documentElement.dataset.density = settings.compactMode ? "compact" : "comfortable";
    setMessage("Configuración guardada en este dispositivo.");
  }

  function exportBackup() {
    const data = Object.fromEntries(Object.keys(window.localStorage).filter((key) => key.startsWith("atiy:")).map((key) => [key, window.localStorage.getItem(key)]));
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `atiy-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Respaldo exportado.");
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const parsed = JSON.parse(await file.text()) as Record<string, string | null>;
    Object.entries(parsed).forEach(([key, value]) => {
      if (key.startsWith("atiy:") && typeof value === "string") window.localStorage.setItem(key, value);
    });
    setMessage("Respaldo importado. Recargá la aplicación para aplicar todos los cambios.");
  }

  const switches: Array<[keyof Settings, string, string]> = [
    ["emailNotifications", "Notificaciones por correo", "Avisos de actividad y vencimientos."],
    ["activityNotifications", "Alertas operativas", "Cambios territoriales y compromisos."],
    ["compactMode", "Densidad compacta", "Reduce el espacio vertical en vistas extensas."],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <header className="border-b border-[var(--border)] pb-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Espacio de trabajo</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Configuración</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">Administrá la identidad operativa, las preferencias y los respaldos locales de ATIY.</p>
      </header>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-lg font-extrabold">Municipio e identidad</h2>
          <label className="mt-5 block text-xs font-bold">Nombre del espacio
            <input value={settings.municipality} onChange={(event) => setSettings({ ...settings, municipality: event.target.value })} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm" />
          </label>
          <label className="mt-4 block text-xs font-bold">Logo institucional
            <input type="file" accept="image/png,image/jpeg,image/svg+xml" className="mt-2 block w-full text-xs text-[var(--muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--accent-soft)] file:px-3 file:py-2 file:font-bold" />
          </label>
          <p className="mt-2 text-xs text-[var(--muted)]">La carga queda preparada para almacenamiento persistente; no reemplaza los archivos oficiales sin confirmación.</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <label className="text-xs font-bold">Color principal<input type="color" value={settings.primaryColor} onChange={(event) => setSettings({ ...settings, primaryColor: event.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[var(--border)]" /></label>
            <label className="text-xs font-bold">Color de acento<input type="color" value={settings.accentColor} onChange={(event) => setSettings({ ...settings, accentColor: event.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[var(--border)]" /></label>
          </div>
        </section>
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-lg font-extrabold">Preferencias</h2>
          {switches.map(([key, title, description]) => (
            <label key={key} className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-[var(--surface-muted)] p-4">
              <span><strong className="block text-sm">{title}</strong><span className="text-xs text-[var(--muted)]">{description}</span></span>
              <input type="checkbox" checked={Boolean(settings[key])} onChange={(event) => setSettings({ ...settings, [key]: event.target.checked })} className="h-5 w-5 accent-[var(--accent)]" />
            </label>
          ))}
        </section>
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 lg:col-span-2">
          <h2 className="text-lg font-extrabold">Respaldo y restauración</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Exportá los registros locales de ATIY o restauralos desde un respaldo JSON.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={exportBackup} className="rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-extrabold text-white">Exportar respaldo</button>
            <label className="cursor-pointer rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-extrabold">Importar respaldo<input type="file" accept="application/json" onChange={importBackup} className="sr-only" /></label>
            <button type="button" onClick={save} className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-extrabold text-[var(--primary)]">Guardar cambios</button>
          </div>
          {message && <p role="status" className="mt-4 text-sm font-bold text-[var(--accent-strong)]">{message}</p>}
        </section>
      </div>
    </div>
  );
}
