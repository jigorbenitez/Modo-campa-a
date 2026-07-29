"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { mockTerritorySnapshot } from "@/mock";
import {
  buildPriorityInputs,
  DecisionService,
  defaultPriorityConfiguration,
  TerritorialCoverageService,
  TerritorialPlannerService,
  TerritorialPriorityEngine,
  type DecisionStatus,
  type PriorityAuditEntry,
  type PriorityConfiguration,
} from "@/features/territorial-intelligence";

const referenceDate = "2026-07-28T12:00:00.000Z";
const levelLabels = { critical: "Crítica", high: "Alta", medium: "Media", low: "Baja", none: "Sin prioridad" };
type View = "decisions" | "coverage" | "planner" | "configuration";

function readConfiguration() {
  if (typeof window === "undefined") return defaultPriorityConfiguration;
  const value = localStorage.getItem(`atiy:priority-config:${mockTerritorySnapshot.municipioId}:v1`);
  if (!value) return defaultPriorityConfiguration;
  try {
    return JSON.parse(value) as PriorityConfiguration;
  } catch {
    return defaultPriorityConfiguration;
  }
}

export function IntelligenceCenter() {
  const [view, setView] = useState<View>("decisions");
  const [configuration, setConfiguration] = useState<PriorityConfiguration>(readConfiguration);
  const [statuses, setStatuses] = useState<Record<string, DecisionStatus>>({});
  const [availableMinutes, setAvailableMinutes] = useState(120);
  const [areaId, setAreaId] = useState("");
  const [auditCount, setAuditCount] = useState(0);

  const model = useMemo(() => {
    const coverage = new TerritorialCoverageService().calculate(mockTerritorySnapshot, referenceDate);
    const inputs = buildPriorityInputs(mockTerritorySnapshot, coverage, referenceDate);
    const priorities = new TerritorialPriorityEngine().calculateAll(inputs, configuration, referenceDate);
    const decisions = new DecisionService().generate(priorities, referenceDate);
    return { coverage, inputs, priorities, decisions };
  }, [configuration]);
  const plan = useMemo(
    () => new TerritorialPlannerService().plan(
      { availableMinutes, areaId: areaId || undefined, center: mockTerritorySnapshot.center },
      model.decisions.filter((decision) => (statuses[decision.id] ?? "pending") === "pending"),
      mockTerritorySnapshot.features,
    ),
    [areaId, availableMinutes, model.decisions, statuses],
  );

  function changeStatus(id: string, status: DecisionStatus) {
    setStatuses((current) => ({ ...current, [id]: status }));
  }

  function updateRule(id: string, patch: { enabled?: boolean; weight?: number }) {
    setConfiguration((current) => ({
      ...current,
      rules: current.rules.map((rule) => rule.id === id ? { ...rule, ...patch } : rule),
    }));
  }

  function saveConfiguration() {
    const next = { ...configuration, updatedAt: new Date().toISOString() };
    const nextPriorities = new TerritorialPriorityEngine().calculateAll(model.inputs, next, referenceDate);
    const entries: PriorityAuditEntry[] = nextPriorities.flatMap((priority) => {
      const previous = model.priorities.find((item) => item.entityId === priority.entityId);
      if (!previous || (previous.level === priority.level && previous.score === priority.score)) return [];
      return [{
        id: `priority-audit-${priority.entityId}-${Date.now()}`,
        municipalityId: next.municipalityId,
        entityId: priority.entityId,
        entityName: priority.entityName,
        previousLevel: previous.level,
        nextLevel: priority.level,
        previousScore: previous.score,
        nextScore: priority.score,
        explanation: `${priority.entityName} pasó de ${levelLabels[previous.level]} (${previous.score}) a ${levelLabels[priority.level]} (${priority.score}) por la nueva configuración de reglas.`,
        changedAt: next.updatedAt,
      }];
    });
    const auditKey = `atiy:priority-audit:${next.municipalityId}:v1`;
    const previousAudit = JSON.parse(localStorage.getItem(auditKey) ?? "[]") as PriorityAuditEntry[];
    localStorage.setItem(auditKey, JSON.stringify([...entries, ...previousAudit]));
    setAuditCount(entries.length);
    setConfiguration(next);
    localStorage.setItem(`atiy:priority-config:${next.municipalityId}:v1`, JSON.stringify(next));
  }

  const tabs: Array<{ id: View; label: string }> = [
    { id: "decisions", label: "Decisiones" },
    { id: "coverage", label: "Cobertura" },
    { id: "planner", label: "Planificador" },
    { id: "configuration", label: "Reglas" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10">
      <header className="border-b border-[var(--border)] pb-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Centro de decisiones</p>
        <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-black tracking-[-0.035em] sm:text-4xl">Qué hacer primero, y por qué.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Prioridades calculadas con reglas auditables sobre la base territorial de San Fernando. Sin IA ni aleatoriedad.
            </p>
          </div>
          <Link href="/simulador" className="rounded-xl bg-[var(--primary)] px-4 py-3 text-center text-sm font-extrabold text-white shadow-sm">
            Simular impacto
          </Link>
        </div>
      </header>

      <nav aria-label="Vistas de inteligencia" className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ id, label }) => (
          <button key={id} type="button" onClick={() => setView(id)} aria-pressed={view === id}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold ${view === id ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] bg-[var(--surface)]"}`}>
            {label}
          </button>
        ))}
      </nav>

      {view === "decisions" && (
        <section className="mt-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <Summary label="Requieren atención" value={model.decisions.filter((item) => ["critical", "high"].includes(item.priority.level)).length} />
            <Summary label="Cobertura crítica" value={model.coverage.filter((item) => item.level === "critical").length} />
            <Summary label="Acciones pendientes" value={model.decisions.filter((item) => (statuses[item.id] ?? "pending") === "pending").length} />
          </div>
          <div className="mt-5 space-y-3">
            {model.decisions.slice(0, 15).map((decision, index) => {
              const status = statuses[decision.id] ?? "pending";
              return (
                <article key={decision.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-muted)] text-sm font-black">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full px-2.5 py-1 text-[10px] font-black text-white" style={{ background: configuration.colors[decision.priority.level] }}>
                          {levelLabels[decision.priority.level]} · {decision.priority.score}
                        </span>
                        <span className="text-xs text-[var(--muted)]">{decision.priority.entityType}</span>
                      </div>
                      <h2 className="mt-2 text-lg font-black">{decision.title}</h2>
                      <p className="mt-1 text-sm text-[var(--muted)]">{decision.reason}</p>
                      <p className="mt-3 text-xs font-bold">{decision.expectedImpact}</p>
                      <div className="mt-3 text-xs text-[var(--muted)]">{decision.estimatedMinutes} min estimados</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(["completed", "postponed", "discarded"] as DecisionStatus[]).map((next) => (
                        <button key={next} type="button" onClick={() => changeStatus(decision.id, status === next ? "pending" : next)}
                          className="rounded-lg border border-[var(--border)] px-3 py-2 text-[10px] font-extrabold">
                          {next === "completed" ? "Completar" : next === "postponed" ? "Posponer" : "Descartar"}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {view === "coverage" && (
        <section className="mt-6 grid gap-3 lg:grid-cols-2">
          {model.coverage.map((coverage) => (
            <article key={coverage.entityId} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex items-center justify-between gap-4">
                <div><p className="text-[10px] font-extrabold uppercase text-[var(--muted)]">{coverage.entityType}</p><h2 className="mt-1 font-black">{coverage.entityName}</h2></div>
                <strong className="text-2xl">{coverage.percentage}%</strong>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className="h-full bg-[var(--accent)]" style={{ width: `${coverage.percentage}%` }} /></div>
              <ul className="mt-4 grid gap-2 text-xs text-[var(--muted)] sm:grid-cols-2">
                {coverage.factors.map((factor) => <li key={factor.id}>{factor.evidence}</li>)}
              </ul>
            </article>
          ))}
        </section>
      )}

      {view === "planner" && (
        <section className="mt-6 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-black">Disponibilidad</h2>
            <label className="mt-4 block text-xs font-bold">Tiempo disponible
              <select value={availableMinutes} onChange={(event) => setAvailableMinutes(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent p-3">
                <option value={60}>1 hora</option><option value={120}>2 horas</option><option value={240}>4 horas</option>
              </select>
            </label>
            <label className="mt-4 block text-xs font-bold">Localidad o barrio
              <select value={areaId} onChange={(event) => setAreaId(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent p-3">
                <option value="">Todo San Fernando</option>
                {mockTerritorySnapshot.neighborhoods.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
              </select>
            </label>
            <p className="mt-4 text-xs leading-5 text-[var(--muted)]">{plan.explanation}</p>
          </div>
          <div className="space-y-3">
            {plan.actions.length === 0 ? <Empty text="No hay acciones compatibles con el tiempo y la zona elegidos." /> : plan.actions.map((action) => (
              <article key={action.decision.id} className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <span className="font-black text-[var(--accent)]">{action.sequence}</span>
                <div><h3 className="font-black">{action.decision.title}</h3><p className="mt-1 text-xs text-[var(--muted)]">{action.decision.reason} · {action.travelDistanceKm} km desde el punto anterior</p></div>
              </article>
            ))}
          </div>
        </section>
      )}

      {view === "configuration" && (
        <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-lg font-black">Reglas del municipio</h2><p className="mt-1 text-xs text-[var(--muted)]">Cada cambio recalcula las mismas entradas de forma reproducible.</p>{auditCount > 0 && <p className="mt-2 text-xs font-bold text-[var(--accent-strong)]">{auditCount} cambios de prioridad registrados en auditoría.</p>}</div><button type="button" onClick={saveConfiguration} className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-xs font-extrabold text-white">Guardar configuración</button></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {(["critical", "high", "medium", "low"] as const).map((level) => (
              <label key={level} className="rounded-xl bg-[var(--surface-muted)] p-3 text-xs font-bold">{levelLabels[level]}
                <div className="mt-2 flex gap-2">
                  <input aria-label={`Color ${levelLabels[level]}`} type="color" value={configuration.colors[level]} onChange={(event) => setConfiguration((current) => ({ ...current, colors: { ...current.colors, [level]: event.target.value } }))} />
                  <input aria-label={`Umbral ${levelLabels[level]}`} type="number" min="0" max="100" value={configuration.thresholds[level]} onChange={(event) => setConfiguration((current) => ({ ...current, thresholds: { ...current.thresholds, [level]: Number(event.target.value) } }))} className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-transparent px-2" />
                </div>
              </label>
            ))}
          </div>
          <div className="mt-5 divide-y divide-[var(--border)]">
            {configuration.rules.map((rule) => (
              <div key={rule.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto_160px] sm:items-center">
                <div><p className="text-sm font-bold">{rule.label}</p><p className="text-[10px] text-[var(--muted)]">Tope de normalización: {rule.cap}</p></div>
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={rule.enabled} onChange={(event) => updateRule(rule.id, { enabled: event.target.checked })} /> Activa</label>
                <label className="text-xs">Peso {rule.weight}<input className="mt-1 w-full accent-[var(--accent)]" type="range" min="0" max="40" value={rule.weight} onChange={(event) => updateRule(rule.id, { weight: Number(event.target.value) })} /></label>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)]">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></article>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">{text}</div>;
}
