import type { PriorityResult } from "./priority";

export type SimulationActionType =
  | "tour"
  | "closeCommitments"
  | "registerInstitutions"
  | "addPhotos"
  | "addDocuments"
  | "createProposals"
  | "updatePublicData"
  | "registerActivities"
  | "completeSurveys"
  | "addRelationships";

export interface SimulationAction {
  id: string;
  type: SimulationActionType;
  quantity: number;
  targetEntityId: string;
  estimatedMinutes: number;
}

export interface SimulationIndicator {
  id: string;
  label: string;
  before: number;
  after: number;
  difference: number;
  unit: "%" | "count" | "days" | "points";
  explanation: string;
}

export interface SimulationResult {
  targetEntityId: string;
  actions: SimulationAction[];
  indicators: SimulationIndicator[];
  priorityBefore: PriorityResult;
  priorityAfter: PriorityResult;
  generatedAt: string;
  totalMinutes: number;
}

export interface SavedScenario {
  id: string;
  municipalityId: string;
  name: string;
  result: SimulationResult;
  createdAt: string;
}
