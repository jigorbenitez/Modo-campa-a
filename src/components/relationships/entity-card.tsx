import type { KnowledgeNode } from "@/features/relaciones";

const typeLabels = {
  municipality: "Municipio",
  neighborhood: "Barrio",
  activity: "Actividad",
  institution: "Institución",
  person: "Persona",
  document: "Documento",
  problem: "Problema",
  opportunity: "Oportunidad",
  commitment: "Compromiso",
  proposal: "Propuesta",
  publication: "Publicación",
  team: "Equipo",
};

export function EntityCard({
  node,
  selected,
  connections,
  onSelect,
}: {
  node: KnowledgeNode;
  selected: boolean;
  connections: number;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(node.id)}
      aria-pressed={selected}
      className={`w-full rounded-xl border p-3 text-left transition ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-transparent hover:border-[var(--border)] hover:bg-[var(--surface-muted)]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate text-sm font-extrabold">{node.title}</span>
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
            {typeLabels[node.type]}
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-[var(--surface)] px-2 py-1 text-[10px] font-extrabold text-[var(--muted)]">
          {connections}
        </span>
      </div>
    </button>
  );
}
