import type { TerritoryPeriod } from "@/features/territorio-map";

export function TimelineSlider({
  periods,
  value,
  onChange,
}: {
  periods: TerritoryPeriod[];
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">Modo historia</p>
        <p className="text-xs font-extrabold text-[var(--accent)]">{periods[value]?.label}</p>
      </div>
      <input
        type="range"
        min={0}
        max={periods.length - 1}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-[var(--accent)]"
        aria-label="Período visible del territorio"
      />
      <div className="mt-1 flex justify-between gap-1">
        {periods.map((period, index) => (
          <button
            key={period.id}
            type="button"
            onClick={() => onChange(index)}
            className={`text-[9px] font-bold ${index === value ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
}
