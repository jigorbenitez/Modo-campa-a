import type { Barrio, Problema, Recorrida } from "@/domain/entities";

const municipioId = "municipio-san-fernando";
const audit = {
  createdAt: "2026-06-01T12:00:00.000Z",
  updatedAt: "2026-07-20T12:00:00.000Z",
  version: 1,
};

export const mockBarrios: Barrio[] = [
  {
    id: "barrio-san-fernando-centro",
    municipioId,
    name: "Centro",
    description: "Ãrea comercial y administrativa con alta circulaciÃ³n diaria.",
    areaKm2: 8.4,
    demographics: { population: 12600, sourceDocumentIds: [] },
    problemIds: ["problema-veredas-centro"],
    strengths: ["Actividad comercial", "Conectividad de transporte"],
    projectIds: [],
    tourIds: ["recorrida-centro-julio"],
    contactIds: [],
    photos: [],
    indicators: [],
    documentIds: [],
    tags: ["comercio", "movilidad"],
    active: true,
    audit,
  },
  {
    id: "barrio-victoria",
    municipioId,
    name: "EstaciÃ³n",
    description: "Sector residencial vinculado al corredor ferroviario.",
    demographics: { population: 9800, sourceDocumentIds: [] },
    problemIds: [],
    strengths: ["Acceso ferroviario", "Red de clubes barriales"],
    projectIds: [],
    tourIds: [],
    contactIds: [],
    photos: [],
    indicators: [],
    documentIds: [],
    tags: ["transporte", "deporte"],
    active: true,
    audit,
  },
];

export const mockProblemas: Problema[] = [
  {
    id: "problema-veredas-centro",
    municipioId,
    barrioId: "barrio-san-fernando-centro",
    title: "Tramos de vereda con accesibilidad reducida",
    description: "Se identificaron cruces que requieren adecuaciÃ³n de rampas y superficies.",
    category: "Espacio pÃºblico",
    severity: "medium",
    impact: "Dificulta el desplazamiento seguro de personas con movilidad reducida.",
    priority: "high",
    evidence: [],
    origin: "territorial_tour",
    status: "validated",
    statusHistory: [{ to: "validated", changedAt: "2026-07-18T15:00:00.000Z" }],
    relatedProblemIds: [],
    tags: ["accesibilidad", "veredas"],
    audit,
  },
];

export const mockRecorridas: Recorrida[] = [
  {
    id: "recorrida-centro-julio",
    municipioId,
    title: "Relevamiento del corredor comercial",
    barrioId: "barrio-san-fernando-centro",
    status: "completed",
    startsAt: "2026-07-18T13:00:00.000Z",
    endsAt: "2026-07-18T15:00:00.000Z",
    attendeeMemberIds: [],
    externalAttendees: ["Representantes de asociaciones comerciales"],
    observations: [],
    detectedProblemIds: ["problema-veredas-centro"],
    media: [],
    commitmentIds: [],
    audit,
  },
];
