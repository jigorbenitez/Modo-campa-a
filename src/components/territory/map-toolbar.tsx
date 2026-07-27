export function MapToolbar({
  presentationMode,
  onTogglePresentation,
  onReset,
}: {
  presentationMode: boolean;
  onTogglePresentation: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex gap-2">
      <button type="button" onClick={onReset} className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 px-3 py-2 text-xs font-extrabold shadow-lg backdrop-blur">
        Ver municipio
      </button>
      <button type="button" onClick={onTogglePresentation} aria-pressed={presentationMode} className={`rounded-xl px-3 py-2 text-xs font-extrabold shadow-lg backdrop-blur ${presentationMode ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] bg-[var(--surface)]/95"}`}>
        {presentationMode ? "Salir de presentación" : "Modo Presentación"}
      </button>
    </div>
  );
}
