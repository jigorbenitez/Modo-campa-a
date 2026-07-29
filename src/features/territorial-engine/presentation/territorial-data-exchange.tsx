"use client";

import { ChangeEvent, useState } from "react";
import type { ManagedRecord } from "@/components/management/operational-manager";
import { readSimpleXlsx, writeSimpleXlsx } from "@/lib/xlsx-lite";

const STORAGE_KEY = "atiy:territorial-entities:v1";
type PreviewRow = Record<string, string>;

export function TerritorialDataExchange() {
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [issues, setIssues] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [confidence, setConfidence] = useState<"verified" | "high" | "medium" | "low">("medium");

  async function parseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setMessage("");
    try {
      let parsed: PreviewRow[] = [];
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension === "xlsx" || extension === "xls") {
        parsed = readSimpleXlsx(await file.arrayBuffer());
      } else if (extension === "csv") {
        const lines = (await file.text()).replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
        const headers = lines.shift()?.split(",").map((value) => value.trim().replace(/^"|"$/g, "")) ?? [];
        parsed = lines.map((line) => Object.fromEntries(line.split(",").map((value, index) => [headers[index] ?? `columna_${index + 1}`, value.trim().replace(/^"|"$/g, "").replaceAll('""', '"')])));
      } else {
        const json = JSON.parse(await file.text()) as unknown;
        if (typeof json === "object" && json && "features" in json && Array.isArray((json as { features: unknown[] }).features)) {
          parsed = (json as { features: Array<{ properties?: Record<string, unknown>; geometry?: { type?: string; coordinates?: number[] } }> }).features.map((feature) => ({
            ...Object.fromEntries(Object.entries(feature.properties ?? {}).map(([key, value]) => [key, String(value ?? "")])),
            longitude: feature.geometry?.type === "Point" ? String(feature.geometry.coordinates?.[0] ?? "") : "",
            latitude: feature.geometry?.type === "Point" ? String(feature.geometry.coordinates?.[1] ?? "") : "",
          }));
        } else if (Array.isArray(json)) {
          parsed = json.map((item) => Object.fromEntries(Object.entries(item as Record<string, unknown>).map(([key, value]) => [key, String(value ?? "")])));
        } else throw new Error("El JSON debe ser una lista o una colección GeoJSON.");
      }
      const validation = parsed.flatMap((row, index) => {
        const rowIssues: string[] = [];
        if (!String(row.name ?? row.nombre ?? "").trim()) rowIssues.push(`Fila ${index + 2}: falta nombre.`);
        const latitude = Number(row.latitude ?? row.latitud);
        const longitude = Number(row.longitude ?? row.longitud);
        if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) rowIssues.push(`Fila ${index + 2}: latitud inválida.`);
        if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) rowIssues.push(`Fila ${index + 2}: longitud inválida.`);
        return rowIssues;
      });
      setRows(parsed);
      setIssues(validation);
    } catch (error) {
      setRows([]);
      setIssues([error instanceof Error ? error.message : "No se pudo leer el archivo."]);
    }
  }

  function confirmImport() {
    if (!rows.length || issues.length || !sourceName.trim() || !/^https:\/\//.test(sourceUrl)) {
      setMessage("Completá una fuente y URL HTTPS verificable antes de importar.");
      return;
    }
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ManagedRecord[];
    const fingerprints = new Set(current.map((record) => [record.values.name, record.values.latitude, record.values.longitude].join("|").toLocaleLowerCase("es-AR")));
    const now = new Date().toISOString();
    const imported = rows.filter((row) => !fingerprints.has([String(row.name ?? row.nombre ?? ""), String(row.latitude ?? row.latitud ?? ""), String(row.longitude ?? row.longitud ?? "")].join("|").toLocaleLowerCase("es-AR"))).map((row) => ({
      id: `import-${crypto.randomUUID()}`,
      values: {
        name: String(row.name ?? row.nombre ?? ""),
        type: String(row.type ?? row.tipo ?? "institution"),
        locality: String(row.locality ?? row.localidad ?? ""),
        neighborhood: String(row.neighborhood ?? row.barrio ?? ""),
        circuit: String(row.circuit ?? row.circuito ?? ""),
        address: String(row.address ?? row.direccion ?? ""),
        latitude: String(row.latitude ?? row.latitud ?? ""),
        longitude: String(row.longitude ?? row.longitud ?? ""),
        description: String(row.description ?? row.descripcion ?? ""),
        sourceName: sourceName.trim(),
        sourceUrl,
        sourceRetrievedAt: now,
        confidence,
      },
      status: "pending_review",
      attachments: [],
      createdAt: now,
      updatedAt: now,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, ...imported]));
    window.dispatchEvent(new CustomEvent("atiy:operational-records-changed"));
    setMessage(`${imported.length} registros únicos importados como pendientes de revisión. ${rows.length - imported.length} duplicados omitidos.`);
    setRows([]);
    setIssues([]);
  }

  async function exportExcel() {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ManagedRecord[];
    const bytes = writeSimpleXlsx(records.map((record) => ({ id: record.id, estado: record.status, ...record.values })));
    const url = URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "atiy-territorio.xlsx"; anchor.click(); URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ManagedRecord[];
    const columns = ["id", "estado", "name", "type", "locality", "neighborhood", "circuit", "address", "latitude", "longitude", "description"];
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const csv = [columns.join(","), ...records.map((record) => columns.map((column) => escape(column === "id" ? record.id : column === "estado" ? record.status : record.values[column] ?? "")).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "atiy-territorio.csv"; anchor.click(); URL.revokeObjectURL(url);
  }

  return (
    <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-10">
      <details className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <summary className="cursor-pointer text-sm font-extrabold">Importar y exportar datos</summary>
        <div className="mt-4 flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-xl bg-[var(--primary)] px-4 py-2.5 text-xs font-extrabold text-white">Seleccionar CSV, Excel, JSON o GeoJSON<input type="file" accept=".csv,.xlsx,.xls,.json,.geojson" onChange={parseFile} className="sr-only" /></label>
          <button type="button" onClick={exportCsv} className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-xs font-extrabold">Exportar CSV</button>
          <button type="button" onClick={exportExcel} className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-xs font-extrabold">Exportar Excel</button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1.4fr_0.7fr]">
          <input value={sourceName} onChange={(event) => setSourceName(event.target.value)} placeholder="Organismo o fuente" aria-label="Nombre de la fuente" className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs" />
          <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://fuente-oficial…" aria-label="URL de la fuente" className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs" />
          <select value={confidence} onChange={(event) => setConfidence(event.target.value as typeof confidence)} aria-label="Nivel de confianza" className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs"><option value="verified">Verificada</option><option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option></select>
        </div>
        {fileName && <p className="mt-3 text-xs font-bold">{fileName} · {rows.length} filas detectadas</p>}
        {issues.length > 0 && <div role="alert" className="mt-3 max-h-32 overflow-y-auto rounded-xl bg-red-50 p-3 text-xs text-red-800">{issues.slice(0, 20).map((issue) => <p key={issue}>{issue}</p>)}</div>}
        {rows.length > 0 && <div className="mt-3 overflow-x-auto"><table className="min-w-full text-left text-xs"><thead><tr>{Object.keys(rows[0]).slice(0, 8).map((key) => <th key={key} className="border-b border-[var(--border)] p-2">{key}</th>)}</tr></thead><tbody>{rows.slice(0, 8).map((row, index) => <tr key={index}>{Object.keys(rows[0]).slice(0, 8).map((key) => <td key={key} className="border-b border-[var(--border)] p-2">{row[key]}</td>)}</tr>)}</tbody></table><p className="mt-2 text-[10px] text-[var(--muted)]">Vista previa limitada a 8 filas. Ningún dato se guarda hasta confirmar.</p></div>}
        {rows.length > 0 && <button type="button" disabled={issues.length > 0} onClick={confirmImport} className="mt-4 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-extrabold text-[var(--primary)] disabled:opacity-40">Confirmar importación</button>}
        {message && <p role="status" className="mt-3 text-xs font-bold text-[var(--accent-strong)]">{message}</p>}
      </details>
    </section>
  );
}
