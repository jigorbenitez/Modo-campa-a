"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

const feedbackTypes = [
  ["error", "Reportar error"],
  ["suggestion", "Enviar sugerencia"],
  ["missing_institution", "Informar institución faltante"],
  ["incorrect_data", "Informar dato incorrecto"],
] as const;

type FeedbackType = (typeof feedbackTypes)[number][0];

interface FeedbackReport {
  type: FeedbackType;
  description: string;
  page: string;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
  atiyVersion: string;
  delivery: "local_draft";
}

const atiyVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";

export function FeedbackPanel({ user }: { user?: { id: string; name: string; email: string } }) {
  const pathname = usePathname();
  const [type, setType] = useState<FeedbackType>("error");
  const [description, setDescription] = useState("");
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");

  function report(): FeedbackReport {
    return {
      type,
      description: description.trim(),
      page: pathname,
      createdAt: new Date().toISOString(),
      user: user ?? null,
      atiyVersion,
      delivery: "local_draft",
    };
  }

  function validate() {
    if (description.trim().length < 10) {
      setMessage("Describí el caso con al menos 10 caracteres.");
      return false;
    }
    return true;
  }

  function asDraft(value: FeedbackReport) {
    const label = feedbackTypes.find(([id]) => id === value.type)?.[1] ?? value.type;
    return `[ATIY ${value.atiyVersion}] ${label}\nPágina: ${value.page}\nFecha: ${value.createdAt}\nUsuario: ${value.user ? `${value.user.name} <${value.user.email}>` : "No disponible"}\n\n${value.description}`;
  }

  async function copyReport() {
    if (!validate()) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(report(), null, 2));
      setMessage("Reporte copiado al portapapeles.");
    } catch {
      setDraft(asDraft(report()));
      setMessage("El navegador bloqueó el portapapeles. Generamos un borrador para copiar manualmente.");
    }
  }

  function downloadReport() {
    if (!validate()) return;
    const value = report();
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `atiy-${value.type}-${value.createdAt.slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Reporte descargado como JSON.");
  }

  function generateDraft() {
    if (!validate()) return;
    setDraft(asDraft(report()));
    setMessage("Borrador generado. Podés revisarlo y copiarlo.");
  }

  return (
    <section className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6" aria-labelledby="feedback-title">
      <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">Soporte del producto</p>
        <h2 id="feedback-title" className="text-xl font-black">Ayuda y comentarios</h2>
        <p className="text-xs leading-5 text-[var(--muted)]">Generá un reporte trazable sin enviarlo a servicios externos. La persistencia remota se conectará detrás de esta misma interfaz.</p>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <label className="text-xs font-extrabold">Tipo
          <select value={type} onChange={(event) => setType(event.target.value as FeedbackType)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm font-semibold">
            {feedbackTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-xs font-extrabold">Descripción
          <textarea value={description} onInput={(event) => setDescription(event.currentTarget.value)} rows={5} placeholder="Explicá qué ocurrió, qué esperabas y cualquier detalle útil." className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm font-normal outline-none focus:border-[var(--accent)]" />
        </label>
      </div>
      <dl className="mt-4 grid gap-3 rounded-2xl bg-[var(--surface-muted)] p-4 text-xs sm:grid-cols-3">
        <div><dt className="font-extrabold text-[var(--muted)]">Página automática</dt><dd className="mt-1 break-all font-bold">{pathname}</dd></div>
        <div><dt className="font-extrabold text-[var(--muted)]">Usuario</dt><dd className="mt-1 font-bold">{user?.email ?? "No disponible"}</dd></div>
        <div><dt className="font-extrabold text-[var(--muted)]">Versión ATIY</dt><dd className="mt-1 font-bold">{atiyVersion}</dd></div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={copyReport} className="premium-button px-4 py-2.5 text-xs font-extrabold">Copiar reporte</button>
        <button type="button" onClick={downloadReport} className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-xs font-extrabold">Descargar JSON</button>
        <button type="button" onClick={generateDraft} className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-xs font-extrabold">Generar borrador</button>
      </div>
      {message && <p className="mt-3 text-xs font-bold text-[var(--accent-strong)]" aria-live="polite">{message}</p>}
      {draft && <label className="mt-4 block text-xs font-extrabold">Borrador para envío
        <textarea readOnly value={draft} rows={8} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 font-mono text-[11px] font-normal" />
      </label>}
    </section>
  );
}
