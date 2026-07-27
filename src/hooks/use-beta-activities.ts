"use client";

import { useEffect, useState } from "react";
import {
  BETA_ACTIVITY_EVENT,
  readSavedTourActivities,
  type SavedTourActivity,
} from "@/features/recorrido/beta-activity-store";

export function useBetaActivities() {
  const [activities, setActivities] = useState<SavedTourActivity[]>([]);

  useEffect(() => {
    const update = () => setActivities(readSavedTourActivities());
    update();
    window.addEventListener("storage", update);
    window.addEventListener(BETA_ACTIVITY_EVENT, update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener(BETA_ACTIVITY_EVENT, update);
    };
  }, []);

  return activities;
}
