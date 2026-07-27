import type { Propuesta } from "@/domain/entities";

export const mockPropuestas: Propuesta[] = [
  {
    id: "propuesta-corredores-accesibles",
    municipioId: "municipio-villa-del-encuentro",
    title: "Corredores comerciales accesibles",
    summary: "Plan progresivo de adecuación de cruces y veredas en áreas de alta circulación.",
    objective: "Mejorar la accesibilidad peatonal y la seguridad en los corredores comerciales.",
    diagnosis: "Existen tramos con rampas incompletas y superficies deterioradas.",
    rationale: "La accesibilidad universal mejora la autonomía y fortalece la actividad comercial.",
    beneficiaries: [{
      name: "Personas usuarias del área central",
      description: "Residentes, trabajadores y visitantes.",
      barrioIds: ["barrio-centro"],
    }],
    indicators: [{
      id: "indicador-cruces-adecuados",
      name: "Cruces adecuados",
      description: "Cantidad de cruces intervenidos según estándar municipal.",
      unit: "cruces",
      target: 24,
    }],
    estimatedCost: { amount: 180000000, currency: "ARS" },
    priority: "strategic",
    status: "draft",
    statusHistory: [{ to: "draft", changedAt: "2026-07-22T12:00:00.000Z" }],
    responsibleDepartmentId: "secretaria-obras-servicios",
    collaboratingDepartmentIds: [],
    relatedProblemIds: ["problema-veredas-centro"],
    documentIds: [],
    publicationIds: [],
    barrioIds: ["barrio-centro"],
    tags: ["accesibilidad", "espacio público"],
    audit: {
      createdAt: "2026-07-20T12:00:00.000Z",
      updatedAt: "2026-07-22T12:00:00.000Z",
      version: 1,
    },
  },
];
