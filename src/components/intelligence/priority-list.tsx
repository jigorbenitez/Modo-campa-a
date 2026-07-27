import Link from "next/link";
import type { IntelligencePriority } from "@/features/inteligencia";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const levelStyles = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  normal: "bg-slate-400",
};

export function PriorityList({ priorities }: { priorities: IntelligencePriority[] }) {
  return (
    <Card className="shadow-none">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">En foco</p>
      <h2 className="mt-2 text-xl font-extrabold tracking-tight">Prioridades</h2>
      <div className="mt-5 divide-y divide-[var(--border)]">
        {priorities.map((priority) => (
          <Link key={priority.id} href={priority.href} className="group flex items-start gap-3 py-4 first:pt-0 last:pb-0">
            <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", levelStyles[priority.level])} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-extrabold transition group-hover:text-[var(--accent)]">
                {priority.title}
              </span>
              <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{priority.context}</span>
            </span>
            <span className="text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]">→</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
