"use client";

import { useEffect, useRef, useState } from "react";
import type { CaptureKind } from "@/features/recorrido";

const labels: Record<CaptureKind, string> = {
  photo: "Fotografía",
  video: "Video",
  voice: "Nota de voz",
  observation: "Observación rápida",
  problem: "Problema detectado",
  opportunity: "Oportunidad",
  commitment: "Compromiso",
  institution: "Institución",
  person: "Persona",
  location: "Ubicación",
  document: "Documento",
};

export function QuickCaptureSheet({
  kind,
  onClose,
  onSave,
}: {
  kind?: CaptureKind;
  onClose: () => void;
  onSave: (label: string) => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!kind) return;
    const timer = window.setTimeout(() => {
      setValue("");
      inputRef.current?.focus();
    }, 100);
    return () => window.clearTimeout(timer);
  }, [kind]);

  if (!kind) return null;
  const isVoice = kind === "voice";

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-black/35 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={labels[kind]}>
      <div className="mx-auto w-full max-w-xl rounded-[1.75rem] bg-[var(--surface)] p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">Agregar al recorrido</p>
            <h2 className="mt-1 text-xl font-extrabold">{labels[kind]}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full bg-[var(--surface-muted)] text-lg" aria-label="Cerrar">×</button>
        </div>

        {isVoice ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[var(--border)] p-6 text-center">
            <span className="text-3xl">🎤</span>
            <p className="mt-3 text-sm font-extrabold">Grabación preparada</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">El flujo reserva este punto para integrar captura y almacenamiento de audio de forma segura.</p>
          </div>
        ) : (
          <label className="mt-5 block">
            <span className="sr-only">{labels[kind]}</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={kind === "person" ? "Nombre y referencia" : `Describí ${labels[kind].toLowerCase()}`}
              className="h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 text-base outline-none focus:border-[var(--accent)]"
            />
          </label>
        )}

        <button
          type="button"
          disabled={!isVoice && !value.trim()}
          onClick={() => onSave(isVoice ? "Nota de voz pendiente de grabación" : value.trim())}
          className="premium-button mt-4 h-13 w-full px-5 text-sm font-extrabold disabled:opacity-40"
        >
          Agregar ahora
        </button>
      </div>
    </div>
  );
}
