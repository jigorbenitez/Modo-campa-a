export function MapToolbar({
  presentationMode,
  onTogglePresentation,
  onReset,
  onClearSelection,
  hasSelection,
}: {
  presentationMode: boolean;
  onTogglePresentation: () => void;
  onReset: () => void;
  onClearSelection: () => void;
  hasSelection: boolean;
}) {
  return (
    <div className="flex gap-2">
      <button type="button" onClick={onReset} className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 px-3 py-2 text-xs font-extrabold shadow-lg backdrop-blur">
        Volver al municipio
      </button>
      {hasSelection && <button type="button" onClick={onClearSelection} className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 px-3 py-2 text-xs font-extrabold shadow-lg backdrop-blur">Limpiar selección</button>}
      <button type="button" onClick={onTogglePresentation} aria-pressed={presentationMode} className={`rounded-xl px-3 py-2 text-xs font-extrabold shadow-lg backdrop-blur ${presentationMode ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] bg-[var(--surface)]/95"}`}>
        {presentationMode ? "Salir de presentación" : "Modo Presentación"}
      </button>
    </div>
  );
}
