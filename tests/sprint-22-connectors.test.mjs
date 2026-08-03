import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ArcGisRestConnector,
  GeoRefConnector,
  IgnConnector,
  OpenStreetMapConnector,
  officialTerritorialConnectors,
} from "../src/features/data-sync/infrastructure/connectors.ts";

const selection = {
  municipalityId: "municipio-san-fernando",
  municipalityName: "San Fernando",
  provinceId: "06",
  provinceName: "Buenos Aires",
  bounds: [-58.65, -34.52, -58.45, -34.37],
};

test("el registro oficial conserva las familias requeridas y suma salud bonaerense", () => {
  const ids = officialTerritorialConnectors().map((connector) => connector.id);
  assert.deepEqual(ids, [
    "georef-argentina",
    "buenos-aires-open-data",
    "buenos-aires-health-data",
    "datos-argentina-ckan",
    "ckan-compatible",
    "arcgis-rest",
    "ign-official-download",
    "openstreetmap-overpass",
    "atiy-verified-territorial-cache",
  ]);
});

test("GeoRef, ArcGIS, IGN y Overpass descubren recursos públicos trazables", async () => {
  const discovered = (
    await Promise.all([
      new GeoRefConnector().discover(selection),
      new ArcGisRestConnector().discover(selection),
      new IgnConnector().discover(selection),
      new OpenStreetMapConnector().discover(selection),
    ])
  ).flat();
  assert.equal(discovered.length, 5);
  for (const dataset of discovered) {
    assert.match(dataset.downloadUrl, /^https:\/\//);
    assert.ok(dataset.publisher);
    assert.ok(dataset.license);
    assert.ok(dataset.sourcePageUrl);
  }
  assert.match(discovered.find((item) => item.connectorId === "arcgis-rest").downloadUrl, /NAM%3D/);
  assert.match(discovered.find((item) => item.connectorId === "openstreetmap-overpass").downloadUrl, /interpreter/);
});

test("la primera sincronización real es reproducible y conserva trazabilidad", async () => {
  const artifact = JSON.parse(await readFile(
    new URL("../src/data/san-fernando-official-sync.json", import.meta.url),
    "utf8",
  ));
  assert.equal(artifact.municipality.name, "San Fernando");
  assert.equal(artifact.validation.coordinateSystem, "EPSG:4326");
  assert.equal(artifact.validation.containedInMunicipality, true);
  assert.ok(artifact.records.length > 0);
  assert.ok(artifact.counts.municipality >= 1);
  assert.ok(artifact.counts.locality >= 1);
  assert.ok(artifact.counts.school >= 1);
  assert.ok(artifact.sources.some((source) => source.id === "pba-education" && source.status === "ok"));
  assert.ok(artifact.sources.some((source) => source.id === "osm-overpass" && source.status === "ok"));
  for (const record of artifact.records) {
    assert.ok(Number.isFinite(record.latitude));
    assert.ok(Number.isFinite(record.longitude));
    assert.ok(record.sourceUrl);
    assert.ok(record.license);
  }
});
