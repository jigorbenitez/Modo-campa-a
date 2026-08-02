import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { categoryLabel, categorySearchTerms, territorialTaxonomy } from "../src/features/territorial-quality/domain/taxonomy.ts";

test("la taxonomía territorial es única y no confunde club con polideportivo", () => {
  assert.equal(categoryLabel("sport_club"), "Club");
  assert.equal(categoryLabel("sport_sports_center"), "Polideportivo");
  assert.match(categorySearchTerms("sport_sports_center"), /polideportivos/);
  assert.doesNotMatch(categorySearchTerms("sport_sports_center").toLocaleLowerCase("es-AR"), /club/);
  assert.ok(Object.keys(territorialTaxonomy).length >= 25);
});

test("el clasificador prioriza Polideportivo antes que la categoría fuente club", async () => {
  const classifier = await readFile("src/features/territorial-quality/application/classification-engine.ts", "utf8");
  assert.ok(classifier.indexOf('category: "sport_sports_center"') < classifier.indexOf('category: "sport_club"'));
  assert.match(classifier, /nameOnly: true/);
  assert.match(classifier, /sourceCategory/);
  assert.match(classifier, /classification/);
});

test("la auditoría cubre completitud, unicidad, validez y clasificación", async () => {
  const audit = await readFile("src/features/territorial-quality/application/audit-service.ts", "utf8");
  for (const issue of ["duplicate", "name", "classification", "coordinates", "outside", "address", "source", "category"]) assert.match(audit, new RegExp(`\\"${issue}\\"`));
  assert.match(audit, /qualityScore/);
  assert.match(audit, /expected: null/);
});

test("Administración permite aprobar y rechazar sugerencias con auditoría RLS", async () => {
  const screen = await readFile("src/features/identity-resolution/presentation/data-quality-screen.tsx", "utf8");
  const migration = await readFile("supabase/migrations/202608010001_sprint_24_quality.sql", "utf8");
  assert.match(screen, /Aprobar cambio/);
  assert.match(screen, /Rechazar/);
  assert.match(screen, /Cobertura del Municipio/);
  assert.match(migration, /enable row level security/);
});

