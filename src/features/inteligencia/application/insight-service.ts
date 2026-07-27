import type { ProposalStatus } from "@/domain/entities";
import type {
  IntelligenceActivity,
  IntelligencePriority,
  IntelligenceSnapshot,
  IntelligenceViewModel,
  StrategicArea,
} from "../domain/insight";
import type { InsightRule } from "../domain/rule";
import { RuleEngine } from "./rule-engine";
import {
  incompleteProposalRule,
  overdueCommitmentRule,
  problemConcentrationRule,
  proposalOverlapRule,
  territoryActivityRule,
  unclassifiedDocumentRule,
} from "../rules";
import { daysBetween } from "../rules/helpers";

const defaultRules: ReadonlyArray<InsightRule<IntelligenceSnapshot>> = [
  territoryActivityRule,
  problemConcentrationRule,
  proposalOverlapRule,
  unclassifiedDocumentRule,
  overdueCommitmentRule,
  incompleteProposalRule,
];

export class InsightService {
  private readonly engine: RuleEngine<IntelligenceSnapshot>;

  constructor(rules: ReadonlyArray<InsightRule<IntelligenceSnapshot>> = defaultRules) {
    this.engine = new RuleEngine(rules);
  }

  generate(snapshot: IntelligenceSnapshot): IntelligenceViewModel {
    const { insights } = this.engine.run(snapshot);
    const areas = this.buildAreas(snapshot);
    const priorities = this.buildPriorities(snapshot);
    const recentActivity = this.buildRecentActivity(snapshot);
    const criticalCount = insights.filter((insight) => insight.severity === "critical").length;
    const warningCount = insights.filter((insight) => insight.severity === "warning").length;

    return {
      generatedAt: snapshot.generatedAt,
      headline:
        criticalCount > 0
          ? `Hay ${criticalCount} ${criticalCount === 1 ? "situación crítica" : "situaciones críticas"} que requieren atención inmediata.`
          : `El panorama presenta ${warningCount} ${warningCount === 1 ? "alerta operativa" : "alertas operativas"} y oportunidades concretas de coordinación.`,
      areas,
      insights,
      recentActivity,
      priorities,
    };
  }

  private buildAreas(snapshot: IntelligenceSnapshot): StrategicArea[] {
    const recentThreshold = 30;
    const recentlyVisited = new Set(
      snapshot.recorridas
        .filter((tour) => daysBetween(tour.startsAt, snapshot.generatedAt) <= recentThreshold)
        .map((tour) => tour.barrioId),
    );
    const oldTours = snapshot.recorridas.filter(
      (tour) => daysBetween(tour.startsAt, snapshot.generatedAt) > recentThreshold,
    ).length;
    const severeProblems = snapshot.problemas.filter(
      (problem) => problem.severity === "high" || problem.severity === "critical",
    ).length;
    const categories = new Set(snapshot.problemas.map((problem) => problem.category)).size;
    const proposalCount = (statuses: ProposalStatus[]) =>
      snapshot.propuestas.filter((proposal) => statuses.includes(proposal.status)).length;
    const today = snapshot.generatedAt.slice(0, 10);
    const recentDocuments = snapshot.documentos.filter(
      (document) =>
        document.issueDate && daysBetween(`${document.issueDate}T00:00:00.000Z`, snapshot.generatedAt) <= 30,
    ).length;
    const pendingDocuments = snapshot.documentos.filter(
      (document) => document.tags.length === 0 || !document.extractedTextAvailable,
    ).length;
    const openCommitments = snapshot.compromisos.filter(
      (item) => !["completed", "cancelled"].includes(item.status),
    );
    const overdue = openCommitments.filter((item) => item.dueDate && item.dueDate < today).length;
    const upcomingEvents = snapshot.eventos.filter((event) => event.startsAt >= snapshot.generatedAt).length;
    const meetingsToday = snapshot.eventos.filter(
      (event) => event.type === "meeting" && event.startsAt.slice(0, 10) === today,
    ).length;

    return [
      {
        category: "territory",
        label: "Estado territorial",
        summary: `${recentlyVisited.size} de ${snapshot.barrios.length} barrios registran actividad en los últimos 30 días.`,
        metrics: [
          { label: "Recorridos", value: recentlyVisited.size, context: "con actividad reciente", tone: "positive" },
          { label: "Pendientes", value: snapshot.barrios.length - recentlyVisited.size, context: "sin recorrida reciente", tone: "warning" },
          { label: "Recorridas recientes", value: snapshot.recorridas.length - oldTours, context: "últimos 30 días" },
          { label: "Recorridas antiguas", value: oldTours, context: "más de 30 días", tone: oldTours ? "warning" : "neutral" },
        ],
      },
      {
        category: "problems",
        label: "Problemas",
        summary: `${severeProblems} registros de gravedad alta requieren una lectura coordinada.`,
        metrics: [
          { label: "Registros", value: snapshot.problemas.length, context: "problemas identificados" },
          { label: "Categorías", value: categories, context: "temas diferentes" },
          { label: "Alta gravedad", value: severeProblems, context: "requieren atención", tone: severeProblems ? "warning" : "positive" },
        ],
        trend: { direction: "up", label: "3 registros nuevos esta semana", favorable: false },
      },
      {
        category: "proposals",
        label: "Propuestas",
        summary: `${proposalCount(["draft", "diagnosis", "under_review"])} propuestas siguen en elaboración o estudio.`,
        metrics: [
          { label: "En estudio", value: proposalCount(["idea", "diagnosis", "draft", "under_review"]), context: "requieren definición" },
          { label: "Listas", value: proposalCount(["approved"]), context: "aprobadas para avanzar", tone: "positive" },
          { label: "Ejecutadas", value: proposalCount(["in_execution", "completed"]), context: "en marcha o finalizadas" },
          { label: "Archivadas", value: proposalCount(["archived"]), context: "sin actividad actual" },
        ],
      },
      {
        category: "documents",
        label: "Documentación",
        summary: `${pendingDocuments} ${pendingDocuments === 1 ? "documento necesita" : "documentos necesitan"} clasificación o revisión.`,
        metrics: [
          { label: "Cargados", value: snapshot.documentos.length, context: "en el repositorio" },
          { label: "Incorporados", value: recentDocuments, context: "últimos 30 días", tone: "positive" },
          { label: "Por revisar", value: pendingDocuments, context: "sin clasificar", tone: pendingDocuments ? "warning" : "positive" },
        ],
      },
      {
        category: "agenda",
        label: "Agenda",
        summary: `${upcomingEvents} actividades próximas y ${overdue} compromisos fuera de fecha.`,
        metrics: [
          { label: "Reuniones hoy", value: meetingsToday, context: "agenda del día" },
          { label: "Próximas", value: upcomingEvents, context: "actividades confirmadas" },
          { label: "Compromisos", value: openCommitments.length, context: "todavía abiertos" },
          { label: "Vencidos", value: overdue, context: "requieren seguimiento", tone: overdue ? "critical" : "positive" },
        ],
      },
      {
        category: "team",
        label: "Equipo",
        summary: `${snapshot.equipo.members.filter((member) => member.active).length} integrantes activos sostienen ${openCommitments.length} tareas abiertas.`,
        metrics: [
          { label: "Tareas abiertas", value: openCommitments.length, context: "compromisos asignados" },
          { label: "Tareas vencidas", value: overdue, context: "fuera de fecha", tone: overdue ? "critical" : "positive" },
          { label: "Integrantes", value: snapshot.equipo.members.filter((member) => member.active).length, context: "actualmente activos", tone: "positive" },
        ],
      },
    ];
  }

  private buildRecentActivity(snapshot: IntelligenceSnapshot): IntelligenceActivity[] {
    const tours: IntelligenceActivity[] = snapshot.recorridas.map((tour) => ({
      id: tour.id,
      type: "tour",
      title: tour.title,
      description: snapshot.barrios.find((barrio) => barrio.id === tour.barrioId)?.name ?? "Territorio",
      occurredAt: tour.startsAt,
    }));
    const documents: IntelligenceActivity[] = snapshot.documentos.map((document) => ({
      id: document.id,
      type: "document",
      title: document.title,
      description: "Documento incorporado",
      occurredAt: `${document.issueDate ?? document.audit.updatedAt.slice(0, 10)}T12:00:00.000Z`,
    }));
    const proposals: IntelligenceActivity[] = snapshot.propuestas.map((proposal) => ({
      id: proposal.id,
      type: "proposal",
      title: proposal.title,
      description: `Estado: ${this.proposalStatusLabel(proposal.status)}`,
      occurredAt: proposal.audit.updatedAt,
    }));
    const meetings: IntelligenceActivity[] = snapshot.eventos
      .filter((event) => event.type === "meeting")
      .map((event) => ({
        id: event.id,
        type: "meeting",
        title: event.title,
        description: event.status === "confirmed" ? "Reunión confirmada" : "Reunión programada",
        occurredAt: event.startsAt,
      }));

    return [...tours, ...documents, ...proposals, ...meetings]
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      .slice(0, 7);
  }

  private buildPriorities(snapshot: IntelligenceSnapshot): IntelligencePriority[] {
    const priorities = snapshot.compromisos
      .filter((commitment) => !["completed", "cancelled"].includes(commitment.status))
      .map((commitment) => ({
        id: commitment.id,
        title: commitment.title,
        context: commitment.dueDate ? `Fecha objetivo: ${commitment.dueDate}` : "Sin fecha definida",
        level: commitment.priority === "urgent" || commitment.priority === "high" ? "high" as const : "medium" as const,
        href: "/agenda",
      }));

    const staleBarrio = snapshot.barrios.find((barrio) => {
      const latestTour = snapshot.recorridas
        .filter((tour) => tour.barrioId === barrio.id)
        .sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0];
      return !latestTour || daysBetween(latestTour.startsAt, snapshot.generatedAt) > 30;
    });

    if (staleBarrio) {
      priorities.push({
        id: `priority-${staleBarrio.id}`,
        title: `Recorrer ${staleBarrio.name}`,
        context: "Sin actividad territorial en los últimos 30 días",
        level: "high",
        href: "/barrios",
      });
    }

    const pendingDocument = snapshot.documentos.find(
      (document) => document.tags.length === 0 || !document.extractedTextAvailable,
    );
    if (pendingDocument) {
      priorities.push({
        id: `priority-${pendingDocument.id}`,
        title: `Analizar ${pendingDocument.title.toLocaleLowerCase("es")}`,
        context: "Documento pendiente de clasificación",
        level: "medium",
        href: "/inteligencia",
      });
    }

    return priorities.slice(0, 4);
  }

  private proposalStatusLabel(status: ProposalStatus): string {
    const labels: Record<ProposalStatus, string> = {
      idea: "idea",
      diagnosis: "diagnóstico",
      draft: "borrador",
      under_review: "en revisión",
      approved: "aprobada",
      in_execution: "en ejecución",
      completed: "completada",
      archived: "archivada",
    };
    return labels[status];
  }
}
