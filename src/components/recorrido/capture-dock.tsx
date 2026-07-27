"use client";

import type { CaptureKind } from "@/features/recorrido";

const actions: Array<{ kind: CaptureKind; icon: string; label: string }> = [
  { kind: "photo", icon: "📷", label: "Foto" },
  { kind: "video", icon: "🎥", label: "Video" },
  { kind: "observation", icon: "📝", label: "Nota" },
  { kind: "problem", icon: "⚠", label: "Problema" },
  { kind: "opportunity", icon: "💡", label: "Oportunidad" },
  { kind: "commitment", icon: "🤝", label: "Compromiso" },
  { kind: "institution", icon: "🏫", label: "Institución" },
  { kind: "person", icon: "👤", label: "Persona" },
  { kind: "location", icon: "📍", label: "Ubicación" },
  { kind: "voice", icon: "🎤", label: "Voz" },
];

export function CaptureDock({ onCapture }: { onCapture: (kind: CaptureKind) => void }) {
  return (
    <section aria-label="Acciones rápidas" className="fixed inset-x-3 bottom-3 z-50 rounded-[1.75rem] border border-white/10 bg-[#102119]/95 p-2 shadow-2xl backdrop-blur-xl lg:left-auto lg:right-6 lg:w-[38rem]">
      <div className="grid grid-cols-5 gap-1">
        {actions.map((action) => (
          <button
            key={action.kind}
            type="button"
            onClick={() => onCapture(action.kind)}
            className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-bold text-white/70 transition active:scale-95 active:bg-white/10"
          >
            <span className="text-xl" aria-hidden="true">{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
