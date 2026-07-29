import type { ActivityRecord } from "@/features/diario";
import type {
  TerritoryFeature,
  TerritoryNeighborhood,
} from "../domain/territory";

const currentAreaByLegacyId: Record<string, string> = {
  "barrio-san-fernando-centro": "localidad-san-fernando",
  "barrio-victoria": "localidad-victoria",
  "barrio-virreyes": "localidad-virreyes",
};

export function activityRecordToTerritoryFeature(
  record: ActivityRecord,
  areas: TerritoryNeighborhood[],
): TerritoryFeature | undefined {
  const requestedId = record.activity.barrioIds[0];
  const areaId = currentAreaByLegacyId[requestedId] ?? requestedId;
  const area = areas.find((item) => item.id === areaId);
  if (!area) return undefined;

  return {
    id: `journal-${record.activity.id}`,
    municipioId: record.activity.municipioId,
    layerId: "activities",
    kind: "activity",
    subtype: record.activity.type,
    title: record.activity.title,
    description: record.activity.description,
    point: area.center,
    barrioId: area.id,
    circuitId: record.activity.circuitIds?.[0],
    localidad: area.locality,
    occurredAt: `${record.activity.date}T${record.activity.startTime}:00.000-03:00`,
    status: record.activity.status,
    updatedAt: record.activity.audit.updatedAt,
    source: "Mi Diario",
    priority: record.activity.priority,
    participants: record.participantNames,
    problems: record.problems.map(({ id, title, status }) => ({ id, title, status })),
    commitments: record.commitments.map(({ id, title, status }) => ({ id, title, status })),
    proposals: record.proposals,
    documents: record.documents,
    publications: record.publications,
    photos: record.activity.attachments
      .filter((item) => item.type === "image")
      .map((item) => item.title),
    videos: record.activity.attachments
      .filter((item) => item.type === "video")
      .map((item) => item.title),
    history: record.activity.statusHistory.map((item) => ({
      at: item.changedAt,
      label: `Estado: ${item.to.replaceAll("_", " ")}`,
    })),
  };
}
