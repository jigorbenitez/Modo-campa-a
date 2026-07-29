import type { TerritoryNeighborhood } from "@/features/territorio-map";

const statusLabels = {
  stable: "Estable",
  attention: "Requiere atención",
  priority: "Prioridad territorial",
};

export function TerritoryOverview({
  neighborhoods,
  onSelect,
}: {
  neighborhoods: TerritoryNeighborhood[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="p-5">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">Municipio vivo</p>
      <h2 className="mt-2 text-xl font-extrabold">Seleccioná un barrio o marcador</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        El panel reunirá actividad, problemas, compromisos y evidencia del punto elegido.
      </p>
      <div className="mt-5 space-y-2">
        {neighborhoods.map((neighborhood) => (
          <button
            key={neighborhood.id}
            type="button"
            onClick={() => onSelect(neighborhood.id)}
            className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/60 p-3.5 text-left transition hover:border-[var(--accent)]"
          >
            <span>
              <span className="block text-sm font-extrabold">{neighborhood.name}</span>
              <span className="mt-1 block text-xs text-[var(--muted)]">
                {neighborhood.level === "locality" ? "Localidad" : "Barrio"} · límite verificado
              </span>
            </span>
            <span className="rounded-full bg-[var(--surface)] px-2 py-1 text-[10px] font-bold text-[var(--muted)]">
              {statusLabels[neighborhood.generalStatus]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
