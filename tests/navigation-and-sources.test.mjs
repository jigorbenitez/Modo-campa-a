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
  const source = await readFile(new URL("src/mock/territorio-map.mock.ts", root), "utf8");
  for (const id of ["institucion-hospital-san-cayetano", "institucion-polideportivo-1", "institucion-palacio-belgrano-otamendi"]) {
    const start = source.indexOf(`id: "${id}"`);
    assert.ok(start >= 0);
    const record = source.slice(start, source.indexOf("}),", start));
    assert.match(record, /officialSourceUrl: "https:\/\/www\.sanfernando\.gob\.ar\//);
    assert.match(record, /sourceUrl: "https:\/\/www\.openstreetmap\.org\//);
  }
});
