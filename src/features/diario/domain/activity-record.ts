import type {
  Actividad,
  ActivityPriority,
  ActivityType,
  Compromiso,
  Documento,
  Oportunidad,
  Problema,
  Propuesta,
  Publicacion,
} from "@/domain/entities";

export interface LinkedItem {
  id: string;
  title: string;
  description?: string;
  status?: string;
}

/** Modelo de lectura completo para evitar navegación fragmentada. */
export interface ActivityRecord {
  activity: Actividad;
  barrioNames: string[];
  organizerName?: string;
  participantNames: string[];
  problems: Array<Pick<Problema, "id" | "title" | "description" | "severity" | "status">>;
  opportunities: Array<Pick<Oportunidad, "id" | "title" | "description" | "priority" | "status">>;
  commitments: Array<Pick<Compromiso, "id" | "title" | "description" | "priority" | "status" | "dueDate">>;
  proposals: LinkedItem[];
  documents: LinkedItem[];
  publications: LinkedItem[];
}

export interface ActivityDraft {
  type: ActivityType;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  priority: ActivityPriority;
  barrioIds: string[];
  circuitIds: string[];
  location: string;
  observations: string[];
  participants: string[];
  problems: string[];
  opportunities: string[];
  commitments: string[];
  attachments: File[];
  tags: string[];
}

export interface ActivityCreationResult {
  record: ActivityRecord;
  createdProblems: Problema[];
  createdOpportunities: Oportunidad[];
  createdCommitments: Compromiso[];
}

export type RelatedEntity = Problema | Oportunidad | Compromiso | Propuesta | Documento | Publicacion;
