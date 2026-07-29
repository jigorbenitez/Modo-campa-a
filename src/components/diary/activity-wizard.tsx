"use client";

import { useState } from "react";
import type { ActivityDraft, ActivityRecord } from "@/features/diario";
import { createMockActivity } from "@/features/diario";
import { territoryElectoralCircuits } from "@/mock/territorio-map.mock";

const steps = ["Actividad", "Territorio", "Contexto", "Hallazgos", "Archivos", "Resumen"];
const barrios = [
  { id: "localidad-san-fernando", name: "San Fernando" },
  { id: "localidad-victoria", name: "Victoria" },
  { id: "localidad-virreyes", name: "Virreyes" },
  { id: "barrio-infico", name: "Barrio Infico" },
];
const activityTypes: Array<[ActivityDraft["type"], string]> = [
  ["walk", "Caminata"],
  ["meeting", "Reunión"],
  ["visit", "Visita"],
  ["talk", "Charla"],
  ["event", "Evento"],
  ["conference", "Conferencia"],
  ["university", "Universidad"],
  ["club", "Club"],
  ["business", "Comercio"],
  ["ngo", "ONG"],
  ["institution", "Institución"],
];

function emptyDraft(): ActivityDraft {
  return {
    type: "walk",
    title: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    startTime: new Date().toTimeString().slice(0, 5),
    endTime: "",
    priority: "medium",
    barrioIds: [],
    circuitIds: [],
    location: "San Fernando",
    observations: [],
    participants: [],
    problems: [],
    opportunities: [],
    commitments: [],
    attachments: [],
    tags: [],
  };
}

function draftFromRecord(record?: ActivityRecord): ActivityDraft {
  if (!record) return emptyDraft();
  return {
    type: record.activity.type,
    title: record.activity.title,
    description: record.activity.description,
    date: record.activity.date,
    startTime: record.activity.startTime,
    endTime: record.activity.endTime ?? "",
    priority: record.activity.priority,
    barrioIds: record.activity.barrioIds,
    circuitIds: record.activity.circuitIds ?? [],
    location: record.activity.location?.locality ?? "",
    observations: record.activity.observations,
    participants: record.participantNames,
    problems: record.problems.map((item) => item.title),
    opportunities: record.opportunities.map((item) => item.title),
    commitments: record.commitments.map((item) => item.title),
    attachments: [],
    tags: record.activity.tags,
  };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--muted)]">{children}</span>;
}

function ListInput({
  label,
  placeholder,
  items,
  onChange,
}: {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [value, setValue] = useState("");

  function addItem() {
    const next = value.trim();
    if (!next) return;
    onChange([...items, next]);
    setValue("");
  }

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
        />
        <button type="button" onClick={addItem} className="rounded-xl bg-[var(--surface-muted)] px-4 text-sm font-extrabold">
          Agregar
        </button>
      </div>
      {items.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <button key={`${item}-${index}`} type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-bold text-[var(--accent-strong)]" title="Quitar">
              {item} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ActivityWizard({
  open,
  onClose,
  onComplete,
  initialRecord,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (record: ActivityRecord) => void;
  initialRecord?: ActivityRecord;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ActivityDraft>(() => draftFromRecord(initialRecord));

  if (!open) return null;

  const canContinue =
    step !== 0 || (draft.title.trim().length > 2 && draft.date && draft.startTime);

  function update<K extends keyof ActivityDraft>(key: K, value: ActivityDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function save() {
    const selectedNames = barrios
      .filter((barrio) => draft.barrioIds.includes(barrio.id))
      .map((barrio) => barrio.name);
    const result = createMockActivity(draft, selectedNames);
    onComplete(result.record);
    setDraft(emptyDraft());
    setStep(0);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-[var(--background)] shadow-2xl sm:max-h-[88vh] sm:rounded-3xl">
        <header className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">
                Paso {step + 1} de {steps.length}
              </p>
              <h2 id="wizard-title" className="mt-1 text-lg font-extrabold">{initialRecord ? "Editar actividad" : "Nueva actividad"} · {steps[step]}</h2>
            </div>
            <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-xl border border-[var(--border)] text-xl" aria-label="Cerrar asistente">×</button>
          </div>
          <div className="mt-4 grid grid-cols-6 gap-1.5" aria-label="Progreso">
            {steps.map((label, index) => (
              <div key={label} className={`h-1 rounded-full ${index <= step ? "bg-[var(--accent)]" : "bg-[var(--surface-muted)]"}`} />
            ))}
          </div>
        </header>

        <div className="overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <FieldLabel>Tipo de actividad</FieldLabel>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {activityTypes.map(([value, label]) => (
                    <button key={value} type="button" onClick={() => update("type", value)} className={`rounded-xl border px-2 py-3 text-xs font-bold transition ${draft.type === value ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "border-[var(--border)] bg-[var(--surface)]"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <label>
                <FieldLabel>Título</FieldLabel>
                <input autoFocus value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder="Ej. Recorrida por el corredor comercial" className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
              </label>
              <label>
                <FieldLabel>Descripción breve</FieldLabel>
                <textarea value={draft.description} onChange={(event) => update("description", event.target.value)} placeholder="¿Cuál fue el objetivo de la actividad?" rows={3} className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <label><FieldLabel>Fecha</FieldLabel><input type="date" value={draft.date} onChange={(event) => update("date", event.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm" /></label>
                <label><FieldLabel>Inicio</FieldLabel><input type="time" value={draft.startTime} onChange={(event) => update("startTime", event.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm" /></label>
                <label><FieldLabel>Fin</FieldLabel><input type="time" value={draft.endTime} onChange={(event) => update("endTime", event.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm" /></label>
                <label><FieldLabel>Prioridad</FieldLabel><select value={draft.priority} onChange={(event) => update("priority", event.target.value as ActivityDraft["priority"])} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <FieldLabel>Barrios involucrados</FieldLabel>
                <div className="grid grid-cols-2 gap-3">
                  {barrios.map((barrio) => {
                    const selected = draft.barrioIds.includes(barrio.id);
                    return (
                      <button key={barrio.id} type="button" onClick={() => update("barrioIds", selected ? draft.barrioIds.filter((id) => id !== barrio.id) : [...draft.barrioIds, barrio.id])} className={`rounded-2xl border p-4 text-left transition ${selected ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--surface)]"}`}>
                        <span className="text-sm font-extrabold">{barrio.name}</span>
                        <span className="mt-1 block text-xs text-[var(--muted)]">{selected ? "Seleccionado" : "Tocar para agregar"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <FieldLabel>Circuitos electorales</FieldLabel>
                <p className="mb-3 text-xs leading-5 text-[var(--muted)]">
                  La asociación con circuitos complementa al barrio y utiliza límites oficiales.
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {territoryElectoralCircuits.map((circuit) => {
                    const selected = draft.circuitIds.includes(circuit.id);
                    return (
                      <button
                        key={circuit.id}
                        type="button"
                        onClick={() =>
                          update(
                            "circuitIds",
                            selected
                              ? draft.circuitIds.filter((id) => id !== circuit.id)
                              : [...draft.circuitIds, circuit.id],
                          )
                        }
                        className={`rounded-xl border px-3 py-3 text-left transition ${
                          selected
                            ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                            : "border-[var(--border)] bg-[var(--surface)]"
                        }`}
                      >
                        <span className="block text-sm font-extrabold">
                          {circuit.code.replace(/^0+/, "")}
                        </span>
                        <span className="mt-1 block text-[10px] font-bold uppercase text-[var(--muted)]">
                          Circuito
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <label>
                <FieldLabel>Ubicación o punto de encuentro</FieldLabel>
                <input value={draft.location} onChange={(event) => update("location", event.target.value)} placeholder="Dirección, institución o referencia" className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
              </label>
              <ListInput label="Etiquetas" placeholder="Ej. comercio, movilidad" items={draft.tags} onChange={(items) => update("tags", items)} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <ListInput label="Observaciones" placeholder="Registrar una observación" items={draft.observations} onChange={(items) => update("observations", items)} />
              <ListInput label="Participantes" placeholder="Persona, equipo u organización" items={draft.participants} onChange={(items) => update("participants", items)} />
              <div className="rounded-2xl bg-[var(--accent-soft)] p-4 text-sm leading-6 text-[var(--accent-strong)]">
                Registrá hechos breves y verificables. La clasificación detallada puede completarse después.
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <ListInput label="Problemas detectados" placeholder="¿Qué situación requiere atención?" items={draft.problems} onChange={(items) => update("problems", items)} />
              <ListInput label="Oportunidades" placeholder="¿Qué posibilidad surgió?" items={draft.opportunities} onChange={(items) => update("opportunities", items)} />
              <ListInput label="Compromisos" placeholder="¿Qué quedó por hacer?" items={draft.commitments} onChange={(items) => update("commitments", items)} />
            </div>
          )}

          {step === 4 && (
            <div>
              <FieldLabel>Fotos y videos</FieldLabel>
              <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center transition hover:border-[var(--accent)]">
                <span className="grid size-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-xl font-black text-[var(--accent-strong)]">+</span>
                <span className="mt-3 text-sm font-extrabold">Seleccionar archivos</span>
                <span className="mt-1 text-xs text-[var(--muted)]">Imágenes o videos desde el dispositivo</span>
                <input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={(event) => update("attachments", [...draft.attachments, ...Array.from(event.target.files ?? [])])} />
              </label>
              {draft.attachments.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {draft.attachments.map((file, index) => (
                    <button key={`${file.name}-${index}`} type="button" onClick={() => update("attachments", draft.attachments.filter((_, fileIndex) => fileIndex !== index))} className="min-w-0 rounded-xl bg-[var(--surface-muted)] p-3 text-left">
                      <span className="block truncate text-xs font-extrabold">{file.name}</span>
                      <span className="mt-1 block text-[10px] text-[var(--muted)]">Tocar para quitar</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">{activityTypes.find(([value]) => value === draft.type)?.[1]}</p>
                <h3 className="mt-2 text-xl font-extrabold">{draft.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{draft.description || "Sin descripción adicional."}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-[var(--muted)]">
                  <span>{draft.date}</span><span>·</span><span>{draft.startTime}{draft.endTime ? `–${draft.endTime}` : ""}</span><span>·</span><span>{barrios.filter((item) => draft.barrioIds.includes(item.id)).map((item) => item.name).join(", ") || "Sin barrio"}</span><span>·</span><span>{draft.circuitIds.length ? `${draft.circuitIds.length} circuito${draft.circuitIds.length === 1 ? "" : "s"}` : "Sin circuito"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[["Observaciones", draft.observations.length], ["Participantes", draft.participants.length], ["Hallazgos", draft.problems.length + draft.opportunities.length + draft.commitments.length], ["Archivos", draft.attachments.length]].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-[var(--surface-muted)] p-3"><p className="text-xl font-extrabold">{value}</p><p className="text-[10px] font-bold uppercase text-[var(--muted)]">{label}</p></div>
                ))}
              </div>
              <p className="text-xs leading-5 text-[var(--muted)]">Los cambios se guardan en este dispositivo y actualizan inmediatamente Mi Diario y el mapa.</p>
            </div>
          )}
        </div>

        <footer className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4 sm:px-6">
          <button type="button" onClick={() => step === 0 ? onClose() : setStep((current) => current - 1)} className="rounded-xl px-4 py-3 text-sm font-extrabold text-[var(--muted)]">
            {step === 0 ? "Cancelar" : "Atrás"}
          </button>
          {step < steps.length - 1 ? (
            <button type="button" disabled={!canContinue} onClick={() => setStep((current) => current + 1)} className="premium-button px-5 py-3 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-40">
              Continuar
            </button>
          ) : (
            <button type="button" onClick={save} className="premium-button px-5 py-3 text-sm font-extrabold">
              {initialRecord ? "Guardar cambios" : "Guardar actividad"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
