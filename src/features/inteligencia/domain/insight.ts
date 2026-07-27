import type {
  Barrio,
  Compromiso,
  Documento,
  Equipo,
  Evento,
  Problema,
  Propuesta,
  Recorrida,
} from "@/domain/entities";
import type { DomainReference } from "@/application/agents";
import type { ISODateTime } from "@/domain/shared/types";

export type InsightCategory =
  | "territory"
  | "problems"
  | "proposals"
  | "documents"
  | "agenda"
  | "team";

export type InsightSeverity = "information" | "opportunity" | "warning" | "critical";

/** Resultado explicable generado por una regla determinista. */
export interface Insight {
  id: string;
  ruleId: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  message: string;
  suggestedAction?: string;
  evidence: string[];
  references: DomainReference[];
  generatedAt: ISODateTime;
}

export interface IntelligenceSnapshot {
  municipioId: string;
  generatedAt: ISODateTime;
  barrios: Barrio[];
  recorridas: Recorrida[];
  problemas: Problema[];
  propuestas: Propuesta[];
  documentos: Documento[];
  eventos: Evento[];
  compromisos: Compromiso[];
  equipo: Equipo;
}

export interface StrategicMetric {
  label: string;
  value: number;
  context: string;
  tone?: "neutral" | "positive" | "warning" | "critical";
}

export interface StrategicArea {
  category: InsightCategory;
  label: string;
  summary: string;
  metrics: StrategicMetric[];
  trend?: {
    direction: "up" | "down" | "stable";
    label: string;
    favorable: boolean;
  };
}

export type ActivityType = "tour" | "document" | "proposal" | "meeting";

export interface IntelligenceActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  occurredAt: ISODateTime;
}

export interface IntelligencePriority {
  id: string;
  title: string;
  context: string;
  level: "high" | "medium" | "normal";
  href: string;
}

export interface IntelligenceViewModel {
  generatedAt: ISODateTime;
  headline: string;
  areas: StrategicArea[];
  insights: Insight[];
  recentActivity: IntelligenceActivity[];
  priorities: IntelligencePriority[];
}
