import type { Municipio } from "@/domain/entities";

export const mockMunicipio: Municipio = {
  id: "municipio-villa-del-encuentro",
  name: "Villa del Encuentro",
  province: "Buenos Aires",
  country: "Argentina",
  population: 84200,
  areaKm2: 118,
  neighborhoodIds: ["barrio-centro", "barrio-estacion"],
  departmentIds: ["secretaria-obras-servicios", "secretaria-desarrollo-humano"],
  documentIds: ["documento-ordenanza-espacios-verdes"],
  indicators: [],
  settings: {
    timezone: "America/Argentina/Buenos_Aires",
    locale: "es-AR",
    currency: "ARS",
    enabledModules: ["dashboard", "territory", "proposals", "agenda", "documents"],
    branding: { primaryColor: "#147a46", secondaryColor: "#13251b" },
  },
  active: true,
  audit: {
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-07-01T12:00:00.000Z",
    version: 1,
  },
};
