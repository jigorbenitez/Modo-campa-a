import type { IntelligenceActivity } from "@/features/inteligencia";

const labels: Record<IntelligenceActivity["type"], string> = {
  tour: "Recorrida",
  document: "Documento",
  proposal: "Propuesta",
  meeting: "Reunión",
};

export function ActivityCard({ activity }: { activity: IntelligenceActivity }) {
  const date = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(activity.occurredAt));

  return (
    <article className="relative grid grid-cols-[4.25rem_1fr] gap-3 pb-5 last:pb-0">
      <time className="pt-0.5 text-xs font-bold uppercase text-[var(--muted)]">{date}</time>
      <div className="relative border-l border-[var(--border)] pl-5">
        <span className="absolute -left-1 top-1 size-2 rounded-full bg-[var(--accent)] ring-4 ring-[var(--surface)]" />
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--accent)]">
          {labels[activity.type]}
        </p>
        <h3 className="mt-1 text-sm font-extrabold">{activity.title}</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">{activity.description}</p>
      </div>
    </article>
  );
}
