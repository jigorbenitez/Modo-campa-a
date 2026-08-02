"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ActivityRecord } from "@/features/diario";
import { useActivityJournal } from "@/hooks/use-activity-journal";
import { ActivityTimeline } from "./activity-timeline";
import { ActivityWizard } from "./activity-wizard";
import { useTerritorialEntities } from "@/features/territorial-engine";

const emptyActivityRecords: ActivityRecord[] = [];

export function CampaignDiary() {
  const searchParams = useSearchParams();
  const territorialEntities = useTerritorialEntities();
  const { records, replace } = useActivityJournal(emptyActivityRecords);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityRecord>();
  const [newestId, setNewestId] = useState<string>();
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [institution, setInstitution] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const requestedActivityId = searchParams.get("activity");
  const visibleRequestedActivityId = requestedActivityId && records.some((record) => record.activity.id === requestedActivityId)
    ? requestedActivityId
    : undefined;

  useEffect(() => {
    if (!visibleRequestedActivityId) return;
    const frame = requestAnimationFrame(() => document.getElementById(`activity-${visibleRequestedActivityId}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
    return () => cancelAnimationFrame(frame);
  }, [visibleRequestedActivityId]);

  const areaOptions = useMemo(
    () => [...new Set(records.flatMap((record) => record.barrioNames))].sort(),
    [records],
  );
  const institutionOptions = useMemo(
    () => [...new Set(records.map((record) => record.organizerName).filter(Boolean) as string[])].sort(),
    [records],
  );
  const visibleRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es-AR");
    return records
      .filter((record) => {
        const searchable = [
          record.activity.title,
          record.activity.description,
          record.activity.observations.join(" "),
          record.participantNames.join(" "),
          record.barrioNames.join(" "),
          record.activity.circuitIds?.join(" ") ?? "",
        ].join(" ").toLocaleLowerCase("es-AR");
        return (
          (!normalizedQuery || searchable.includes(normalizedQuery)) &&
          (area === "all" || record.barrioNames.includes(area)) &&
          (institution === "all" || record.organizerName === institution) &&
          (type === "all" || record.activity.type === type) &&
          (status === "all" || record.activity.status === status)
        );
      })
      .sort((a, b) => {
        const left = `${a.activity.date}T${a.activity.startTime}`;
        const right = `${b.activity.date}T${b.activity.startTime}`;
        return order === "desc" ? right.localeCompare(left) : left.localeCompare(right);
      });
  }, [area, institution, order, query, records, status, type]);

  function completeRecord(record: ActivityRecord) {
    if (editing) {
      const now = new Date().toISOString();
      const updated: ActivityRecord = {
        ...record,
        activity: {
          ...record.activity,
          id: editing.activity.id,
          attachments: [...editing.activity.attachments, ...record.activity.attachments],
          audit: {
            ...editing.activity.audit,
            updatedAt: now,
            version: editing.activity.audit.version + 1,
          },
        },
      };
      replace(records.map((item) => item.activity.id === editing.activity.id ? updated : item));
      setNewestId(updated.activity.id);
    } else {
      replace([record, ...records]);
      setNewestId(record.activity.id);
    }
    setEditing(undefined);
  }

  function deleteRecord(record: ActivityRecord) {
    const confirmed = window.confirm(
      `¿Querés eliminar “${record.activity.title}”? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;
    replace(records.filter((item) => item.activity.id !== record.activity.id));
    if (newestId === record.activity.id) setNewestId(undefined);
  }

  function duplicateRecord(record: ActivityRecord) {
    const now = new Date().toISOString();
    const duplicate: ActivityRecord = {
      ...structuredClone(record),
      activity: {
        ...structuredClone(record.activity),
        id: `actividad-${Date.now()}`,
        title: `${record.activity.title} (copia)`,
        status: "draft",
        statusHistory: [{ to: "draft", changedAt: now, reason: "Actividad duplicada" }],
        audit: { createdAt: now, updatedAt: now, version: 1 },
      },
    };
    replace([duplicate, ...records]);
    setNewestId(duplicate.activity.id);
  }

  function completeRecordStatus(record: ActivityRecord) {
    if (record.activity.status === "completed") return;
    const now = new Date().toISOString();
    const updated: ActivityRecord = {
      ...record,
      activity: {
        ...record.activity,
        status: "completed",
        endTime: record.activity.endTime ?? new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()),
        statusHistory: [...record.activity.statusHistory, { from: record.activity.status, to: "completed", changedAt: now, reason: "Actividad finalizada desde el Diario" }],
        audit: { ...record.activity.audit, updatedAt: now, version: record.activity.audit.version + 1 },
      },
    };
    replace(records.map((item) => item.activity.id === updated.activity.id ? updated : item));
    setNewestId(updated.activity.id);
  }

  function exportRecord(record: ActivityRecord) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(record, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `atiy-${record.activity.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const linkedCount = records.reduce(
    (total, record) =>
      total + record.problems.length + record.opportunities.length + record.commitments.length,
    0,
  );

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <header className="border-b border-[var(--border)] pb-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Registro operativo permanente</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">Mi Diario</h1>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                Encontrá, revisá y administrá todas las actividades sin iniciar una nueva recorrida.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setEditing(undefined); setWizardOpen(true); }}
              className="premium-button inline-flex h-12 items-center justify-center gap-2 px-5 text-sm font-extrabold"
            >
              <span className="text-lg">+</span> Nueva actividad
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-[var(--muted)]">
            <span><strong className="mr-1 text-[var(--foreground)]">{territorialEntities.length}</strong> entidades territoriales disponibles</span>
            <span><strong className="mr-1 text-[var(--foreground)]">{records.length}</strong> actividades</span>
            <span><strong className="mr-1 text-[var(--foreground)]">{linkedCount}</strong> hallazgos conectados</span>
            <span><strong className="mr-1 text-[var(--foreground)]">{records.filter((record) => record.activity.attachments.length > 0).length}</strong> con evidencia</span>
          </div>
        </header>

        <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_repeat(5,minmax(0,1fr))]">
            <label className="md:col-span-2 xl:col-span-1">
              <span className="sr-only">Buscar actividades</span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por título, texto o participante" className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]" />
            </label>
            <FilterSelect label="Barrio" value={area} onChange={setArea} options={areaOptions} />
            <FilterSelect label="Institución" value={institution} onChange={setInstitution} options={institutionOptions} />
            <FilterSelect label="Tipo" value={type} onChange={setType} options={[...new Set(records.map((record) => record.activity.type))]} />
            <FilterSelect label="Estado" value={status} onChange={setStatus} options={[...new Set(records.map((record) => record.activity.status))]} />
            <label>
              <span className="sr-only">Orden</span>
              <select value={order} onChange={(event) => setOrder(event.target.value as "desc" | "asc")} className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold">
                <option value="desc">Más recientes</option>
                <option value="asc">Más antiguas</option>
              </select>
            </label>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">Cronología</p>
              <h2 className="mt-1 text-xl font-extrabold">{visibleRecords.length} resultados</h2>
            </div>
            <p className="hidden text-xs text-[var(--muted)] sm:block">Abrí una actividad para consultar su contexto</p>
          </div>
          {visibleRecords.length ? (
            <ActivityTimeline
              records={visibleRecords}
              newestId={newestId ?? visibleRequestedActivityId}
              onEdit={(record) => { setEditing(record); setWizardOpen(true); }}
              onDelete={deleteRecord}
              onDuplicate={duplicateRecord}
              onComplete={completeRecordStatus}
              onExport={exportRecord}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center">
              <p className="text-base font-extrabold">{records.length ? "No encontramos actividades con estos filtros" : "Todavía no registraste actividades"}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{records.length ? "Probá con otros filtros." : "Creá una actividad o finalizá una recorrida para comenzar tu historial operativo."}</p>
              {!records.length && <button type="button" onClick={() => { setEditing(undefined); setWizardOpen(true); }} className="premium-button mt-5 px-5 py-3 text-xs font-black">Crear primera actividad</button>}
            </div>
          )}
        </section>
      </div>

      {wizardOpen && (
        <ActivityWizard
          key={editing?.activity.id ?? "new-activity"}
          open
          initialRecord={editing}
          onClose={() => { setWizardOpen(false); setEditing(undefined); }}
          onComplete={(record) => { completeRecord(record); setWizardOpen(false); }}
        />
      )}
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold">
        <option value="all">{label}: todos</option>
        {options.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}
      </select>
    </label>
  );
}
