"use client";

import type { FilterDefinition, FilterState } from "@/application/shared/filters";

export function ReusableFilterBar({
  definitions,
  value,
  onChange,
  onClear,
}: {
  definitions: FilterDefinition[];
  value: FilterState;
  onChange: (id: string, value: string | undefined) => void;
  onClear: () => void;
}) {
  const hasFilters = Object.values(value).some((item) => item && (!Array.isArray(item) || item.length > 0));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      {definitions.map((definition) => (
        <label key={definition.id} className="min-w-0 flex-1 sm:min-w-44">
          <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">
            {definition.label}
          </span>
          <select
            value={typeof value[definition.id] === "string" ? value[definition.id] : ""}
            onChange={(event) => onChange(definition.id, event.target.value || undefined)}
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-bold outline-none focus:border-[var(--brand-accent)]"
          >
            <option value="">{definition.placeholder ?? "Todos"}</option>
            {definition.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}{option.count === undefined ? "" : ` (${option.count})`}
              </option>
            ))}
          </select>
        </label>
      ))}
      {hasFilters && (
        <button type="button" onClick={onClear} className="h-11 px-3 text-xs font-extrabold text-[var(--accent)]">
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
