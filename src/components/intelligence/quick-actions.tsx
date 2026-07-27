import Link from "next/link";

const actions = [
  { label: "Planificar recorrida", href: "/agenda" },
  { label: "Revisar propuestas", href: "/propuestas" },
  { label: "Ver territorio", href: "/barrios" },
  { label: "Coordinar equipo", href: "/configuracion" },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Link key={action.href + action.label} href={action.href} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs font-extrabold transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
          {action.label} →
        </Link>
      ))}
    </div>
  );
}
