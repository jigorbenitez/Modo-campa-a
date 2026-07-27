import type { Insight } from "@/features/inteligencia";
import { InsightCard } from "./insight-card";

export function WarningCard({ insight }: { insight: Insight }) {
  return <InsightCard insight={insight} />;
}
