import type { EntityId, ISODateTime } from "@/domain/shared/types";

export type AgentType =
  | "strategist"
  | "territorial_analyst"
  | "public_opinion_analyst"
  | "communications_specialist"
  | "writer"
  | "creative"
  | "campaign_designer"
  | "legislative_analyst"
  | "budget_analyst"
  | "digital_marketing_specialist"
  | "team_coordinator"
  | "agenda_assistant";

export type DomainResource =
  | "municipio"
  | "barrio"
  | "problema"
  | "propuesta"
  | "secretaria"
  | "documento"
  | "recorrida"
  | "evento"
  | "compromiso"
  | "publicacion"
  | "equipo";

export type ResourceAction = "read" | "suggest" | "create_draft" | "update" | "approve";

export interface AgentCapability {
  resource: DomainResource;
  actions: ResourceAction[];
}

/** Alcance inmutable que todos los agentes deberán recibir del orquestador. */
export interface AgentExecutionContext {
  executionId: EntityId;
  municipioId: EntityId;
  agentType: AgentType;
  actorId?: EntityId;
  capabilities: AgentCapability[];
  requestedAt: ISODateTime;
  correlationId: string;
}

export interface DomainReference {
  resource: DomainResource;
  id: EntityId;
  version?: number;
}

export interface AgentTask<TInput = unknown> {
  id: EntityId;
  context: AgentExecutionContext;
  objective: string;
  input: TInput;
  references: DomainReference[];
}

export interface AgentSuggestion<TPayload = unknown> {
  id: EntityId;
  taskId: EntityId;
  agentType: AgentType;
  payload: TPayload;
  references: DomainReference[];
  rationale: string;
  confidence?: number;
  createdAt: ISODateTime;
  /** Ninguna sugerencia modifica el dominio sin aprobación explícita. */
  requiresHumanApproval: true;
}

export interface AgentGateway {
  execute<TInput, TOutput>(task: AgentTask<TInput>): Promise<AgentSuggestion<TOutput>>;
}
