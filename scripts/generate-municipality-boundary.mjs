import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";
import polygonClipping from "polygon-clipping";

const inputUrl = new URL("../src/data/san-fernando-electoral-circuits.json", import.meta.url);
const outputUrl = new URL("../src/data/san-fernando-municipality-from-circuits.json", import.meta.url);
const publicOutputUrl = new URL("../public/data/san-fernando-municipality-from-circuits.geojson", import.meta.url);
const source = JSON.parse(await readFile(inputUrl, "utf8"));

const geometries = source.features.map((feature) => feature.geometry.coordinates);
if (!geometries.length) throw new Error("No hay circuitos para disolver.");

const union = polygonClipping.union(...geometries);
if (!union.length) throw new Error("La disolución no produjo una geometría.");

function signedArea(ring) {
  return ring.slice(1).reduce(
    (sum, point, index) =>
      sum +
      ring[index][0] * point[1] -
      point[0] * ring[index][1],
    0,
  ) / 2;
}

function multiPolygonArea(multiPolygon) {
  return multiPolygon.reduce(
    (total, polygon) =>
      total +
      polygon.reduce(
        (polygonArea, ring, index) =>
          polygonArea + (index === 0 ? Math.abs(signedArea(ring)) : -Math.abs(signedArea(ring))),
        0,
      ),
    0,
  );
}

for (const [polygonIndex, polygon] of union.entries()) {
  for (const [ringIndex, ring] of polygon.entries()) {
    const first = ring[0];
    const last = ring.at(-1);
    if (!last || first[0] !== last[0] || first[1] !== last[1]) {
      throw new Error(`Anillo abierto en polígono ${polygonIndex}, anillo ${ringIndex}.`);
    }
  }
}

const sourceArea = geometries.reduce((sum, geometry) => sum + multiPolygonArea(geometry), 0);
const unionArea = multiPolygonArea(union);
const overlapRatio = Math.max(0, (sourceArea - unionArea) / unionArea);
const interiorRings = union.reduce((sum, polygon) => sum + Math.max(0, polygon.length - 1), 0);

const output = {
  type: "FeatureCollection",
  name: "ATIY — Límite municipal derivado de circuitos electorales",
  features: [
    {
      type: "Feature",
      geometry: { type: "MultiPolygon", coordinates: union },
      properties: {
        id: "municipio-san-fernando",
        name: "Partido de San Fernando",
        level: "municipality",
        derivation: "union-dissolve",
        source: source.features[0]?.properties.source,
        sourceUrl: source.features[0]?.properties.sourceUrl,
        license: source.features[0]?.properties.license,
        circuitCount: source.features.length,
        topology: {
          polygonCount: union.length,
          interiorRings,
          overlapRatio,
          allRingsClosed: true,
        },
      },
    },
  ],
};

await writeFile(outputUrl, `${JSON.stringify(output)}\n`, "utf8");
await writeFile(publicOutputUrl, `${JSON.stringify(output)}\n`, "utf8");
process.stdout.write(
  `Límite generado: ${source.features.length} circuitos, ${union.length} polígonos, ${interiorRings} anillos interiores, superposición relativa ${overlapRatio.toExponential(3)}.\n`,
);
