import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const boundaryUrl = new URL(
  "../public/data/san-fernando-boundaries.geojson",
  import.meta.url,
);
const circuitsUrl = new URL(
  "../public/data/san-fernando-electoral-circuits.geojson",
  import.meta.url,
);
const municipalityUrl = new URL(
  "../public/data/san-fernando-municipality-from-circuits.geojson",
  import.meta.url,
);

async function readBoundaries() {
  return JSON.parse(await readFile(boundaryUrl, "utf8"));
}

async function readCircuits() {
  return JSON.parse(await readFile(circuitsUrl, "utf8"));
}

test("la base cartográfica separa municipio disuelto de localidades y barrios", async () => {
  const collection = await readBoundaries();
  const levels = new Set(
    collection.features.map((feature) => feature.properties.level),
  );

  assert.equal(collection.type, "FeatureCollection");
  assert.equal(levels.has("municipality"), false);
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
  assert.equal(ids.includes("municipio-san-fernando"), false);
  assert.ok(ids.includes("localidad-san-fernando"));
  assert.ok(ids.includes("localidad-victoria"));
  assert.ok(ids.includes("localidad-virreyes"));
  assert.ok(ids.includes("barrio-infico"));
});

test("el municipio es la disolución topológica de los 16 circuitos", async () => {
  const collection = JSON.parse(await readFile(municipalityUrl, "utf8"));
  const feature = collection.features[0];
  assert.equal(feature.properties.derivation, "union-dissolve");
  assert.equal(feature.properties.circuitCount, 16);
  assert.equal(feature.properties.topology.allRingsClosed, true);
  assert.equal(feature.properties.topology.interiorRings, 0);
  assert.ok(feature.properties.topology.overlapRatio < 0.00002);
  assert.equal(feature.geometry.type, "MultiPolygon");
  for (const polygon of feature.geometry.coordinates) {
    for (const ring of polygon) assert.deepEqual(ring[0], ring.at(-1));
  }
});

test("integra los 16 circuitos oficiales de San Fernando", async () => {
  const collection = await readCircuits();
  const codes = collection.features.map((feature) => feature.properties.code);

  assert.equal(collection.type, "FeatureCollection");
  assert.equal(collection.features.length, 16);
  assert.equal(new Set(codes).size, 16);
  assert.deepEqual(codes, [
    "0872",
    "0873",
    "0874",
    "0875",
    "0876",
    "0877",
    "0878",
    "0878A",
    "0879",
    "0879A",
    "0880",
    "0880A",
    "0880B",
    "0881",
    "0882",
    "0882A",
  ]);
});

test("cada circuito conserva geometría y atribución oficial", async () => {
  const collection = await readCircuits();

  for (const feature of collection.features) {
    assert.equal(feature.geometry.type, "MultiPolygon");
    assert.ok(feature.geometry.coordinates.length > 0);
    assert.equal(feature.properties.municipality, "San Fernando");
    assert.equal(feature.properties.license, "CC BY 4.0");
    assert.match(feature.properties.source, /Cámara Nacional Electoral/);
    assert.match(feature.properties.sourceUrl, /^https:\/\//);
  }
});
