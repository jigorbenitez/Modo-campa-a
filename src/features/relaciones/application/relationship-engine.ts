import type {
  EntityContext,
  KnowledgeEdge,
  KnowledgeEntityType,
  KnowledgeHistoryItem,
  KnowledgeNode,
  KnowledgeSnapshot,
  RelationshipGroup,
  RelationshipRule,
} from "../domain/knowledge";
import { defaultRelationshipRules } from "../rules/domain-rules";

const groupLabels: Record<KnowledgeEntityType, string> = {
  municipality: "Municipio",
  neighborhood: "Barrios",
  activity: "Actividades",
  institution: "Instituciones",
  person: "Personas",
  document: "Documentos",
  problem: "Problemas",
  opportunity: "Oportunidades",
  commitment: "Compromisos",
  proposal: "Propuestas",
  publication: "Publicaciones",
  team: "Equipos",
};

export class RelationshipEngine {
  private readonly nodes: Map<string, KnowledgeNode>;
  private readonly edges: KnowledgeEdge[];

  constructor(
    private readonly snapshot: KnowledgeSnapshot,
    rules: ReadonlyArray<RelationshipRule> = defaultRelationshipRules,
  ) {
    this.nodes = new Map(snapshot.nodes.map((node) => [node.id, node]));
    this.edges = this.deduplicate([
      ...snapshot.explicitEdges,
      ...rules.flatMap((rule) => rule.discover(snapshot)),
    ]);
  }

  discoverRelationships(entityId: string): KnowledgeEdge[] {
    return this.edges.filter(
      (edge) => edge.sourceId === entityId || edge.targetId === entityId,
    );
  }

  calculateConnections(entityId: string): {
    total: number;
    byType: Partial<Record<KnowledgeEntityType, number>>;
  } {
    const related = this.getRelatedNodes(entityId);
    return {
      total: related.length,
      byType: related.reduce<Partial<Record<KnowledgeEntityType, number>>>(
        (result, node) => ({
          ...result,
          [node.type]: (result[node.type] ?? 0) + 1,
        }),
        {},
      ),
    };
  }

  getCompleteContext(entityId: string): EntityContext | null {
    const entity = this.nodes.get(entityId);
    if (!entity) return null;
    const connections = this.discoverRelationships(entityId);
    const relatedNodes = this.getRelatedNodes(entityId);
    const groups = this.groupNodes(relatedNodes);
    const recentActivity = relatedNodes
      .filter((node) => node.type === "activity" && node.occurredAt)
      .sort((a, b) => (b.occurredAt ?? "").localeCompare(a.occurredAt ?? ""))
      .slice(0, 6);
    const timeline = this.buildTimeline(entity, relatedNodes);

    return {
      entity,
      connections,
      relatedNodes,
      groups,
      recentActivity,
      timeline,
      quickLinks: relatedNodes.slice(0, 5).map((node) => ({
        id: node.id,
        label: node.title,
        href: this.resolveNavigation(node.id),
      })),
      connectionCount: relatedNodes.length,
    };
  }

  resolveNavigation(entityId: string): string {
    return `/relaciones?entity=${encodeURIComponent(entityId)}`;
  }

  getNodes(): KnowledgeNode[] {
    return [...this.nodes.values()];
  }

  getEdges(): KnowledgeEdge[] {
    return [...this.edges];
  }

  private getRelatedNodes(entityId: string): KnowledgeNode[] {
    const ids = new Set<string>();
    for (const edge of this.discoverRelationships(entityId)) {
      ids.add(edge.sourceId === entityId ? edge.targetId : edge.sourceId);
    }
    return [...ids]
      .map((id) => this.nodes.get(id))
      .filter((node): node is KnowledgeNode => Boolean(node));
  }

  private groupNodes(nodes: KnowledgeNode[]): RelationshipGroup[] {
    const grouped = new Map<KnowledgeEntityType, KnowledgeNode[]>();
    for (const node of nodes) {
      grouped.set(node.type, [...(grouped.get(node.type) ?? []), node]);
    }
    return [...grouped.entries()]
      .map(([type, items]) => ({
        type,
        label: groupLabels[type],
        nodes: items.sort((a, b) => a.title.localeCompare(b.title, "es")),
      }))
      .sort((a, b) => b.nodes.length - a.nodes.length);
  }

  private buildTimeline(
    entity: KnowledgeNode,
    relatedNodes: KnowledgeNode[],
  ): KnowledgeHistoryItem[] {
    const relatedHistory = relatedNodes.flatMap((node) => [
      ...node.history,
      ...(node.occurredAt
        ? [{
            id: `occurrence:${node.id}`,
            at: node.occurredAt,
            label: node.title,
            description: groupLabels[node.type],
          }]
        : []),
    ]);
    return [...entity.history, ...relatedHistory]
      .sort((a, b) => b.at.localeCompare(a.at))
      .filter(
        (item, index, items) =>
          items.findIndex(
            (candidate) =>
              candidate.at === item.at && candidate.label === item.label,
          ) === index,
      )
      .slice(0, 12);
  }

  private deduplicate(edges: KnowledgeEdge[]): KnowledgeEdge[] {
    const unique = new Map<string, KnowledgeEdge>();
    for (const edge of edges) {
      if (edge.sourceId === edge.targetId) continue;
      const source = this.nodes.get(edge.sourceId);
      const target = this.nodes.get(edge.targetId);
      if (!source || !target) continue;
      if (
        source.municipioId !== this.snapshot.municipioId ||
        target.municipioId !== this.snapshot.municipioId
      ) {
        continue;
      }
      const pair = [edge.sourceId, edge.targetId].sort().join("::");
      const key = `${pair}::${edge.type}`;
      const existing = unique.get(key);
      if (!existing || edge.weight > existing.weight || edge.origin === "explicit") {
        unique.set(key, edge);
      }
    }
    return [...unique.values()];
  }
}
