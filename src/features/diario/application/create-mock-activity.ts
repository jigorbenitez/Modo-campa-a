import type {
  Actividad,
  Compromiso,
  Oportunidad,
  Problema,
} from "@/domain/entities";
import type { MediaAsset } from "@/domain/shared/types";
import type { ActivityCreationResult, ActivityDraft, ActivityRecord } from "../domain/activity-record";

const municipioId = "municipio-san-fernando";

function createId(prefix: string, index = 0) {
  return `${prefix}-${Date.now()}-${index}`;
}

export function createMockActivity(
  draft: ActivityDraft,
  barrioNames: string[],
): ActivityCreationResult {
  const now = new Date().toISOString();
  const activityId = createId("actividad");
  const audit = { createdAt: now, updatedAt: now, version: 1 };

  const problems: Problema[] = draft.problems.map((title, index) => ({
    id: createId("problema", index),
    municipioId,
    circuitIds: draft.circuitIds,
    barrioId: draft.barrioIds[0],
    title,
    description: `Detectado durante la actividad “${draft.title}”.`,
    category: "A clasificar",
    severity: "medium",
    impact: "Pendiente de evaluación por el equipo.",
    priority: "medium",
    evidence: [],
    origin: "territorial_tour",
    status: "reported",
    statusHistory: [{ to: "reported", changedAt: now }],
    relatedProblemIds: [],
    tags: draft.tags,
    audit,
  }));

  const opportunities: Oportunidad[] = draft.opportunities.map((title, index) => ({
    id: createId("oportunidad", index),
    municipioId,
    circuitIds: draft.circuitIds,
    title,
    description: `Oportunidad registrada durante la actividad “${draft.title}”.`,
    category: "Articulación territorial",
    status: "detected",
    statusHistory: [{ to: "detected", changedAt: now }],
    priority: "medium",
    barrioIds: draft.barrioIds,
    sourceActivityId: activityId,
    relatedProposalIds: [],
    tags: draft.tags,
    audit,
  }));

  const commitments: Compromiso[] = draft.commitments.map((title, index) => ({
    id: createId("compromiso", index),
    municipioId,
    circuitIds: draft.circuitIds,
    title,
    description: `Compromiso asumido durante la actividad “${draft.title}”.`,
    status: "open",
    priority: draft.priority === "critical" ? "urgent" : draft.priority,
    assignedMemberIds: [],
    originType: "event",
    originEntityId: activityId,
    barrioId: draft.barrioIds[0],
    evidenceDocumentIds: [],
    statusHistory: [{ to: "open", changedAt: now }],
    audit,
  }));

  const attachments: MediaAsset[] = draft.attachments.map((file, index) => ({
    id: createId("archivo", index),
    type: file.type.startsWith("video/") ? "video" : "image",
    url: "",
    title: file.name,
    capturedAt: now,
    tags: draft.tags,
  }));

  const activity: Actividad = {
    id: activityId,
    municipioId,
    circuitIds: draft.circuitIds,
    type: draft.type,
    title: draft.title,
    description: draft.description,
    date: draft.date,
    startTime: draft.startTime,
    endTime: draft.endTime || undefined,
    status: "completed",
    statusHistory: [{ to: "completed", changedAt: now, reason: "Registrada desde el Diario" }],
    barrioIds: draft.barrioIds,
    location: draft.location
      ? { locality: draft.location, province: "Buenos Aires", country: "Argentina" }
      : undefined,
    participantMemberIds: [],
    externalParticipants: draft.participants,
    observations: draft.observations,
    attachments,
    tags: draft.tags,
    priority: draft.priority,
    problemIds: problems.map((item) => item.id),
    opportunityIds: opportunities.map((item) => item.id),
    commitmentIds: commitments.map((item) => item.id),
    proposalIds: [],
    documentIds: [],
    publicationIds: [],
    teamIds: ["equipo-gestion"],
    eventIds: [],
    tourIds: [],
    audit,
  };

  const record: ActivityRecord = {
    activity,
    barrioNames,
    organizerName: "Coordinación general",
    participantNames: draft.participants,
    problems,
    opportunities,
    commitments,
    proposals: [],
    documents: [],
    publications: [],
  };

  return { record, createdProblems: problems, createdOpportunities: opportunities, createdCommitments: commitments };
}
