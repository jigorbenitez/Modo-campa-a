import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("la navegación principal contiene exactamente ocho centros de trabajo", async () => {
  const source = await readFile(new URL("src/data/navigation.ts", root), "utf8");
  const entries = [...source.matchAll(/\{ href:/g)];
  assert.equal(entries.length, 8);
  for (const label of ["Dashboard", "Centro Operativo", "Recorridas", "Territorio", "Inteligencia", "Relaciones", "Agenda", "Administración"]) assert.match(source, new RegExp(`label: "${label}"`));
});

test("las nuevas entidades públicas cruzan fuente oficial y cartográfica", async () => {
  const registry = JSON.parse(await readFile(new URL("src/data/san-fernando-official-sync.json", root), "utf8"));
  const entities = registry.records.filter((record) => ["hospital", "club", "point_of_interest"].includes(record.category));
  assert.ok(entities.length > 0);
  for (const entity of entities) {
    assert.match(entity.sourceUrl, /^https:\/\//);
    assert.ok(entity.source);
    assert.ok(entity.license);
  }
});
