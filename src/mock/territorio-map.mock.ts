import type {
  TerritoryFeature,
  TerritoryLayer,
  TerritoryNeighborhood,
  TerritorySnapshot,
} from "@/features/territorio-map";

const municipioId = "municipio-san-fernando";
const updatedAt = "2026-07-27T00:00:00.000Z";
const municipalSource = "Municipalidad de San Fernando";

export const territoryLayers: TerritoryLayer[] = [
  { id: "activities", label: "Actividades", description: "Acciones registradas por el equipo", color: "#16a05d", enabledByDefault: true },
  { id: "problems", label: "Reclamos", description: "Situaciones abiertas o en seguimiento", color: "#e5484d", enabledByDefault: true },
  { id: "commitments", label: "Compromisos", description: "Acuerdos y tareas territoriales", color: "#d99a18", enabledByDefault: true },
  { id: "proposals", label: "Propuestas", description: "Propuestas vinculadas al territorio", color: "#2878d0", enabledByDefault: true },
  { id: "documents", label: "Documentos", description: "Documentación territorial relacionada", color: "#8856d8", enabledByDefault: false },
  { id: "institutions", label: "Instituciones", description: "Equipamiento e instituciones públicas", color: "#7b8794", enabledByDefault: true },
  { id: "neighborhoods", label: "Barrios", description: "Áreas territoriales de referencia", color: "#8b5e3c", enabledByDefault: true },
  { id: "photos", label: "Fotografías", description: "Evidencia visual georreferenciada", color: "#2f9e9e", enabledByDefault: false },
  { id: "heat", label: "Intensidad", description: "Capa preparada para concentración territorial", color: "#f06a3c", enabledByDefault: false },
];

function neighborhood(
  id: string,
  name: string,
  locality: string,
  description: string,
  latitude: number,
  longitude: number,
  population: number,
): TerritoryNeighborhood {
  const delta = 0.012;
  return {
    id,
    municipioId,
    name,
    locality,
    description,
    center: { latitude, longitude },
    boundary: [
      { latitude: latitude + delta, longitude: longitude - delta },
      { latitude: latitude + delta, longitude: longitude + delta },
      { latitude: latitude - delta, longitude: longitude + delta },
      { latitude: latitude - delta, longitude: longitude - delta },
    ],
    population,
    generalStatus: "stable",
    indicators: [
      { label: "Base territorial", value: "Inicial", context: "Preparada para incorporar indicadores operativos" },
    ],
    updatedAt,
    source: `${municipalSource} / geometría operativa de referencia`,
  };
}

export const territoryNeighborhoods: TerritoryNeighborhood[] = [
  neighborhood("barrio-san-fernando-centro", "San Fernando Centro", "San Fernando", "Área urbana central y cabecera administrativa del partido.", -34.4431, -58.5579, 0),
  neighborhood("barrio-victoria", "Victoria", "Victoria", "Área territorial de referencia de la localidad de Victoria.", -34.4559, -58.5422, 0),
  neighborhood("barrio-virreyes", "Virreyes", "Virreyes", "Área territorial de referencia de la localidad de Virreyes.", -34.4623, -58.5752, 0),
  neighborhood("barrio-san-jorge", "San Jorge", "Virreyes", "Barrio reconocido por el Municipio dentro de la localidad de Virreyes.", -34.472, -58.596, 0),
  neighborhood("barrio-villa-hall", "Villa Hall", "San Fernando", "Barrio reconocido por el Municipio de San Fernando.", -34.4339, -58.5745, 0),
  neighborhood("barrio-islas", "Islas del Delta", "Islas del Delta del Paraná", "Sector insular del Partido de San Fernando.", -34.279, -58.476, 0),
];

type FeatureInput = Pick<
  TerritoryFeature,
  "id" | "title" | "subtype" | "description" | "point" | "barrioId" | "localidad"
>;

function institution(input: FeatureInput): TerritoryFeature {
  return {
    ...input,
    municipioId,
    layerId: "institutions",
    kind: "institution",
    occurredAt: updatedAt,
    updatedAt,
    source: municipalSource,
    status: "active",
    participants: [],
    problems: [],
    commitments: [],
    proposals: [],
    documents: [],
    publications: [],
    photos: [],
    videos: [],
    history: [{ at: updatedAt, label: `Registro incorporado desde ${municipalSource}` }],
  };
}

// Base inicial verificable. No incluye actividad operativa ni indicadores simulados.
export const territoryFeatures: TerritoryFeature[] = [
  institution({
    id: "institucion-municipalidad-san-fernando",
    title: "Municipalidad de San Fernando",
    subtype: "Dependencia municipal",
    description: "Sede central del Municipio de San Fernando.",
    point: { latitude: -34.4436, longitude: -58.5572 },
    barrioId: "barrio-san-fernando-centro",
    localidad: "San Fernando",
  }),
  institution({
    id: "institucion-estacion-san-fernando",
    title: "Estación San Fernando",
    subtype: "Estación de tren",
    description: "Estación ferroviaria del ramal Mitre.",
    point: { latitude: -34.4449, longitude: -58.5561 },
    barrioId: "barrio-san-fernando-centro",
    localidad: "San Fernando",
  }),
  institution({
    id: "institucion-estacion-victoria",
    title: "Estación Victoria",
    subtype: "Estación de tren",
    description: "Estación ferroviaria de la localidad de Victoria.",
    point: { latitude: -34.4562, longitude: -58.5427 },
    barrioId: "barrio-victoria",
    localidad: "Victoria",
  }),
  institution({
    id: "institucion-estacion-virreyes",
    title: "Estación Virreyes",
    subtype: "Estación de tren",
    description: "Estación ferroviaria de la localidad de Virreyes.",
    point: { latitude: -34.4553, longitude: -58.5724 },
    barrioId: "barrio-virreyes",
    localidad: "Virreyes",
  }),
  institution({
    id: "institucion-estacion-carupa",
    title: "Estación Carupá",
    subtype: "Estación de tren",
    description: "Estación ferroviaria situada en el sector norte del partido.",
    point: { latitude: -34.4088, longitude: -58.5786 },
    barrioId: "barrio-villa-hall",
    localidad: "San Fernando",
  }),
  institution({
    id: "institucion-plaza-memoria-corazon",
    title: "Plaza Memoria y Corazón",
    subtype: "Plaza",
    description: "Espacio público del barrio San Jorge, ubicado en Ruta 202 y Maipú.",
    point: { latitude: -34.4721, longitude: -58.5962 },
    barrioId: "barrio-san-jorge",
    localidad: "Virreyes",
  }),
  institution({
    id: "institucion-jardin-902",
    title: "Jardín de Infantes N.º 902",
    subtype: "Jardín",
    description: "Establecimiento educativo del barrio San Jorge.",
    point: { latitude: -34.4717, longitude: -58.5956 },
    barrioId: "barrio-san-jorge",
    localidad: "Virreyes",
  }),
  institution({
    id: "institucion-escuela-oficios-2",
    title: "Escuela de Oficios N.º 2",
    subtype: "Escuela",
    description: "Escuela de oficios municipal ubicada en Ruta 202 y Maipú.",
    point: { latitude: -34.4724, longitude: -58.5967 },
    barrioId: "barrio-san-jorge",
    localidad: "Virreyes",
  }),
];

export const territoryCategories = [
  "Escuela", "Jardín", "CAPS", "Hospital", "Clínica", "Club", "Plaza", "Paseo",
  "Centro cultural", "Biblioteca", "Iglesia", "Bomberos", "Policía",
  "Dependencia municipal", "Delegación", "Estación de tren", "Centro comercial",
  "Costanera", "Puerto", "Organización", "Sociedad de fomento", "Espacio verde",
  "Punto de interés",
] as const;

export const mockTerritorySnapshot: TerritorySnapshot = {
  municipioId,
  municipalityName: "San Fernando",
  center: { latitude: -34.4431, longitude: -58.5579 },
  layers: territoryLayers,
  neighborhoods: territoryNeighborhoods,
  features: territoryFeatures,
  periods: [{ id: "today", label: "Hoy", cutoff: "2026-07-27" }],
};
