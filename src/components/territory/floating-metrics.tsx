import type { TerritoryStatsView } from "@/features/territorio-map";
import { TerritoryStats } from "./territory-stats";

export function FloatingMetrics({ stats }: { stats: TerritoryStatsView }) {
  return <TerritoryStats stats={stats} />;
}
