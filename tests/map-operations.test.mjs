import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("los circuitos se renderizan con límites continuos", async () => {
  const source = await readFile(new URL("src/components/territory/territory-map.tsx", root), "utf8");
  const circuitBlock = source.slice(source.indexOf("view.visibleCircuits"), source.indexOf("view.heatPoints"));
  assert.equal(circuitBlock.includes("dashArray"), false);
  assert.match(circuitBlock, /weight:/);
});

test("el administrador ofrece las capas operativas solicitadas", async () => {
  const source = await readFile(new URL("src/data/territorial-base.ts", root), "utf8");
  for (const id of ["municipality", "localities", "neighborhoods", "circuits", "streets", "schools", "hospitals", "health_centers", "clubs", "firefighters", "police", "libraries", "cultural_centers", "green_spaces", "institutions", "activities", "neighbors", "proposals", "commitments", "photos", "custom_markers"]) {
    assert.match(source, new RegExp(`id: "${id}"`));
  }
});

test("la preferencia de capas usa almacenamiento versionado", async () => {
  const source = await readFile(new URL("src/components/territory/territory-operations.tsx", root), "utf8");
  assert.match(source, /atiy:territory:layers:v1/);
  assert.match(source, /localStorage\.setItem\(LAYERS_STORAGE_KEY/);
});
