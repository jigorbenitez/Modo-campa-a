"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { mockTerritorySnapshot } from "@/mock";

type Result = { id: string; title: string; context: string; href: string };
const operationalKeys = [
  ["atiy:neighbors:v1", "Vecino", "/vecinos"],
  ["atiy:proposals:v1", "Propuesta", "/propuestas"],
  ["atiy:agenda:v1", "Agenda", "/agenda"],
] as const;

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [localResults, setLocalResults] = useState<Result[]>([]);

  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, []);

  useEffect(() => {
    if (!open) return;
    const found = operationalKeys.flatMap(([key, label, href]) => {
      try {
        const records = JSON.parse(localStorage.getItem(key) ?? "[]") as Array<{ id: string; values: Record<string, string> }>;
        return records.map((record) => ({ id: record.id, title: Object.values(record.values).find(Boolean) ?? label, context: label, href }));
      } catch { return []; }
    });
    queueMicrotask(() => setLocalResults(found));
  }, [open]);

  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("es-AR");
    if (!term) return [];
    const territory: Result[] = [
      ...mockTerritorySnapshot.neighborhoods.map((area) => ({ id: area.id, title: area.name, context: area.level === "locality" ? "Localidad" : "Barrio", href: `/territorio?area=${area.id}` })),
      ...mockTerritorySnapshot.circuits.map((circuit) => ({ id: circuit.id, title: circuit.name, context: "Circuito", href: `/territorio?circuit=${circuit.id}` })),
      ...mockTerritorySnapshot.features.map((feature) => ({ id: feature.id, title: feature.title, context: `${feature.subtype ?? feature.kind} · ${feature.localidad}`, href: `/territorio?entity=${feature.id}` })),
    ];
    return [...territory, ...localResults].filter((item) => `${item.title} ${item.context}`.toLocaleLowerCase("es-AR").includes(term)).slice(0, 12);
  }, [localResults, query]);

  function choose(result: Result) {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="hidden h-10 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-bold text-[var(--muted)] shadow-sm sm:flex" aria-label="Abrir búsqueda global"><span>Buscar en ATIY</span><kbd className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[9px]">Ctrl K</kbd></button>
      <button type="button" onClick={() => setOpen(true)} className="fixed bottom-24 right-4 z-40 grid size-12 place-items-center rounded-full bg-[var(--accent)] text-xl font-black text-[var(--primary)] shadow-xl sm:hidden" aria-label="Abrir búsqueda global">⌕</button>
      {open && <div className="fixed inset-0 z-[1000] flex items-start justify-center bg-[var(--primary)]/45 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-label="Comando rápido" className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
          <div className="flex items-center gap-3 border-b border-[var(--border)] p-4"><span aria-hidden>⌕</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Dirección, barrio, circuito, institución, vecino…" className="min-w-0 flex-1 bg-transparent text-base outline-none" /><button type="button" onClick={() => setOpen(false)} className="text-xs font-bold text-[var(--muted)]">Esc</button></div>
          <div className="max-h-[55vh] overflow-y-auto p-2">
            {query.trim() && !results.length && <p className="p-6 text-center text-sm text-[var(--muted)]">No hay coincidencias en la información cargada.</p>}
            {results.map((result) => <button key={`${result.href}-${result.id}`} type="button" onClick={() => choose(result)} className="flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left hover:bg-[var(--surface-muted)]"><span><strong className="block text-sm">{result.title}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{result.context}</span></span><span aria-hidden>→</span></button>)}
          </div>
          <p className="border-t border-[var(--border)] px-4 py-3 text-[10px] text-[var(--muted)]">Busca únicamente en datos disponibles y verificados o cargados por el equipo.</p>
        </section>
      </div>}
    </>
  );
}
