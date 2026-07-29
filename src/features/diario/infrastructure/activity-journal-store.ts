import type { ActivityRecord } from "../domain/activity-record";

export const ACTIVITY_JOURNAL_STORAGE_KEY = "atiy:activity-journal:v1";
export const ACTIVITY_JOURNAL_EVENT = "atiy:activity-journal-changed";

export function hasStoredActivityJournal() {
  return (
    typeof window !== "undefined" &&
    localStorage.getItem(ACTIVITY_JOURNAL_STORAGE_KEY) !== null
  );
}

export function readActivityJournal(fallback: ActivityRecord[] = []): ActivityRecord[] {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(ACTIVITY_JOURNAL_STORAGE_KEY);
  if (!stored) return fallback;
  try {
    const records = JSON.parse(stored) as ActivityRecord[];
    return Array.isArray(records) ? records : fallback;
  } catch {
    return fallback;
  }
}

export function writeActivityJournal(records: ActivityRecord[]) {
  localStorage.setItem(ACTIVITY_JOURNAL_STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent(ACTIVITY_JOURNAL_EVENT));
}
