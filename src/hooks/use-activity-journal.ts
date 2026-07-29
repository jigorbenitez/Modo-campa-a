"use client";

import { useEffect, useState } from "react";
import type { ActivityRecord } from "@/features/diario";
import {
  ACTIVITY_JOURNAL_EVENT,
  hasStoredActivityJournal,
  readActivityJournal,
  writeActivityJournal,
} from "@/features/diario/infrastructure/activity-journal-store";

export function useActivityJournal(fallback: ActivityRecord[] = []) {
  const [records, setRecords] = useState<ActivityRecord[]>(fallback);
  const [hasStoredJournal, setHasStoredJournal] = useState(false);

  useEffect(() => {
    const update = () => {
      setRecords(readActivityJournal(fallback));
      setHasStoredJournal(hasStoredActivityJournal());
    };
    queueMicrotask(update);
    window.addEventListener("storage", update);
    window.addEventListener(ACTIVITY_JOURNAL_EVENT, update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener(ACTIVITY_JOURNAL_EVENT, update);
    };
  }, [fallback]);

  function replace(next: ActivityRecord[]) {
    setRecords(next);
    setHasStoredJournal(true);
    writeActivityJournal(next);
  }

  return { records, replace, hasStoredJournal };
}
