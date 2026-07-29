import { readFile, writeFile } from "node:fs/promises";
import polygonClipping from "polygon-clipping";

const boundaryUrl = new URL("../src/data/san-fernando-boundaries.json", import.meta.url);
const municipalityUrl = new URL("../src/data/san-fernando-municipality-from-circuits.json", import.meta.url);
const outputUrl = new URL("../src/data/san-fernando-territorial-hierarchy.json", import.meta.url);
const publicUrl = new URL("../public/data/san-fernando-territorial-hierarchy.geojson", import.meta.url);

const source = JSON.parse(await readFile(boundaryUrl, "utf8"));
const municipality = JSON.parse(await readFile(municipalityUrl, "utf8")).features[0];
const municipalityGeometry = municipality.geometry.coordinates;

function asMultiPolygon(geometry) {
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

const localityByName = new Map();
const features = [];
for (const feature of source.features.filter((item) => item.properties.level === "locality")) {
  const clipped = polygonClipping.intersection(asMultiPolygon(feature.geometry), municipalityGeometry);
  if (!clipped.length) throw new Error(`La localidad ${feature.properties.name} no intersecta el municipio.`);
  localityByName.set(feature.properties.name, clipped);
  features.push({
    ...feature,
    geometry: { type: "MultiPolygon", coordinates: clipped },
    properties: {
      ...feature.properties,
      derivation: "intersection-with-official-municipality",
      originalGeometryPreservedAt: "src/data/san-fernando-boundaries.json",
      confidence: "verified-derived",
    },
  });
}

for (const feature of source.features.filter((item) => item.properties.level === "neighborhood")) {
  const parentName = feature.properties.name === "Barrio Infico" ? "San Fernando" : undefined;
  const parent = parentName ? localityByName.get(parentName) : municipalityGeometry;
  const clipped = polygonClipping.intersection(asMultiPolygon(feature.geometry), municipalityGeometry, parent);
  if (!clipped.length) throw new Error(`El barrio ${feature.properties.name} no intersecta su contenedor.`);
  features.push({
    ...feature,
    geometry: { type: "MultiPolygon", coordinates: clipped },
    properties: {
      ...feature.properties,
      parentLocality: parentName,
      derivation: "intersection-with-parent-and-municipality",
      originalGeometryPreservedAt: "src/data/san-fernando-boundaries.json",
      confidence: "verified-derived",
    },
  });
}

const output = {
  type: "FeatureCollection",
  name: "ATIY — Jerarquía territorial contenida de San Fernando",
  properties: {
    crs: "EPSG:4326",
    municipalitySource: municipality.properties.source,
    generatedBy: "deterministic-topology-intersection",
  },
  features,
};

await writeFile(outputUrl, `${JSON.stringify(output)}\n`, "utf8");
await writeFile(publicUrl, `${JSON.stringify(output)}\n`, "utf8");
process.stdout.write(`Jerarquía territorial generada: ${features.length} geometrías contenidas.\n`);
