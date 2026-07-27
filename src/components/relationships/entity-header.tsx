import type { EntityContext } from "@/features/relaciones";

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

export function EntityHeader({ context }: { context: EntityContext }) {
  const { entity } = context;
  return (
    <header className="border-b border-[var(--border)] p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[var(--accent-strong)]">
          {typeLabels[entity.type]}
        </span>
        {entity.status && (
          <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-bold uppercase text-[var(--muted)]">
            {entity.status.replaceAll("_", " ")}
          </span>
        )}
      </div>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">{entity.title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{entity.summary}</p>
      <div className="mt-5 flex flex-wrap gap-4 text-xs font-bold text-[var(--muted)]">
        <span><strong className="text-[var(--foreground)]">{context.connectionCount}</strong> conexiones</span>
        <span><strong className="text-[var(--foreground)]">{context.groups.length}</strong> tipos de contexto</span>
        <span><strong className="text-[var(--foreground)]">{context.timeline.length}</strong> eventos en memoria</span>
      </div>
    </header>
  );
}
