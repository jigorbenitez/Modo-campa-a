import type { InsightRule } from "../domain/rule";
import type { IntelligenceSnapshot } from "../domain/insight";
import { createInsight } from "./helpers";

export const unclassifiedDocumentRule: InsightRule = {
  id: "documents.unclassified",
  description: "Identifica documentos sin etiquetas o sin texto disponible.",
  evaluate(snapshot: IntelligenceSnapshot) {
    const pending = snapshot.documentos.filter(
      (document) => document.tags.length === 0 || !document.extractedTextAvailable,
    );
    if (pending.length === 0) return [];

    return [createInsight(snapshot, {
      ruleId: this.id,
      category: "documents",
      severity: "warning",
      title: "Documentación pendiente de revisión",
      message: `${pending.length} ${pending.length === 1 ? "documento necesita" : "documentos necesitan"} clasificación o revisión de contenido.`,
      suggestedAction: "Completar etiquetas y disponibilidad de texto.",
      evidence: pending.map((document) => document.title),
      references: pending.map((document) => ({ resource: "documento", id: document.id })),
    })];
  },
};

export const overdueCommitmentRule: InsightRule = {
  id: "agenda.overdue-commitments",
  description: "Detecta compromisos abiertos cuya fecha límite ya pasó.",
  evaluate(snapshot: IntelligenceSnapshot) {
    const today = snapshot.generatedAt.slice(0, 10);
    const overdue = snapshot.compromisos.filter(
      (commitment) =>
        commitment.dueDate &&
        commitment.dueDate < today &&
        !["completed", "cancelled"].includes(commitment.status),
    );
    if (overdue.length === 0) return [];

    return [createInsight(snapshot, {
      ruleId: this.id,
      category: "agenda",
      severity: overdue.some((item) => item.priority === "urgent") ? "critical" : "warning",
      title: "Compromisos vencidos",
      message: `Hay ${overdue.length} ${overdue.length === 1 ? "compromiso vencido" : "compromisos vencidos"} que requieren seguimiento.`,
      suggestedAction: "Reasignar fecha o registrar el avance pendiente.",
      evidence: overdue.map((item) => item.title),
      references: overdue.map((item) => ({ resource: "compromiso", id: item.id })),
    })];
  },
};

export const incompleteProposalRule: InsightRule = {
  id: "proposals.incomplete",
  description: "Detecta propuestas sin indicador o área responsable.",
  evaluate(snapshot: IntelligenceSnapshot) {
    const incomplete = snapshot.propuestas.filter(
      (proposal) =>
        !["completed", "archived"].includes(proposal.status) &&
        (proposal.indicators.length === 0 || !proposal.responsibleDepartmentId),
    );
    if (incomplete.length === 0) return [];

    return [createInsight(snapshot, {
      ruleId: this.id,
      category: "proposals",
      severity: "information",
      title: "Propuestas con definición incompleta",
      message: `${incomplete.length} ${incomplete.length === 1 ? "propuesta necesita" : "propuestas necesitan"} indicadores o área responsable antes de avanzar.`,
      suggestedAction: "Completar la ficha técnica de cada propuesta.",
      evidence: incomplete.map((proposal) => proposal.title),
      references: incomplete.map((proposal) => ({ resource: "propuesta", id: proposal.id })),
    })];
  },
};
