import type { Municipio } from "@/domain/entities";

export const mockMunicipio: Municipio = {
  id: "municipio-san-fernando",
  name: "San Fernando",
  province: "Buenos Aires",
  country: "Argentina",
  population: 171616,
  areaKm2: 924,
  neighborhoodIds: ["barrio-san-fernando-centro", "barrio-victoria", "barrio-virreyes", "barrio-san-jorge", "barrio-villa-hall", "barrio-islas"],
  departmentIds: ["secretaria-obras-servicios", "secretaria-desarrollo-humano"],
  documentIds: ["documento-ordenanza-espacios-verdes"],
  indicators: [],
  settings: {
    timezone: "America/Argentina/Buenos_Aires",
    locale: "es-AR",
    currency: "ARS",
    enabledModules: ["dashboard", "territory", "proposals", "agenda", "documents"],
    branding: { primaryColor: "#0A1D3D", secondaryColor: "#00BBD4" },
  },
  active: true,
  audit: {
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-07-01T12:00:00.000Z",
    version: 1,
  },
};
