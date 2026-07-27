import type {
  KnowledgeEdge,
  KnowledgeSnapshot,
  RelationshipRule,
} from "../domain/knowledge";

const createdAt = "2026-07-26T12:00:00.000Z";

function edge(
  snapshot: KnowledgeSnapshot,
  ruleId: string,
  sourceId: string,
  targetId: string,
  type: KnowledgeEdge["type"],
  label: string,
  evidence: string[],
  weight = 0.8,
): KnowledgeEdge {
  return {
    id: `${ruleId}:${sourceId}:${targetId}:${type}`,
    municipioId: snapshot.municipioId,
    sourceId,
    targetId,
    type,
    label,
    weight,
    origin: "rule",
    evidence,
    createdAt,
  };
}

export const geographicRelationshipRule: RelationshipRule = {
  id: "relationship.geographic",
  description: "Vincula entidades con los barrios que declaran como contexto.",
  discover(snapshot) {
    const neighborhoods = new Set(
      snapshot.nodes.filter((node) => node.type === "neighborhood").map((node) => node.id),
    );
    return snapshot.nodes.flatMap((node) =>
      node.barrioIds
        .filter((id) => neighborhoods.has(id))
        .map((barrioId) =>
          edge(
            snapshot,
            this.id,
            node.id,
            barrioId,
            node.type === "activity" ? "occurred_in" : "located_in",
            node.type === "activity" ? "Ocurrió en" : "Vinculado territorialmente",
            [`${node.title} declara el barrio como contexto`],
            1,
          ),
        ),
    );
  },
};

export const participantRelationshipRule: RelationshipRule = {
  id: "relationship.participation",
  description: "Vincula actividades con participantes identificados.",
  discover(snapshot) {
    const people = new Set(
      snapshot.nodes.filter((node) => node.type === "person").map((node) => node.id),
    );
    return snapshot.nodes
      .filter((node) => node.type === "activity")
      .flatMap((activity) =>
        activity.personIds
          .filter((id) => people.has(id))
          .map((personId) =>
            edge(
              snapshot,
              this.id,
              personId,
              activity.id,
              "participated_in",
              "Participó en",
              [`Participación registrada en ${activity.title}`],
              1,
            ),
          ),
      );
  },
};

export const institutionalRelationshipRule: RelationshipRule = {
  id: "relationship.institutional",
  description: "Vincula personas y actividades con instituciones declaradas.",
  discover(snapshot) {
    const institutions = new Set(
      snapshot.nodes.filter((node) => node.type === "institution").map((node) => node.id),
    );
    return snapshot.nodes.flatMap((node) =>
      node.institutionIds
        .filter((id) => institutions.has(id))
        .map((institutionId) =>
          edge(
            snapshot,
            this.id,
            node.id,
            institutionId,
            node.type === "person" ? "belongs_to" : "related_to",
            node.type === "person" ? "Vinculación institucional" : "Institución relacionada",
            [`${node.title} referencia a una institución`],
            0.95,
          ),
        ),
    );
  },
};

export const sharedTopicRelationshipRule: RelationshipRule = {
  id: "relationship.shared-topic",
  description: "Relaciona problemas, propuestas y documentos con temas compartidos.",
  discover(snapshot) {
    const eligible = snapshot.nodes.filter((node) =>
      ["problem", "proposal", "document", "opportunity"].includes(node.type),
    );
    const edges: KnowledgeEdge[] = [];

    eligible.forEach((node, index) => {
      for (const other of eligible.slice(index + 1)) {
        const shared = node.tags.filter((tag) => other.tags.includes(tag));
        if (shared.length === 0) continue;
        edges.push(
          edge(
            snapshot,
            this.id,
            node.id,
            other.id,
            "shared_topic",
            "Tema compartido",
            [`Etiquetas compartidas: ${shared.join(", ")}`],
            Math.min(0.9, 0.55 + shared.length * 0.15),
          ),
        );
      }
    });

    return edges;
  },
};

export const activitySequenceRule: RelationshipRule = {
  id: "relationship.activity-sequence",
  description: "Conecta actividades consecutivas del mismo barrio.",
  discover(snapshot) {
    const activities = snapshot.nodes
      .filter((node) => node.type === "activity" && node.occurredAt)
      .sort((a, b) => (a.occurredAt ?? "").localeCompare(b.occurredAt ?? ""));
    const edges: KnowledgeEdge[] = [];

    activities.forEach((activity, index) => {
      const previous = activities
        .slice(0, index)
        .reverse()
        .find((candidate) =>
          candidate.barrioIds.some((id) => activity.barrioIds.includes(id)),
        );
      if (!previous) return;
      edges.push(
        edge(
          snapshot,
          this.id,
          activity.id,
          previous.id,
          "previous_activity",
          "Actividad territorial anterior",
          ["Ambas actividades comparten barrio y orden cronológico"],
          0.65,
        ),
      );
    });

    return edges;
  },
};

export const defaultRelationshipRules: RelationshipRule[] = [
  geographicRelationshipRule,
  participantRelationshipRule,
  institutionalRelationshipRule,
  sharedTopicRelationshipRule,
  activitySequenceRule,
];
