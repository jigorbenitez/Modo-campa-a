import { Card } from "@/components/ui/card";

export function MetricCard({ label, value, note, accent }: { label: string; value: string; note: string; accent?: boolean }) {
  return (
    <Card className={accent ? "bg-[var(--sidebar)] text-white" : undefined}>
      <p className={`text-xs font-bold uppercase tracking-wider ${accent ? "text-emerald-300" : "text-[var(--muted)]"}`}>{label}</p>
      <p className="mt-4 text-3xl font-extrabold tracking-tight">{value}</p>
      <p className={`mt-2 text-sm ${accent ? "text-[var(--sidebar-muted)]" : "text-[var(--muted)]"}`}>{note}</p>
    </Card>
  );
}
