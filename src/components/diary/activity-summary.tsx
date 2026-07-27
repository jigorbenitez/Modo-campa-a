import type { ActivityRecord } from "@/features/diario";

export function ActivitySummary({ record }: { record: ActivityRecord }) {
  const items = [
    ["Problemas", record.problems.length],
    ["Oportunidades", record.opportunities.length],
    ["Compromisos", record.commitments.length],
    ["Archivos", record.activity.attachments.length],
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl bg-[var(--surface-muted)] px-3 py-2.5">
          <p className="text-lg font-extrabold">{value}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">{label}</p>
        </div>
      ))}
    </div>
  );
}
