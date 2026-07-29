import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const sourcePath = process.argv[2];
if (!sourcePath) {
  throw new Error(
    "Uso: node scripts/generate-san-fernando-circuits.mjs <circuitos-electorales-pba.geojson>",
  );
}

const sourceUrl =
  "https://catalogo.datos.gba.gob.ar/dataset/circuitos-electorales";
const resourceUrl =
  "https://catalogo.datos.gba.gob.ar/dataset/4fe68b69-c788-4c06-ac67-26e4ebc7416b/resource/37bd466c-4a80-4e2e-be11-a68cfe60aa1e/download/circuitos-electorales-pba.zip";

const source = JSON.parse(await readFile(resolve(sourcePath), "utf8"));
const features = source.features
  .filter(
    (feature) =>
      feature.properties?.provincia === "Buenos Aires" &&
      feature.properties?.departamen === "San Fernando",
  )
  .map((feature) => {
    const code = String(feature.properties.circuito);
    return {
      type: "Feature",
      geometry: feature.geometry,
      properties: {
        id: `circuito-${code}`,
        code,
        name: `Circuito ${Number.parseInt(code, 10)}${code.match(/[A-Z]+$/)?.[0] ?? ""}`,
        municipality: "San Fernando",
        headTown: feature.properties.cabecera,
        district: feature.properties.distrito,
        source:
          "Poder Judicial de la Nación · Justicia Nacional Electoral · Cámara Nacional Electoral",
        sourceUrl,
        resourceUrl,
        license: "CC BY 4.0",
        updatedAt: "2026-03-12",
      },
    };
  })
  .sort((left, right) =>
    left.properties.code.localeCompare(right.properties.code, "es-AR", {
      numeric: true,
    }),
  );

if (features.length !== 16) {
  throw new Error(
    `Se esperaban 16 circuitos oficiales de San Fernando y se encontraron ${features.length}.`,
  );
}

const collection = {
  type: "FeatureCollection",
  name: "ATIY — Circuitos electorales oficiales de San Fernando",
  crs: {
    type: "name",
    properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
  },
  metadata: {
    source: sourceUrl,
    resource: resourceUrl,
    license: "CC BY 4.0",
    attribution:
      "Poder Judicial de la Nación · Justicia Nacional Electoral · Cámara Nacional Electoral",
    generatedAt: new Date().toISOString(),
  },
  features,
};

const serialized = `${JSON.stringify(collection)}\n`;
await Promise.all([
  writeFile(
    resolve("public/data/san-fernando-electoral-circuits.geojson"),
    serialized,
    "utf8",
  ),
  writeFile(
    resolve("src/data/san-fernando-electoral-circuits.json"),
    serialized,
    "utf8",
  ),
]);

console.log(`GeoJSON generado con ${features.length} circuitos oficiales.`);
