"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { territorialBaseSnapshot } from "@/data/territorial-base";
import { territorialEntityToMapFeature, useTerritorialEntities } from "@/features/territorial-engine";
import {
  buildPriorityInputs,
  defaultPriorityConfiguration,
  TerritorialCoverageService,
  TerritorialPriorityEngine,
  TerritorialSimulationService,
  type SavedScenario,
  type SimulationAction,
  type SimulationActionType,
} from "@/features/territorial-intelligence";

const referenceDate = "2026-07-28T12:00:00.000Z";
const actionLabels: Record<SimulationActionType, string> = {
  tour: "Realizar una recorrida", closeCommitments: "Cerrar compromisos", registerInstitutions: "Registrar instituciones",
  addPhotos: "Agregar fotografías", addDocuments: "Incorporar documentos", createProposals: "Crear propuestas",
  updatePublicData: "Actualizar información pública", registerActivities: "Registrar actividades",
  completeSurveys: "Completar relevamientos", addRelationships: "Agregar relaciones",
};
const actionMinutes: Record<SimulationActionType, number> = {
  tour: 60, closeCommitments: 15, registerInstitutions: 25, addPhotos: 10, addDocuments: 15,
  createProposals: 30, updatePublicData: 20, registerActivities: 20, completeSurveys: 30, addRelationships: 10,
};

function readScenarios(): SavedScenario[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("atiy:simulation-scenarios:municipio-san-fernando:v1") ?? "[]") as SavedScenario[]; }
  catch { return []; }
}

export function ImpactSimulator() {
  const entities = useTerritorialEntities();
  const snapshot = useMemo(() => ({
    ...territorialBaseSnapshot,
    features: entities
      .map((entity) => territorialEntityToMapFeature(entity, territorialBaseSnapshot.neighborhoods, territorialBaseSnapshot.circuits))
      .filter((feature) => feature !== null),
  }), [entities]);
  const [targetId, setTargetId] = useState(territorialBaseSnapshot.circuits[0]?.id ?? "");
  const [type, setType] = useState<SimulationActionType>("tour");
  const [quantity, setQuantity] = useState(1);
  const [optimizerMinutes, setOptimizerMinutes] = useState(120);
  const [actions, setActions] = useState<SimulationAction[]>([]);
  const [scenarios, setScenarios] = useState<SavedScenario[]>(readScenarios);
  const base = useMemo(() => {
    const coverage = new TerritorialCoverageService().calculate(snapshot, referenceDate);
    const inputs = buildPriorityInputs(snapshot, coverage, referenceDate);
    const priorities = new TerritorialPriorityEngine().calculateAll(inputs, defaultPriorityConfiguration, referenceDate);
    return { coverage, inputs, priorities };
  }, [snapshot]);
  const input = base.inputs.find((item) => item.entityId === targetId);
  const coverage = base.coverage.find((item) => item.entityId === targetId);
  const priority = base.priorities.find((item) => item.entityId === targetId);
  const result = input && coverage && priority
    ? new TerritorialSimulationService().simulate(input, coverage, priority, actions, defaultPriorityConfiguration, referenceDate)
    : undefined;

  function addAction() {
    setActions((current) => [...current, { id: `${type}-${current.length + 1}`, type, quantity, targetEntityId: targetId, estimatedMinutes: actionMinutes[type] }]);
  }

  function save() {
    if (!result) return;
    const next = [{ id: `scenario-${Date.now()}`, municipalityId: snapshot.municipioId, name: `Escenario ${scenarios.length + 1}`, result, createdAt: new Date().toISOString() }, ...scenarios];
    setScenarios(next);
    localStorage.setItem("atiy:simulation-scenarios:municipio-san-fernando:v1", JSON.stringify(next));
  }

  function optimize() {
    if (!input) return;
    const candidates: Array<{ type: SimulationActionType; quantity: number }> = [];
    if (input.variables.daysSinceLastTour > 30) candidates.push({ type: "tour", quantity: 1 });
    if (input.variables.overdueCommitments > 0) candidates.push({ type: "closeCommitments", quantity: Math.min(2, input.variables.overdueCommitments) });
    if (input.variables.pendingPhotos > 0) candidates.push({ type: "addPhotos", quantity: Math.min(2, input.variables.pendingPhotos) });
    if (input.variables.pendingDocuments > 0) candidates.push({ type: "addDocuments", quantity: Math.min(2, input.variables.pendingDocuments) });
    if (input.variables.unvisitedInstitutions > 0) candidates.push({ type: "completeSurveys", quantity: 1 });
    let used = 0;
    const optimized: SimulationAction[] = [];
    candidates.forEach((candidate, index) => {
      const minutes = actionMinutes[candidate.type] * candidate.quantity;
      if (used + minutes <= optimizerMinutes) {
        optimized.push({ id: `optimized-${index}`, type: candidate.type, quantity: candidate.quantity, targetEntityId: targetId, estimatedMinutes: actionMinutes[candidate.type] });
        used += minutes;
      }
    });
    setActions(optimized);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-10">
      <Link href="/inteligencia" className="inline-flex items-center gap-2 text-xs font-extrabold text-[var(--muted)]">← Centro de Decisiones</Link>
      <header className="mt-5 border-b border-[var(--border)] pb-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Laboratorio determinístico</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Simulador de Impacto Territorial</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">Compará escenarios antes de actuar. Los cálculos usan reglas documentadas y nunca modifican la base real.</p>
      </header>
      <div className="mt-6 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
        <aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="font-black">Construir escenario</h2>
          <label className="mt-4 block text-xs font-bold">Territorio
            <select value={targetId} onChange={(event) => { setTargetId(event.target.value); setActions([]); }} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent p-3">
              <optgroup label="Circuitos">{snapshot.circuits.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>
              <optgroup label="Localidades y barrios">{snapshot.neighborhoods.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>
            </select>
          </label>
          <label className="mt-4 block text-xs font-bold">Acción
            <select value={type} onChange={(event) => setType(event.target.value as SimulationActionType)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent p-3">
              {Object.entries(actionLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
          <label className="mt-4 block text-xs font-bold">Cantidad<input type="number" min="1" max="20" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent p-3" /></label>
          <button type="button" onClick={addAction} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] p-3 text-xs font-extrabold text-white">Agregar acción</button>
          <div className="mt-5 border-t border-[var(--border)] pt-5">
            <p className="text-xs font-black">Optimizador por impacto</p>
            <p className="mt-1 text-[10px] leading-4 text-[var(--muted)]">Selecciona acciones relacionadas con las brechas actuales sin superar el tiempo.</p>
            <select aria-label="Tiempo del optimizador" value={optimizerMinutes} onChange={(event) => setOptimizerMinutes(Number(event.target.value))} className="mt-3 w-full rounded-xl border border-[var(--border)] bg-transparent p-3 text-xs">
              <option value={60}>1 hora</option><option value={120}>2 horas</option><option value={240}>4 horas</option>
            </select>
            <button type="button" onClick={optimize} className="mt-2 w-full rounded-xl border border-[var(--border)] p-3 text-xs font-extrabold">Proponer mejor combinación</button>
          </div>
          <div className="mt-5 space-y-2">{actions.map((action) => <div key={action.id} className="rounded-xl bg-[var(--surface-muted)] p-3 text-xs"><strong>{action.quantity}×</strong> {actionLabels[action.type]}</div>)}</div>
        </aside>
        <main>
          {!result || actions.length === 0 ? <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center text-sm text-[var(--muted)]">Agregá una o más acciones para calcular su impacto conjunto.</div> : (
            <>
              <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-black">{priority?.entityName}</h2><p className="mt-1 text-xs text-[var(--muted)]">{result.totalMinutes} minutos estimados · cálculo reproducible</p></div><button type="button" onClick={save} className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-xs font-extrabold">Guardar</button></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {result.indicators.map((indicator) => (
                  <article key={indicator.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                    <p className="text-[10px] font-extrabold uppercase text-[var(--muted)]">{indicator.label}</p>
                    <div className="mt-3 flex items-end gap-3"><span className="text-xl text-[var(--muted)]">{indicator.before}</span><span>→</span><strong className="text-3xl">{indicator.after}</strong><span className="text-xs font-bold text-[var(--accent)]">{indicator.difference > 0 ? "+" : ""}{indicator.difference}</span></div>
                    <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{indicator.explanation}</p>
                  </article>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-[var(--accent-soft)] p-5 text-sm"><p><strong>Datos reales intactos.</strong> Este resultado vive únicamente en el escenario y no ejecuta ninguna operación sobre repositorios.</p></div>
            </>
          )}
          {scenarios.length > 0 && <section className="mt-7"><h2 className="font-black">Escenarios guardados</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{scenarios.slice(0, 6).map((scenario) => <article key={scenario.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"><p className="font-bold">{scenario.name}</p><p className="mt-1 text-[10px] text-[var(--muted)]">{scenario.result.actions.length} acciones · {scenario.result.totalMinutes} min</p></article>)}</div></section>}
        </main>
      </div>
    </div>
  );
}
