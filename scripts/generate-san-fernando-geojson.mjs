import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEPARTMENT_ID = "06749";
const GEOREF_URL = "https://apis.datos.gob.ar/georef/api/v2.0/departamentos.geojson";
const NOMINATIM_URL =
  "https://nominatim.openstreetmap.org/lookup?osm_ids=R1788821,R1788822,R1898365,R3664246&format=geojson&polygon_geojson=1";

async function readJson(url, headers = {}) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`No se pudo descargar ${url}: ${response.status}`);
  return response.json();
}

const [departments, osmBoundaries] = await Promise.all([
  readJson(GEOREF_URL),
  readJson(NOMINATIM_URL, { "User-Agent": "ATIY-territorial-data/1.0" }),
]);

const municipality = departments.features.find(
  (feature) => feature.properties?.id === DEPARTMENT_ID,
);
if (!municipality) throw new Error("Georef no devolvió el Partido de San Fernando.");

const nameByOsmId = {
  1788821: { id: "localidad-victoria", name: "Victoria", level: "locality" },
  1788822: { id: "localidad-virreyes", name: "Virreyes", level: "locality" },
  1898365: { id: "localidad-san-fernando", name: "San Fernando", level: "locality" },
  3664246: { id: "barrio-infico", name: "Barrio Infico", level: "neighborhood" },
};

const features = [
  {
    ...municipality,
    properties: {
      id: "municipio-san-fernando",
      name: "Partido de San Fernando",
      level: "municipality",
      source: "IGN / API Georef",
      sourceUrl: "https://www.argentina.gob.ar/georef",
      license: "Datos públicos de la República Argentina",
      updatedAt: "2026-07-28",
    },
  },
  ...osmBoundaries.features.flatMap((feature) => {
    const osmId = Number(feature.properties?.osm_id);
    const metadata = nameByOsmId[osmId];
    if (!metadata) return [];
    return [{
      type: "Feature",
      geometry: feature.geometry,
      properties: {
        ...metadata,
        source: "OpenStreetMap",
        sourceUrl: `https://www.openstreetmap.org/${feature.properties.osm_type}/${osmId}`,
        license: "ODbL 1.0",
        updatedAt: "2026-07-28",
      },
    }];
  }),
];

const output = {
  type: "FeatureCollection",
  name: "ATIY — Límites territoriales de San Fernando",
  crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  features,
};

const outputDirectory = path.resolve("public", "data");
await mkdir(outputDirectory, { recursive: true });
const serialized = `${JSON.stringify(output)}\n`;
await writeFile(
  path.join(outputDirectory, "san-fernando-boundaries.geojson"),
  serialized,
  "utf8",
);
const sourceDirectory = path.resolve("src", "data");
await mkdir(sourceDirectory, { recursive: true });
await writeFile(
  path.join(sourceDirectory, "san-fernando-boundaries.json"),
  serialized,
  "utf8",
);

console.log(`GeoJSON generado con ${features.length} límites territoriales.`);
