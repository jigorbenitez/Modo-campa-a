"use client";

import { useRef, useState } from "react";
import { territoryNeighborhoods } from "@/mock/territorio-map.mock";
import {
  saveTourActivity,
  type CaptureKind,
  type SavedTourActivity,
  type TourCapture,
} from "@/features/recorrido";
import { useDeviceBattery } from "@/hooks/use-device-battery";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useStopwatch } from "@/hooks/use-stopwatch";
import { CaptureDock } from "./capture-dock";
import { QuickCaptureSheet } from "./quick-capture-sheet";
import { TourSummary } from "./tour-summary";

type Stage = "setup" | "running" | "summary";

const captureLabels: Record<CaptureKind, string> = {
  photo: "Foto",
  video: "Video",
  voice: "Nota de voz",
  observation: "Observación",
  problem: "Problema",
  opportunity: "Oportunidad",
  commitment: "Compromiso",
  institution: "Institución",
  person: "Persona",
  location: "Ubicación",
};

export function TourMode() {
  const [stage, setStage] = useState<Stage>("setup");
  const [neighborhoodId, setNeighborhoodId] = useState(territoryNeighborhoods[0]?.id ?? "");
  const [startedAt, setStartedAt] = useState<number>();
  const [finishedAt, setFinishedAt] = useState<number>();
  const [captures, setCaptures] = useState<TourCapture[]>([]);
  const [activeCapture, setActiveCapture] = useState<CaptureKind>();
  const [savedActivity, setSavedActivity] = useState<SavedTourActivity>();
  const fileInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const online = useNetworkStatus();
  const battery = useDeviceBattery();
  const stopwatch = useStopwatch(startedAt, finishedAt);

  const neighborhood = territoryNeighborhoods.find((item) => item.id === neighborhoodId);

  function addCapture(kind: CaptureKind, label: string) {
    setCaptures((current) => [
      { id: crypto.randomUUID(), kind, label, createdAt: new Date().toISOString() },
      ...current,
    ]);
    setActiveCapture(undefined);
  }

  function handleAction(kind: CaptureKind) {
    if (kind === "photo") {
      fileInput.current?.click();
      return;
    }
    if (kind === "video") {
      videoInput.current?.click();
      return;
    }
    if (kind === "location") {
      if (!navigator.geolocation) {
        addCapture(kind, "Ubicación no disponible en este dispositivo");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => addCapture(kind, `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`),
        () => addCapture(kind, "Ubicación pendiente de autorización"),
        { enableHighAccuracy: true, timeout: 8000 },
      );
      return;
    }
    setActiveCapture(kind);
  }

  function beginTour() {
    const now = Date.now();
    setStartedAt(now);
    setFinishedAt(undefined);
    setCaptures([]);
    setStage("running");
  }

  function finishTour() {
    if (!startedAt || !neighborhood) return;
    const end = Date.now();
    setFinishedAt(end);
    const relevant = captures.filter((capture) => ["problem", "opportunity", "commitment"].includes(capture.kind));
    const activity: SavedTourActivity = {
      id: `recorrido-${end}`,
      municipalityId: "municipio-villa-del-encuentro",
      neighborhoodId: neighborhood.id,
      neighborhoodName: neighborhood.name,
      title: `Recorrida por ${neighborhood.name}`,
      startedAt: new Date(startedAt).toISOString(),
      finishedAt: new Date(end).toISOString(),
      durationMs: end - startedAt,
      captures,
      summary: relevant.length
        ? `Se registraron ${captures.length} aportes durante el recorrido, con ${relevant.length} hallazgos que requieren contexto o seguimiento.`
        : `Se registraron ${captures.length} aportes durante el recorrido territorial.`,
      syncStatus: online ? "synced" : "pending",
    };
    saveTourActivity(activity);
    setSavedActivity(activity);
    setStage("summary");
  }

  if (stage === "summary" && savedActivity) return <TourSummary activity={savedActivity} />;

  return (
    <div className={stage === "running" ? "min-h-[calc(100vh-4rem)] bg-[var(--background)] pb-44 text-[var(--foreground)]" : undefined}>
      {stage === "setup" ? (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
          <header className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Trabajo en territorio</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Modo Recorrida</h1>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">Registrá lo que ocurre mientras caminás. Cada aporte se conecta a una Actividad y queda listo para el resto de la plataforma.</p>
          </header>

          <section className="mt-8 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-7">
            <label className="block">
              <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Barrio del recorrido</span>
              <select value={neighborhoodId} onChange={(event) => setNeighborhoodId(event.target.value)} className="mt-3 h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 text-base font-bold">
                {territoryNeighborhoods.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Actividad automática", "Se crea al comenzar"],
                ["Uso sin conexión", "Guarda en el dispositivo"],
                ["Captura rápida", "Pensada para una mano"],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl bg-[var(--surface-muted)] p-4">
                  <p className="text-sm font-extrabold">{title}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{text}</p>
                </div>
              ))}
            </div>
            <button type="button" onClick={beginTour} className="premium-button mt-6 h-14 w-full text-base font-black active:scale-[0.99]">
              Iniciar recorrido
            </button>
          </section>
        </div>
      ) : (
        <>
          <header className="sticky top-18 z-30 border-b border-[var(--border)] bg-[var(--background)]/90 px-4 py-3 backdrop-blur-xl lg:top-0">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{neighborhood?.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/45 dark:text-white/45">Actividad en curso</p>
              </div>
              <div className="font-mono text-2xl font-black tabular-nums">{stopwatch.formatted}</div>
              <button type="button" onClick={finishTour} className="h-10 rounded-xl bg-[var(--danger)] px-4 text-xs font-black text-white">Finalizar</button>
            </div>
          </header>

          <main className="mx-auto max-w-5xl px-4 py-5">
            <div className="grid grid-cols-3 gap-2">
              <StatusItem label={online ? "Online" : "Offline"} value={online ? "Conectado" : "En cola"} tone={online ? "good" : "warning"} />
              <StatusItem label="Sincronización" value={online ? "Al día" : "Pendiente"} tone={online ? "good" : "warning"} />
              <StatusItem label="Batería" value={battery ? `${battery.level}%${battery.charging ? " ⚡" : ""}` : "No disponible"} />
            </div>

            <section className="mt-5 rounded-[1.75rem] bg-[var(--brand-primary)] p-5 text-white shadow-xl">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--brand-accent)]">Registro vivo</p>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-4xl font-black">{captures.length}</p>
                  <p className="mt-1 text-xs text-white/55">aportes incorporados</p>
                </div>
                <div className="flex -space-x-2">
                  {captures.slice(0, 4).map((capture) => <span key={capture.id} className="grid size-9 place-items-center rounded-full border-2 border-[var(--brand-primary)] bg-[var(--brand-accent)] text-sm font-black text-[var(--brand-primary)]">{captureLabels[capture.kind].slice(0, 1)}</span>)}
                </div>
              </div>
            </section>

            <section className="mt-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black">Últimos registros</h2>
                <span className="text-[10px] font-bold uppercase text-black/45 dark:text-white/45">Guardado inmediato</span>
              </div>
              <div className="mt-3 space-y-2">
                {captures.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-black/10 p-8 text-center text-sm text-black/45 dark:border-white/10 dark:text-white/45">Usá el panel inferior para registrar el primer aporte.</div>
                ) : captures.map((capture) => (
                  <article key={capture.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-white/5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-sm font-black text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300">{captureLabels[capture.kind].slice(0, 1)}</span>
                    <div className="min-w-0 flex-1"><p className="text-xs font-black">{captureLabels[capture.kind]}</p><p className="mt-1 truncate text-xs text-black/50 dark:text-white/50">{capture.label}</p></div>
                    <time className="text-[10px] font-bold text-black/35 dark:text-white/35">{new Date(capture.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</time>
                  </article>
                ))}
              </div>
            </section>
          </main>

          <input ref={fileInput} className="hidden" type="file" accept="image/*" capture="environment" onChange={(event) => { const file = event.target.files?.[0]; if (file) addCapture("photo", file.name || "Fotografía capturada"); event.currentTarget.value = ""; }} />
          <input ref={videoInput} className="hidden" type="file" accept="video/*" capture="environment" onChange={(event) => { const file = event.target.files?.[0]; if (file) addCapture("video", file.name || "Video capturado"); event.currentTarget.value = ""; }} />
          <CaptureDock onCapture={handleAction} />
          <QuickCaptureSheet kind={activeCapture} onClose={() => setActiveCapture(undefined)} onSave={(label) => activeCapture && addCapture(activeCapture, label)} />
        </>
      )}
    </div>
  );
}

function StatusItem({ label, value, tone }: { label: string; value: string; tone?: "good" | "warning" }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-white/5">
      <div className="flex items-center gap-1.5">
        <span className={`size-2 rounded-full ${tone === "warning" ? "bg-amber-500" : tone === "good" ? "bg-emerald-500" : "bg-slate-400"}`} />
        <p className="text-[9px] font-extrabold uppercase tracking-wide text-black/40 dark:text-white/40">{label}</p>
      </div>
      <p className="mt-1 truncate text-xs font-black">{value}</p>
    </div>
  );
}
