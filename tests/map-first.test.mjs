import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const operations = fs.readFileSync(new URL("../src/components/territory/territory-operations.tsx", import.meta.url), "utf8");
const modes = fs.readFileSync(new URL("../src/components/territory/map-mode-switcher.tsx", import.meta.url), "utf8");
const map = fs.readFileSync(new URL("../src/components/territory/territory-map.tsx", import.meta.url), "utf8");

test("el territorio usa una composición map-first de pantalla completa", () => {
  assert.match(operations, /100dvh-4rem/);
  assert.doesNotMatch(operations, /lg:grid-cols-\[minmax\(0,1fr\)_360px\]/);
  assert.match(operations, /contextPanelOpen/);
});

test("los paneles secundarios solo se montan cuando están activos", () => {
  for (const panel of ["metrics", "layers", "gis", "history", "legend"]) {
    assert.match(operations, new RegExp(`activePanel === "${panel}"`));
  }
});

test("cada modo cartográfico define un conjunto limitado de capas", () => {
  for (const mode of ["territorial", "electoral", "institutional", "operational"]) {
    assert.match(modes, new RegExp(`${mode}:`));
  }
  assert.match(modes, /municipality/);
});

test("la jerarquía visual diferencia municipio, localidades, barrios y circuitos", () => {
  assert.match(map, /weight: 4/);
  assert.match(map, /neighborhood\.level === "locality" \? 1\.4 : 0\.8/);
  assert.match(map, /selectedCircuitIds\.has\(circuit\.id\).*2\.5 : 0\.8/s);
});
