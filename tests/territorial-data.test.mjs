import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const boundaryUrl = new URL(
  "../public/data/san-fernando-boundaries.geojson",
  import.meta.url,
);

async function readBoundaries() {
  return JSON.parse(await readFile(boundaryUrl, "utf8"));
}

test("la base cartográfica contiene municipio, localidades y barrio con fuente", async () => {
  const collection = await readBoundaries();
  const levels = new Set(
    collection.features.map((feature) => feature.properties.level),
  );

  assert.equal(collection.type, "FeatureCollection");
  assert.ok(levels.has("municipality"));
  assert.ok(levels.has("locality"));
  assert.ok(levels.has("neighborhood"));

  for (const feature of collection.features) {
    assert.match(feature.properties.sourceUrl, /^https:\/\//);
    assert.ok(feature.properties.source.length > 3);
    assert.ok(["Polygon", "MultiPolygon"].includes(feature.geometry.type));
    assert.ok(feature.geometry.coordinates.length > 0);
  }
});

test("todos los límites tienen identificadores únicos y trazables", async () => {
  const collection = await readBoundaries();
  const ids = collection.features.map((feature) => feature.properties.id);

  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes("municipio-san-fernando"));
  assert.ok(ids.includes("localidad-san-fernando"));
  assert.ok(ids.includes("localidad-victoria"));
  assert.ok(ids.includes("localidad-virreyes"));
  assert.ok(ids.includes("barrio-infico"));
});
