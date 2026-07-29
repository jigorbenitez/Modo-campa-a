import { createActivity } from "@/features/diario/application/create-mock-activity";
import type { ActivityRecord } from "@/features/diario";
import type { SavedTourActivity } from "./beta-activity-store";

export function tourToActivityRecord(tour: SavedTourActivity): ActivityRecord {
  const started = new Date(tour.startedAt);
  const finished = new Date(tour.finishedAt);
  const result = createActivity({
    type: "walk",
    title: tour.title,
    description: tour.summary,
    date: tour.startedAt.slice(0, 10),
    startTime: started.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }),
    endTime: finished.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }),
    priority: "medium",
    barrioIds: [tour.neighborhoodId],
    circuitIds: [tour.circuitId],
    location: `${tour.coordinates.latitude.toFixed(6)}, ${tour.coordinates.longitude.toFixed(6)}`,
    observations: tour.captures.filter((capture) => capture.kind === "observation").map((capture) => capture.label),
    participants: tour.person ? [tour.person] : [],
    problems: tour.captures.filter((capture) => capture.kind === "problem").map((capture) => capture.label),
    opportunities: tour.captures.filter((capture) => capture.kind === "opportunity").map((capture) => capture.label),
    commitments: tour.captures.filter((capture) => capture.kind === "commitment").map((capture) => capture.label),
    attachments: [],
    tags: ["recorrida", "captura-móvil"],
  }, [tour.neighborhoodName]);
  return {
    ...result.record,
    organizerName: tour.institution,
    activity: {
      ...result.record.activity,
      id: tour.id,
      tourIds: [tour.id],
      attachments: tour.captures
        .filter((capture) => ["photo", "video", "voice", "document"].includes(capture.kind))
        .map((capture) => ({
          id: capture.id,
          type: capture.kind === "photo" ? "image" : capture.kind === "video" ? "video" : capture.kind === "voice" ? "audio" : "file",
          url: capture.audioDataUrl ?? "",
          title: capture.label,
          capturedAt: capture.createdAt,
          tags: ["recorrida"],
        })),
    },
  };
}
