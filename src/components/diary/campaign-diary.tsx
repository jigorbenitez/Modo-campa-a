"use client";

import { useState } from "react";
import type { ActivityRecord } from "@/features/diario";
import { mockActivityRecords } from "@/mock";
import { ActivityTimeline } from "./activity-timeline";
import { ActivityWizard } from "./activity-wizard";

export function CampaignDiary() {
  const [records, setRecords] = useState<ActivityRecord[]>(mockActivityRecords);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [newestId, setNewestId] = useState<string>();

  function addRecord(record: ActivityRecord) {
    setRecords((current) => [record, ...current]);
    setNewestId(record.activity.id);
  }

  const linkedCount = records.reduce(
    (total, record) =>
      total +
      record.problems.length +
      record.opportunities.length +
      record.commitments.length,
    0,
  );

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <header className="border-b border-[var(--border)] pb-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Registro operativo</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">Diario de Campaña</h1>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                Cada actividad conserva lo ocurrido, quiénes participaron y qué problemas, oportunidades o compromisos surgieron.
              </p>
            </div>
            <button type="button" onClick={() => setWizardOpen(true)} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-extrabold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[var(--accent-strong)]">
              <span className="text-lg">+</span> Nueva actividad
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-[var(--muted)]">
            <span><strong className="mr-1 text-[var(--foreground)]">{records.length}</strong> actividades registradas</span>
            <span><strong className="mr-1 text-[var(--foreground)]">{linkedCount}</strong> hallazgos conectados</span>
            <span><strong className="mr-1 text-[var(--foreground)]">{records.filter((record) => record.activity.attachments.length > 0).length}</strong> con evidencia adjunta</span>
          </div>
        </header>

        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">Cronología</p>
              <h2 className="mt-1 text-xl font-extrabold">Actividad reciente</h2>
            </div>
            <p className="hidden text-xs text-[var(--muted)] sm:block">Abrí una actividad para ver todo su contexto</p>
          </div>
          <ActivityTimeline records={records} newestId={newestId} />
        </section>
      </div>

      <ActivityWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onComplete={addRecord} />
    </>
  );
}
