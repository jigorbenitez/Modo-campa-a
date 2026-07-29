"use client";

import { useEffect, useRef, useState } from "react";

export interface VoiceRecording {
  dataUrl: string;
  mimeType: string;
  durationMs: number;
}

export function VoiceRecorder({ onChange }: { onChange: (recording?: VoiceRecording) => void }) {
  const [recording, setRecording] = useState(false);
  const [preview, setPreview] = useState<VoiceRecording>();
  const [error, setError] = useState("");
  const recorderRef = useRef<MediaRecorder | undefined>(undefined);
  const streamRef = useRef<MediaStream | undefined>(undefined);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);

  useEffect(() => () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  async function start() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("La grabación de audio no está disponible en este dispositivo.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => {
          const next = { dataUrl: String(reader.result), mimeType: blob.type, durationMs: Date.now() - startedAtRef.current };
          setPreview(next);
          onChange(next);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      setRecording(true);
    } catch {
      setError("No se pudo acceder al micrófono. Revisá el permiso del navegador.");
    }
  }

  function stop() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  function remove() {
    setPreview(undefined);
    onChange(undefined);
  }

  return (
    <div className="mt-5 rounded-2xl border border-[var(--border)] p-4">
      {!preview ? (
        <button type="button" onClick={recording ? stop : start} className={`h-14 w-full rounded-xl text-sm font-black ${recording ? "bg-rose-600 text-white" : "bg-[var(--primary)] text-white"}`}>
          {recording ? "Detener grabación" : "Grabar nota de voz"}
        </button>
      ) : (
        <div>
          <audio controls src={preview.dataUrl} className="w-full" aria-label="Vista previa de la nota de voz" />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-[var(--muted)]">{Math.max(1, Math.round(preview.durationMs / 1000))} segundos</span>
            <button type="button" onClick={remove} className="rounded-lg px-3 py-2 text-xs font-bold text-rose-600">Eliminar audio</button>
          </div>
        </div>
      )}
      {recording && <p className="mt-3 animate-pulse text-center text-xs font-bold text-rose-600">Grabando… tocá para finalizar</p>}
      {error && <p role="alert" className="mt-3 text-xs font-bold text-rose-600">{error}</p>}
    </div>
  );
}
