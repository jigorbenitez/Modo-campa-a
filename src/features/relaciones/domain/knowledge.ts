import type { ISODateTime } from "@/domain/shared/types";

export type KnowledgeEntityType =
  | "municipality"
  | "neighborhood"
  | "activity"
  | "institution"
  | "person"
  | "document"
  | "problem"
  | "opportunity"
  | "commitment"
  | "proposal"
  | "publication"
  | "team";

export type RelationshipType =
  | "located_in"
  | "occurred_in"
  | "participated_in"
  | "belongs_to"
  | "detected_in"
  | "generated"
  | "supports"
  | "documents"
  | "responsible_for"
  | "related_to"
  | "follow_up_of"
  | "mentions"
  | "shared_topic"
  | "previous_activity";

export interface KnowledgeHistoryItem {
  id: string;
  at: ISODateTime;
  label: string;
  description?: string;
}

export interface KnowledgeNode {
  id: string;
  municipioId: string;
  type: KnowledgeEntityType;
  title: string;
  summary: string;
  status?: string;
  occurredAt?: ISODateTime;
  barrioIds: string[];
  institutionIds: string[];
  personIds: string[];
  tags: string[];
  metadata: Record<string, string | number | boolean | string[]>;
  history: KnowledgeHistoryItem[];
}

export interface KnowledgeEdge {
  id: string;
  municipioId: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  label: string;
  weight: number;
  origin: "explicit" | "rule";
  evidence: string[];
  createdAt: ISODateTime;
}

export interface KnowledgeSnapshot {
  municipioId: string;
  nodes: KnowledgeNode[];
  explicitEdges: KnowledgeEdge[];
  generatedAt: ISODateTime;
}

export interface RelationshipRule {
  readonly id: string;
  readonly description: string;
  discover(snapshot: KnowledgeSnapshot): KnowledgeEdge[];
}

export interface RelationshipGroup {
  type: KnowledgeEntityType;
  label: string;
  nodes: KnowledgeNode[];
}

export interface EntityContext {
  entity: KnowledgeNode;
  connections: KnowledgeEdge[];
  relatedNodes: KnowledgeNode[];
  groups: RelationshipGroup[];
  recentActivity: KnowledgeNode[];
  timeline: KnowledgeHistoryItem[];
  quickLinks: Array<{ id: string; label: string; href: string }>;
  connectionCount: number;
}
