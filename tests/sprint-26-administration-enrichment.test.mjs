import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const artifact = JSON.parse(await read("src/data/san-fernando-official-sync.json"));

test("Administración conserva la ruta y muestra un estado explícito sin permiso", async () => {
  const page = await read("src/app/admin/page.tsx");
  assert.match(page, /Tu rol no tiene acceso administrativo/);
  assert.doesNotMatch(page, /!canUser[\s\S]{0,100}redirect\(/);
  assert.match(page, /return <AdminPanel/);
});

test("Ayuda y comentarios genera reportes locales completos y exportables", async () => {
  const [panel, admin] = await Promise.all([
    read("src/components/admin/feedback-panel.tsx"),
    read("src/components/admin/admin-panel.tsx"),
  ]);
  for (const value of ["Reportar error", "Enviar sugerencia", "Informar institución faltante", "Informar dato incorrecto"]) assert.match(panel, new RegExp(value));
  for (const field of ["type", "description", "page", "createdAt", "user", "atiyVersion"]) assert.match(panel, new RegExp(field));
  assert.match(panel, /navigator\.clipboard\.writeText/);
  assert.match(panel, /application\/json/);
  assert.match(panel, /Generar borrador/);
  assert.doesNotMatch(panel, /supabase|fetch\(/i);
  assert.match(admin, /<FeedbackPanel/);
});

test("la sincronización incorpora el padrón sanitario 2025 y amplía capas OSM verificables", async () => {
  const [connectors, script] = await Promise.all([
    read("src/features/data-sync/infrastructure/connectors.ts"),
    read("scripts/sync-san-fernando-public-data.mjs"),
  ]);
  assert.match(connectors, /BuenosAiresHealthConnector/);
  assert.match(connectors, /boundary\"=\"protected_area/);
  assert.match(script, /pba-health-2025/);
  assert.match(script, /delimiter/);
  const health = artifact.sources.find((source) => source.id === "pba-health-2025");
  assert.equal(health.status, "ok");
  assert.ok(health.imported >= 30);
});

test("las fichas preservan contacto, alias, fuente, licencia, actualización y metadatos", async () => {
  const [repository, detail, enrichment] = await Promise.all([
    read("src/features/territorial-engine/infrastructure/verified-territorial-repository.ts"),
    read("src/features/territorial-engine/presentation/territorial-entity-detail.tsx"),
    read("src/features/territorial-enrichment/application/public-metadata-provider.ts"),
  ]);
  for (const token of ["alternateNames", "sources:", "sourceUpdatedAt", "responsibleOrganization", "openingHours"]) assert.match(repository, new RegExp(token));
  assert.match(detail, /Abrir fuente pública/);
  assert.match(detail, /Última actualización de fuente/);
  assert.match(enrichment, /Metadatos originales preservados/);
});

test("la taxonomía distingue equipamiento comunitario y oficinas públicas", async () => {
  const taxonomy = await read("src/features/territorial-quality/domain/taxonomy.ts");
  for (const category of ["community_library", "community_cultural_center", "community_senior_center", "organization_neighborhood_association", "government_provincial_office", "government_national_office", "public_reserve"]) assert.match(taxonomy, new RegExp(category));
});
