import type { ActivityRecord } from "@/features/diario";
import { ActivityCard } from "./activity-card";

export function ActivityTimeline({
  records,
  newestId,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  records: ActivityRecord[];
  newestId?: string;
  onEdit?: (record: ActivityRecord) => void;
  onDelete?: (record: ActivityRecord) => void;
  onDuplicate?: (record: ActivityRecord) => void;
}) {
  return (
    <div className="relative space-y-4 before:absolute before:bottom-4 before:left-[1.95rem] before:top-4 before:hidden before:w-px before:bg-[var(--border)] sm:before:block">
      {records.map((record) => (
        <div key={record.activity.id} className="relative sm:pl-20">
          <span className="absolute left-[1.7rem] top-7 z-10 hidden size-2 rounded-full bg-[var(--accent)] ring-4 ring-[var(--background)] sm:block" />
          <ActivityCard record={record} defaultOpen={record.activity.id === newestId} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
        </div>
      ))}
    </div>
  );
}
