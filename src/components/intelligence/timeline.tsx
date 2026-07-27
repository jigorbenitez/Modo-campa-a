import type { IntelligenceActivity } from "@/features/inteligencia";
import { ActivityCard } from "./activity-card";

export function Timeline({ activities }: { activities: IntelligenceActivity[] }) {
  return (
    <div className="mt-6">
      {activities.map((activity) => <ActivityCard key={`${activity.type}-${activity.id}`} activity={activity} />)}
    </div>
  );
}
