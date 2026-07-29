import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
const registry = JSON.parse(await readFile(
  new URL("../src/data/san-fernando-official-sync.json", import.meta.url),
  "utf8",
));
const verifiedTerritorialEntities = [...new Map(
  registry.records.map((entity) => [entity.id, entity]),
).values()];

async function sourceFiles(directory) {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry);
    if ((await stat(path)).isDirectory()) files.push(...await sourceFiles(path));
    else if (/\.(ts|tsx)$/.test(path)) files.push(path);
  }
  return files;
}

test("el repositorio territorial devuelve identificadores únicos sin colapsar sedes homónimas", async () => {
  assert.equal(new Set(verifiedTerritorialEntities.map((entity) => entity.id)).size, verifiedTerritorialEntities.length);
});

test("todas las entidades canónicas tienen coordenadas, fuente, licencia y ficha resoluble", async () => {
  for (const entity of verifiedTerritorialEntities) {
    assert.ok(Number.isFinite(entity.latitude));
    assert.ok(Number.isFinite(entity.longitude));
    assert.equal(typeof entity.source, "string");
    assert.equal(typeof entity.sourceUrl, "string");
    assert.equal(typeof entity.license, "string");
  }
});

test("Mapa, búsqueda, territorio, relaciones, inteligencia, dashboard y diario consumen el proveedor canónico", async () => {
  const clientConsumers = [
    "src/components/territory/territory-operations.tsx",
    "src/components/layout/command-palette.tsx",
    "src/components/relationships/relationship-explorer.tsx",
    "src/components/intelligence/intelligence-center.tsx",
    "src/components/dashboard/dashboard.tsx",
    "src/components/diary/campaign-diary.tsx",
  ];
  for (const path of clientConsumers) {
    const content = await readFile(path, "utf8");
    assert.match(content, /useTerritorialEntit/);
  }
  const directory = await readFile("src/features/territorial-engine/presentation/territorial-directory.tsx", "utf8");
  const directoryPage = await readFile("src/app/territorio/entidades/page.tsx", "utf8");
  assert.match(directory, /entities: TerritorialEntity\[\]/);
  assert.match(directoryPage, /createTerritorialEntityRepository/);
});

test("no quedan imports ni archivos de mocks en la aplicación", async () => {
  const files = await sourceFiles("src");
  const mockFiles = files.filter((path) => path.includes(`${join("src", "mock")}`));
  assert.deepEqual(mockFiles, []);
  for (const file of files) {
    const content = await readFile(file, "utf8");
    assert.doesNotMatch(content, /@\/mock|mockTerritorySnapshot|mockKnowledgeSnapshot/);
  }
});

test("la búsqueda conserva las categorías operativas solicitadas", async () => {
  const labels = await readFile("src/features/territorial-engine/presentation/territorial-presentation-config.ts", "utf8");
  for (const term of ["Escuela", "Hospital", "CAPS", "Club", "Plaza"]) assert.match(labels, new RegExp(term));
});

test("Inteligencia abre la ficha original y nunca inicia una recorrida", async () => {
  const intelligence = await readFile("src/components/intelligence/intelligence-center.tsx", "utf8");
  assert.match(intelligence, /Abrir registro/);
  assert.match(intelligence, /\/territorio\/entidades\//);
  assert.doesNotMatch(intelligence, /href="\/recorrido"/);
});
