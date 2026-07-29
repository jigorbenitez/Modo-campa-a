export type CoverageLevel = "excellent" | "good" | "medium" | "low" | "critical";

export interface CoverageFactor {
  id: "recentTours" | "surveyedInstitutions" | "activeCommitments" | "documents" | "photos" | "recentActivity";
  label: string;
  weight: number;
  completion: number;
  contribution: number;
  evidence: string;
}

export interface TerritorialCoverage {
  entityId: string;
  entityName: string;
  entityType: "neighborhood" | "locality" | "circuit";
  percentage: number;
  level: CoverageLevel;
  factors: CoverageFactor[];
  calculatedAt: string;
}
