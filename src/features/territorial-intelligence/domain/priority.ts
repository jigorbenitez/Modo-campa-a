export type PriorityLevel = "critical" | "high" | "medium" | "low" | "none";

export type PriorityVariable =
  | "daysSinceLastTour"
  | "openCommitments"
  | "overdueCommitments"
  | "pendingProposals"
  | "coverageGap"
  | "unvisitedInstitutions"
  | "pendingDocuments"
  | "pendingPhotos"
  | "recentActivity"
  | "upcomingEvents"
  | "openAlerts"
  | "registeredProblems";

export interface PriorityRuleConfig {
  id: PriorityVariable;
  label: string;
  enabled: boolean;
  weight: number;
  cap: number;
  inverse?: boolean;
}

export interface PriorityThresholds {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface PriorityConfiguration {
  municipalityId: string;
  rules: PriorityRuleConfig[];
  thresholds: PriorityThresholds;
  colors: Record<PriorityLevel, string>;
  updatedAt: string;
}

export interface PriorityInput {
  entityId: string;
  entityName: string;
  entityType: string;
  location?: { latitude: number; longitude: number };
  relatedIds: string[];
  variables: Record<PriorityVariable, number>;
}

export interface PriorityReason {
  ruleId: PriorityVariable;
  message: string;
  rawValue: number;
  contribution: number;
}

export interface PriorityResult {
  entityId: string;
  entityName: string;
  entityType: string;
  score: number;
  level: PriorityLevel;
  reasons: PriorityReason[];
  location?: { latitude: number; longitude: number };
  relatedIds: string[];
  calculatedAt: string;
  configurationVersion: string;
}

export interface PriorityAuditEntry {
  id: string;
  municipalityId: string;
  entityId: string;
  entityName: string;
  previousLevel: PriorityLevel;
  nextLevel: PriorityLevel;
  previousScore: number;
  nextScore: number;
  explanation: string;
  changedAt: string;
}
