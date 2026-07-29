export const BETA_ACTIVITY_STORAGE_KEY = "modo-campana:beta-activities";
export const BETA_ACTIVITY_EVENT = "modo-campana:activity-saved";

export type CaptureKind =
  | "photo"
  | "video"
  | "voice"
  | "observation"
  | "problem"
  | "opportunity"
  | "commitment"
  | "institution"
  | "person"
  | "location"
  | "document";

export interface TourCapture {
  id: string;
  kind: CaptureKind;
  label: string;
  createdAt: string;
  audioDataUrl?: string;
  mimeType?: string;
  durationMs?: number;
}

export interface SavedTourActivity {
  id: string;
  municipalityId: string;
  neighborhoodId: string;
  neighborhoodName: string;
  localityName: string;
  circuitId: string;
  coordinates: { latitude: number; longitude: number; accuracy: number };
  institution?: string;
  person?: string;
  title: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  captures: TourCapture[];
  summary: string;
  syncStatus: "pending" | "synced";
}

export function readSavedTourActivities(): SavedTourActivity[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(BETA_ACTIVITY_STORAGE_KEY) ?? "[]") as SavedTourActivity[];
  } catch {
    return [];
  }
}

export function saveTourActivity(activity: SavedTourActivity) {
  const current = readSavedTourActivities();
  localStorage.setItem(BETA_ACTIVITY_STORAGE_KEY, JSON.stringify([activity, ...current].slice(0, 20)));
  const journalRecord = tourToActivityRecord(activity);
  const journal = readActivityJournal([]);
  writeActivityJournal([journalRecord, ...journal.filter((record) => record.activity.id !== activity.id)]);
  window.dispatchEvent(new CustomEvent(BETA_ACTIVITY_EVENT, { detail: activity }));
}
import { readActivityJournal, writeActivityJournal } from "@/features/diario/infrastructure/activity-journal-store";
import { tourToActivityRecord } from "./tour-journal-adapter";
