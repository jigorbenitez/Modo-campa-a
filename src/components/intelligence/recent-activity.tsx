import type { IntelligenceActivity } from "@/features/inteligencia";
import { Card } from "@/components/ui/card";
import { Timeline } from "./timeline";

export function RecentActivity({ activities }: { activities: IntelligenceActivity[] }) {
  return (
    <Card className="shadow-none">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">Contexto reciente</p>
      <h2 className="mt-2 text-xl font-extrabold tracking-tight">Actividad conectada</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Recorridas, documentos, propuestas y reuniones ordenadas en una única secuencia.
      </p>
      <Timeline activities={activities} />
    </Card>
  );
}
