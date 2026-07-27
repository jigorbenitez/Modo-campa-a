import type { KnowledgeEdge } from "@/features/relaciones";

export function ConnectionBadge({ edge }: { edge: KnowledgeEdge }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-bold text-[var(--muted)]"
      title={edge.evidence.join(" · ")}
    >
      <span className={`size-1.5 rounded-full ${edge.origin === "explicit" ? "bg-[var(--accent)]" : "bg-sky-500"}`} />
      {edge.label}
    </span>
  );
}
