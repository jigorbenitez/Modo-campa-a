import type { TerritorialEntity } from "@/features/territorial-engine/domain";

export type QualityIssueType = "duplicate" | "name" | "classification" | "coordinates" | "outside" | "address" | "source" | "category";
export interface TerritorialQualityIssue { id: string; entityId: string; type: QualityIssueType; severity: "high" | "medium" | "low"; message: string; suggestion?: string; }
export interface TerritorialCoverageMetric { id: string; label: string; loaded: number; complete: number; percentage: number; missing: number; duplicates: number; unclassified: number; expected: null; }
export interface TerritorialAuditReport { generatedAt: string; entities: number; qualityScore: number; issues: TerritorialQualityIssue[]; coverage: TerritorialCoverageMetric[]; correctedClassifications: number; }

export function entitySource(entity: TerritorialEntity) { return String(entity.metadata.source ?? "").trim(); }

