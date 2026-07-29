import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { calculateDelta, TerritorialDataSyncEngine } from "../src/features/data-sync/application/sync-engine.ts";
import { CsvParser, GeoJsonParser } from "../src/features/data-sync/infrastructure/parsers.ts";

const dataset = {
  id: "public-schools",
  connectorId: "test",
  name: "Escuelas",
  category: "school",
  downloadUrl: "https://public.example/schools.geojson",
  sourcePageUrl: "https://public.example/dataset",
  publisher: "Organismo público",
  license: "CC BY 4.0",
  format: "geojson",
  version: "2026-07-29",
  confidence: "verified",
};

function feature(id, fingerprint) {
  return {
    externalId: id,
    category: "school",
    name: `Escuela ${id}`,
    geometry: { type: "Point", coordinates: [-58.5, -34.4] },
    properties: {},
    sourceDatasetId: dataset.id,
    fingerprint,
  };
}

test("el delta incremental es determinístico y distingue altas, cambios y bajas", () => {
  const delta = calculateDelta(
    [feature("1", "a"), feature("2", "b"), feature("4", "d")],
    [feature("1", "a"), feature("2", "c"), feature("3", "e")],
  );
  assert.deepEqual(delta.added.map((item) => item.externalId), ["3"]);
  assert.deepEqual(delta.updated.map((item) => item.externalId), ["2"]);
  assert.deepEqual(delta.removed.map((item) => item.externalId), ["4"]);
  assert.equal(delta.unchanged, 1);
});

test("GeoJSON rechaza recursos que no sean FeatureCollection", async () => {
  const parser = new GeoJsonParser();
  const bytes = new TextEncoder().encode(JSON.stringify({ type: "Feature" })).buffer;
  await assert.rejects(() => parser.parse(bytes, dataset), /FeatureCollection/);
});

test("CSV conserva solo puntos con coordenadas válidas para la validación posterior", async () => {
  const parser = new CsvParser();
  const bytes = new TextEncoder().encode("id,nombre,latitud,longitud\n1,Escuela,-34.4,-58.5\n2,Sin punto,,").buffer;
  const parsed = await parser.parse(bytes, { ...dataset, format: "csv" });
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].geometry.type, "Point");
  assert.equal(parsed[1].geometry, null);
});

test("el motor reintenta, filtra, deduplica y persiste solamente el delta", async () => {
  let attempts = 0;
  let savedRun;
  let applied;
  const repository = {
    async getLatestVersion() { return { features: [feature("1", "old")] }; },
    async saveVersion(version) { assert.equal(version.features.length, 1); },
    async applyChanges(_municipalityId, features, removedIds) { applied = { features, removedIds }; },
    async saveRun(run) { savedRun = run; },
    async listRuns() { return []; },
  };
  const connector = { id: "test", async discover() { return [dataset]; } };
  const downloader = {
    async download() {
      attempts += 1;
      if (attempts < 2) throw new Error("temporal");
      return new TextEncoder().encode(JSON.stringify({
        type: "FeatureCollection",
        features: [
          { id: "1", properties: { name: "Escuela actualizada" }, geometry: { type: "Point", coordinates: [-58.5, -34.4] } },
          { id: "1-duplicate", properties: { name: "Escuela actualizada" }, geometry: { type: "Point", coordinates: [-58.5, -34.4] } },
        ],
      })).buffer;
    },
  };
  const filter = { async filter(features) { return [features[0], features[0]]; } };
  const engine = new TerritorialDataSyncEngine(
    [connector], downloader, [new GeoJsonParser()], filter, repository,
    () => new Date("2026-07-29T12:00:00.000Z"),
  );
  const run = await engine.synchronize({
    municipalityId: "m1", municipalityName: "Municipio", provinceId: "06", provinceName: "Buenos Aires",
  });
  assert.equal(attempts, 2);
  assert.equal(run.status, "completed");
  assert.equal(applied.features.length, 1);
  assert.equal(savedRun.id, run.id);
});

test("los formatos binarios y KML tienen adaptadores reales y GeoPackage queda aislado en servidor", async () => {
  const parsers = await readFile(new URL("../src/features/data-sync/infrastructure/parsers.ts", import.meta.url), "utf8");
  const geopackage = await readFile(new URL("../src/features/data-sync/infrastructure/geopackage-parser.server.ts", import.meta.url), "utf8");
  const route = await readFile(new URL("../src/app/api/territorial-import/geopackage/route.ts", import.meta.url), "utf8");
  assert.match(parsers, /import\("shpjs"\)/);
  assert.match(parsers, /kml\(document\)/);
  assert.match(geopackage, /GeoPackageAPI\.open/);
  assert.match(geopackage, /server-only/);
  assert.match(route, /50 \* 1024 \* 1024/);
});

test("la persistencia de sincronización aplica RLS multi-municipio", async () => {
  const migration = await readFile(new URL("../supabase/migrations/202607290002_data_sync_engine.sql", import.meta.url), "utf8");
  assert.match(migration, /territorial_dataset_versions/);
  assert.match(migration, /territorial_sync_schedules/);
  assert.match(migration, /has_membership\(municipality_id\)/);
  assert.match(migration, /has_permission\(municipality_id, 'territory:write'\)/);
});
