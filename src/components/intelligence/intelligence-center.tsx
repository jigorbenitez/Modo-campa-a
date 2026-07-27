import { InsightService } from "@/features/inteligencia";
import { mockIntelligenceSnapshot } from "@/mock";
import { InsightCard } from "./insight-card";
import { WarningCard } from "./warning-card";
import { StrategicAreaCard } from "./strategic-area-card";
import { RecentActivity } from "./recent-activity";
import { PriorityList } from "./priority-list";
import { QuickActions } from "./quick-actions";

export function IntelligenceCenter() {
  const viewModel = new InsightService().generate(mockIntelligenceSnapshot);
  const featuredInsight =
    viewModel.insights.find((insight) => insight.severity === "critical") ??
    viewModel.insights.find((insight) => insight.severity === "warning") ??
    viewModel.insights[0];
  const alerts = viewModel.insights.filter(
    (insight) => insight.id !== featuredInsight?.id && ["critical", "warning"].includes(insight.severity),
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header className="border-b border-[var(--border)] pb-8">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">
              <span className="size-2 rounded-full bg-emerald-500" />
              Centro de Inteligencia
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              Contexto para decidir mejor.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              La información territorial, operativa y documental se conecta en una lectura clara de lo que requiere atención.
            </p>
          </div>
          <QuickActions />
        </div>
      </header>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl bg-[var(--sidebar)] p-6 text-white sm:p-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-300">Lectura general</p>
          <p className="mt-4 max-w-3xl text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">
            {viewModel.headline}
          </p>
          <p className="mt-5 text-xs text-[var(--sidebar-muted)]">
            Generado mediante reglas sobre los datos disponibles · Sin IA
          </p>
        </div>
        {featuredInsight && <InsightCard insight={featuredInsight} featured />}
      </section>

      <section className="mt-10">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">Panorama operativo</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight">La información que importa</h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {viewModel.areas.map((area) => <StrategicAreaCard key={area.category} area={area} />)}
        </div>
      </section>

      {alerts.length > 0 && (
        <section className="mt-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">Alertas operativas</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Situaciones a resolver</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {alerts.map((insight) => <WarningCard key={insight.id} insight={insight} />)}
          </div>
        </section>
      )}

      <section className="mt-10 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <RecentActivity activities={viewModel.recentActivity} />
        <PriorityList priorities={viewModel.priorities} />
      </section>
    </div>
  );
}
