import { Card } from "@/components/ui/card";

export function MetricCard({ label, value, note, accent }: { label: string; value: string; note: string; accent?: boolean }) {
  return (
    <Card className={accent ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white" : undefined}>
      <p className={`text-xs font-bold uppercase tracking-wider ${accent ? "text-[var(--brand-accent)]" : "text-[var(--muted)]"}`}>{label}</p>
      <p className="mt-4 text-3xl font-extrabold tracking-tight">{value}</p>
      <p className={`mt-2 text-sm ${accent ? "text-[var(--sidebar-muted)]" : "text-[var(--muted)]"}`}>{note}</p>
    </Card>
  );
}
