import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeTerritorySelection } from "../src/features/territorio-map/application/territory-selection-state.ts";

const feature = {
  id: "station",
  layerId: "institutions",
  barrioId: "victoria",
  occurredAt: "2026-07-27T00:00:00.000Z",
};

test("conserva una selección territorial válida", () => {
  assert.deepEqual(
    sanitizeTerritorySelection(
      { neighborhoodId: "victoria", featureId: "station" },
      [feature],
      new Set(["victoria"]),
      new Set(["institutions"]),
      "2026-07-27",
    ),
    { neighborhoodId: "victoria", featureId: "station" },
  );
});

test("descarta el marcador cuando su capa se desactiva", () => {
  assert.deepEqual(
    sanitizeTerritorySelection(
      { neighborhoodId: "victoria", featureId: "station" },
      [feature],
      new Set(["victoria"]),
      new Set(),
      "2026-07-27",
    ),
    { neighborhoodId: "victoria" },
  );
});

test("descarta referencias a marcadores y barrios inexistentes", () => {
  assert.deepEqual(
    sanitizeTerritorySelection(
      { neighborhoodId: "removed", featureId: "removed" },
      [feature],
      new Set(["victoria"]),
      new Set(["institutions"]),
      "2026-07-27",
    ),
    {},
  );
});

test("descarta un marcador posterior al período seleccionado", () => {
  assert.deepEqual(
    sanitizeTerritorySelection(
      { neighborhoodId: "victoria", featureId: "station" },
      [feature],
      new Set(["victoria"]),
      new Set(["institutions"]),
      "2026-06-30",
    ),
    { neighborhoodId: "victoria" },
  );
});
