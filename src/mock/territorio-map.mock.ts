import boundaryData from "@/data/san-fernando-boundaries.json";
import circuitData from "@/data/san-fernando-electoral-circuits.json";
import municipalityData from "@/data/san-fernando-municipality-from-circuits.json";
import type {
  TerritoryCircuit,
  TerritoryFeature,
  TerritoryLayer,
  TerritoryNeighborhood,
  TerritorySnapshot,
} from "@/features/territorio-map";

const municipioId = "municipio-san-fernando";
const updatedAt = "2026-07-28T00:00:00.000Z";

type Coordinate = [number, number];
type BoundaryFeature = {
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: Coordinate[][] | Coordinate[][][];
  };
  properties: {
    id: string;
    name: string;
    level: "municipality" | "locality" | "neighborhood";
    source: string;
    sourceUrl: string;
  };
};

const boundaries = (boundaryData as unknown as { features: BoundaryFeature[] }).features;
type CircuitFeature = {
  geometry: {
    type: "MultiPolygon";
    coordinates: Coordinate[][][];
  };
  properties: {
    id: string;
    code: string;
    name: string;
    source: string;
    sourceUrl: string;
    license: string;
    updatedAt: string;
  };
};
const circuitFeatures = (
  circuitData as unknown as { features: CircuitFeature[] }
).features;
const municipalityFeature = (municipalityData as unknown as {
  features: Array<{ geometry: { type: "MultiPolygon"; coordinates: Coordinate[][][] } }>;
}).features[0];

function ringsFor(id: string): Coordinate[][] {
  const feature = boundaries.find((item) => item.properties.id === id);
  if (!feature) throw new Error(`No existe el límite territorial ${id}.`);
  if (feature.geometry.type === "Polygon") {
    return [(feature.geometry.coordinates as Coordinate[][])[0]];
  }
  return (feature.geometry.coordinates as Coordinate[][][]).map((polygon) => polygon[0]);
}

function toPoints(rings: Coordinate[][]) {
  return rings.map((ring) =>
    ring.map(([longitude, latitude]) => ({ latitude, longitude })),
  );
}

function centerOf(rings: Coordinate[][]) {
  const points = rings.flat();
  const latitudes = points.map(([, latitude]) => latitude);
  const longitudes = points.map(([longitude]) => longitude);
  return {
    latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
    longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
  };
}

export const territoryElectoralCircuits: TerritoryCircuit[] =
  circuitFeatures.map((feature) => {
    const rings = feature.geometry.coordinates.map((polygon) => polygon[0]);
    return {
      id: feature.properties.id,
      municipioId,
      code: feature.properties.code,
      name: feature.properties.name,
      center: centerOf(rings),
      boundaries: toPoints(rings),
      updatedAt: `${feature.properties.updatedAt}T00:00:00.000Z`,
      source: feature.properties.source,
      sourceUrl: feature.properties.sourceUrl,
      license: feature.properties.license,
    };
  });

function pointInRing(
  point: { latitude: number; longitude: number },
  ring: Array<{ latitude: number; longitude: number }>,
) {
  let inside = false;
  for (let current = 0, previous = ring.length - 1; current < ring.length; previous = current++) {
    const a = ring[current];
    const b = ring[previous];
    const intersects =
      a.latitude > point.latitude !== b.latitude > point.latitude &&
      point.longitude <
        ((b.longitude - a.longitude) * (point.latitude - a.latitude)) /
          (b.latitude - a.latitude) +
          a.longitude;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function findCircuitForPoint(point: {
  latitude: number;
  longitude: number;
}) {
  return territoryElectoralCircuits.find((circuit) =>
    circuit.boundaries.some((ring) => pointInRing(point, ring)),
  );
}

export const territoryLayers: TerritoryLayer[] = [
  { id: "municipality", label: "Municipio", description: "Límite general de San Fernando", color: "#0A1D3D", enabledByDefault: true },
  { id: "localities", label: "Localidades", description: "Localidades con geometría verificada", color: "#35577c", enabledByDefault: true },
  { id: "streets", label: "Calles", description: "Cartografía vial del mapa base", color: "#94a3b8", enabledByDefault: true },
  { id: "activities", label: "Actividades", description: "Acciones registradas por el equipo", color: "#16a05d", enabledByDefault: true },
  { id: "problems", label: "Reclamos", description: "Situaciones abiertas o en seguimiento", color: "#e5484d", enabledByDefault: true },
  { id: "commitments", label: "Compromisos", description: "Acuerdos y tareas territoriales", color: "#d99a18", enabledByDefault: true },
  { id: "proposals", label: "Propuestas", description: "Propuestas vinculadas al territorio", color: "#2878d0", enabledByDefault: true },
  { id: "documents", label: "Documentos", description: "Documentación territorial relacionada", color: "#8856d8", enabledByDefault: false },
  { id: "institutions", label: "Instituciones", description: "Equipamiento e instituciones públicas", color: "#7b8794", enabledByDefault: true },
  { id: "neighborhoods", label: "Barrios", description: "Barrios con geometría publicada", color: "#71869f", enabledByDefault: true },
  { id: "circuits", label: "Circuitos", description: "Circuitos electorales oficiales de San Fernando", color: "#00BBD4", enabledByDefault: false },
  { id: "photos", label: "Fotografías", description: "Evidencia visual georreferenciada", color: "#2f9e9e", enabledByDefault: false },
  { id: "schools", label: "Escuelas", description: "Establecimientos educativos", color: "#3676a8", enabledByDefault: true },
  { id: "hospitals", label: "Hospitales", description: "Hospitales y clínicas", color: "#5e6e82", enabledByDefault: true },
  { id: "health_centers", label: "CAPS", description: "Centros de atención primaria", color: "#527a78", enabledByDefault: true },
  { id: "clubs", label: "Clubes", description: "Clubes y polideportivos", color: "#607c5b", enabledByDefault: true },
  { id: "firefighters", label: "Bomberos", description: "Cuarteles de bomberos", color: "#8a6570", enabledByDefault: false },
  { id: "police", label: "Policía", description: "Dependencias policiales", color: "#596f8f", enabledByDefault: false },
  { id: "libraries", label: "Bibliotecas", description: "Bibliotecas", color: "#756a91", enabledByDefault: false },
  { id: "cultural_centers", label: "Centros culturales", description: "Equipamiento cultural", color: "#7e6280", enabledByDefault: false },
  { id: "green_spaces", label: "Espacios verdes", description: "Plazas, parques y paseos", color: "#56806a", enabledByDefault: false },
  { id: "neighbors", label: "Vecinos", description: "Personas con ubicación autorizada", color: "#64748b", enabledByDefault: false },
  { id: "custom_markers", label: "Marcadores personalizados", description: "Puntos creados por el equipo", color: "#00BBD4", enabledByDefault: false },
  { id: "heat", label: "Intensidad", description: "Capa preparada para concentración territorial", color: "#f06a3c", enabledByDefault: false },
];

function territorialArea(
  id: string,
  locality: string,
  description: string,
): TerritoryNeighborhood {
  const feature = boundaries.find((item) => item.properties.id === id);
  if (!feature || feature.properties.level === "municipality") {
    throw new Error(`El área ${id} no es una localidad o barrio.`);
  }
  const rawRings = ringsFor(id);
  const areaBoundaries = toPoints(rawRings);
  return {
    id,
    municipioId,
    name: feature.properties.name,
    locality,
    description,
    center: centerOf(rawRings),
    boundary: areaBoundaries[0],
    boundaries: areaBoundaries,
    level: feature.properties.level,
    population: 0,
    generalStatus: "stable",
    indicators: [
      { label: "Cobertura cartográfica", value: "Verificada", context: feature.properties.source },
    ],
    updatedAt,
    source: `${feature.properties.source} · ${feature.properties.sourceUrl}`,
  };
}

export const territoryNeighborhoods: TerritoryNeighborhood[] = [
  territorialArea("localidad-san-fernando", "San Fernando", "Límite publicado de la localidad de San Fernando."),
  territorialArea("localidad-victoria", "Victoria", "Límite publicado de la localidad de Victoria."),
  territorialArea("localidad-virreyes", "Virreyes", "Límite publicado de la localidad de Virreyes."),
  territorialArea("barrio-infico", "San Fernando", "Límite publicado de Barrio Infico."),
];

type FeatureInput = Pick<
  TerritoryFeature,
  "id" | "title" | "subtype" | "description" | "point" | "barrioId" | "localidad"
> & { sourceUrl: string };

function institution(input: FeatureInput): TerritoryFeature {
  const { sourceUrl, ...feature } = input;
  const circuit = findCircuitForPoint(feature.point);
  return {
    ...feature,
    municipioId,
    layerId: "institutions",
    kind: "institution",
    circuitId: circuit?.id,
    occurredAt: updatedAt,
    updatedAt,
    source: `OpenStreetMap · ${sourceUrl}`,
    status: "active",
    participants: [],
    problems: [],
    commitments: [],
    proposals: [],
    documents: [],
    publications: [],
    photos: [],
    videos: [],
    history: [{ at: updatedAt, label: "Ubicación cartográfica revisada" }],
  };
}

// Selección acotada de puntos con coordenadas publicadas en OpenStreetMap.
export const territoryFeatures: TerritoryFeature[] = [
  institution({
    id: "institucion-municipalidad-san-fernando",
    title: "Municipalidad de San Fernando",
    subtype: "Dependencia municipal",
    description: "Sede municipal en la localidad de San Fernando.",
    point: { latitude: -34.4436, longitude: -58.5572 },
    barrioId: "localidad-san-fernando",
    localidad: "San Fernando",
    sourceUrl: "https://www.openstreetmap.org/search?query=Municipalidad%20de%20San%20Fernando",
  }),
  institution({
    id: "institucion-estacion-san-fernando",
    title: "Estación San Fernando C",
    subtype: "Estación de tren",
    description: "Estación ferroviaria del Tren de la Costa.",
    point: { latitude: -34.4442261, longitude: -58.5587749 },
    barrioId: "localidad-san-fernando",
    localidad: "San Fernando",
    sourceUrl: "https://www.openstreetmap.org/node/3448079331",
  }),
  institution({
    id: "institucion-estacion-carupa",
    title: "Estación Carupá",
    subtype: "Estación de tren",
    description: "Estación ferroviaria situada en San Fernando.",
    point: { latitude: -34.4375681, longitude: -58.5673904 },
    barrioId: "localidad-san-fernando",
    localidad: "San Fernando",
    sourceUrl: "https://www.openstreetmap.org/node/3448079320",
  }),
  institution({
    id: "institucion-estacion-victoria",
    title: "Estación Victoria",
    subtype: "Estación de tren",
    description: "Estación ferroviaria de la localidad de Victoria.",
    point: { latitude: -34.4563068, longitude: -58.5409475 },
    barrioId: "localidad-victoria",
    localidad: "Victoria",
    sourceUrl: "https://www.openstreetmap.org/node/3448079334",
  }),
  institution({
    id: "institucion-estacion-virreyes",
    title: "Estación Virreyes",
    subtype: "Estación de tren",
    description: "Estación ferroviaria de la localidad de Virreyes.",
    point: { latitude: -34.4506383, longitude: -58.5507116 },
    barrioId: "localidad-virreyes",
    localidad: "Virreyes",
    sourceUrl: "https://www.openstreetmap.org/node/3448079335",
  }),
  institution({
    id: "institucion-escuela-primaria-6",
    title: "Escuela de Educación Primaria N.º 6 Victoriano E. Montes",
    subtype: "Escuela",
    description: "Establecimiento educativo ubicado en San Fernando.",
    point: { latitude: -34.4443999, longitude: -58.5509978 },
    barrioId: "localidad-san-fernando",
    localidad: "San Fernando",
    sourceUrl: "https://www.openstreetmap.org/node/1142105075",
  }),
  institution({
    id: "institucion-jardin-932",
    title: "Jardín de Infantes N.º 932",
    subtype: "Jardín",
    description: "Establecimiento de nivel inicial ubicado en Virreyes.",
    point: { latitude: -34.4673277, longitude: -58.5927647 },
    barrioId: "localidad-virreyes",
    localidad: "Virreyes",
    sourceUrl: "https://www.openstreetmap.org/node/10235034069",
  }),
  institution({
    id: "institucion-centro-salud-piaggi",
    title: "Centro de Salud Dr. Ítalo Piaggi",
    subtype: "CAPS",
    description: "Centro de atención primaria ubicado en Virreyes.",
    point: { latitude: -34.4726965, longitude: -58.5914456 },
    barrioId: "localidad-virreyes",
    localidad: "Virreyes",
    sourceUrl: "https://www.openstreetmap.org/node/3816396594",
  }),
  institution({
    id: "institucion-plaza-infico",
    title: "Plaza Infico",
    subtype: "Plaza",
    description: "Espacio verde de Barrio Infico.",
    point: { latitude: -34.4485835, longitude: -58.5749914 },
    barrioId: "barrio-infico",
    localidad: "San Fernando",
    sourceUrl: "https://www.openstreetmap.org/way/50825573",
  }),
  institution({
    id: "institucion-plaza-mitre",
    title: "Plaza Bartolomé Mitre",
    subtype: "Plaza",
    description: "Plaza ubicada en la localidad de San Fernando.",
    point: { latitude: -34.4405436, longitude: -58.5580897 },
    barrioId: "localidad-san-fernando",
    localidad: "San Fernando",
    sourceUrl: "https://www.openstreetmap.org/way/259300756",
  }),
  institution({
    id: "institucion-polideportivo-2",
    title: "Polideportivo N.º 2",
    subtype: "Polideportivo",
    description: "Centro deportivo municipal ubicado en Virreyes.",
    point: { latitude: -34.4565882, longitude: -58.581829 },
    barrioId: "localidad-virreyes",
    localidad: "Virreyes",
    sourceUrl: "https://www.openstreetmap.org/way/205615885",
  }),
  institution({
    id: "institucion-club-atletico-tigre",
    title: "Club Atlético Tigre",
    subtype: "Club",
    description: "Institución deportiva ubicada en Victoria.",
    point: { latitude: -34.4493533, longitude: -58.5425701 },
    barrioId: "localidad-victoria",
    localidad: "Victoria",
    sourceUrl: "https://www.openstreetmap.org/way/800927505",
  }),
  institution({
    id: "institucion-costanera-punta-chica",
    title: "Costanera Pública Punta Chica",
    subtype: "Costanera",
    description: "Espacio público costero ubicado en Victoria.",
    point: { latitude: -34.4456584, longitude: -58.5245475 },
    barrioId: "localidad-victoria",
    localidad: "Victoria",
    sourceUrl: "https://www.openstreetmap.org/way/206775934",
  }),
];

export const territoryCategories = [
  "Escuela", "Jardín", "CAPS", "Hospital", "Clínica", "Club", "Plaza", "Paseo",
  "Centro cultural", "Biblioteca", "Iglesia", "Bomberos", "Policía",
  "Dependencia municipal", "Delegación", "Estación de tren", "Centro comercial",
  "Costanera", "Puerto", "Organización", "Sociedad de fomento", "Espacio verde",
  "Punto de interés", "Polideportivo",
] as const;

export const mockTerritorySnapshot: TerritorySnapshot = {
  municipioId,
  municipalityName: "San Fernando",
  center: { latitude: -34.4431, longitude: -58.5579 },
  municipalityBoundaries: toPoints(
    municipalityFeature.geometry.coordinates.map((polygon) => polygon[0]),
  ),
  layers: territoryLayers,
  neighborhoods: territoryNeighborhoods,
  circuits: territoryElectoralCircuits,
  features: territoryFeatures,
  periods: [{ id: "today", label: "Hoy", cutoff: "2026-07-28" }],
};
