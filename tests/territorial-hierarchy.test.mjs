import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import polygonClipping from "polygon-clipping";

const hierarchy = JSON.parse(await readFile(new URL("../src/data/san-fernando-territorial-hierarchy.json", import.meta.url), "utf8"));
const municipality = JSON.parse(await readFile(new URL("../src/data/san-fernando-municipality-from-circuits.json", import.meta.url), "utf8")).features[0];

function asMultiPolygon(geometry) {
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

test("todas las localidades y barrios están contenidos por el municipio", () => {
  for (const feature of hierarchy.features) {
    const outside = polygonClipping.difference(asMultiPolygon(feature.geometry), municipality.geometry.coordinates);
    assert.equal(outside.length, 0, `${feature.properties.id} sobresale del municipio`);
    assert.match(feature.properties.derivation, /^intersection-with-/);
    assert.equal(feature.properties.confidence, "verified-derived");
  }
});

test("la jerarquía declara CRS y preserva el origen sin modificarlo", () => {
  assert.equal(hierarchy.properties.crs, "EPSG:4326");
  assert.equal(hierarchy.properties.generatedBy, "deterministic-topology-intersection");
  for (const feature of hierarchy.features) {
    assert.equal(feature.properties.originalGeometryPreservedAt, "src/data/san-fernando-boundaries.json");
    assert.match(feature.properties.sourceUrl, /^https:\/\//);
  }
});
