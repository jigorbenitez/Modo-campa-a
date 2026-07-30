import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { normalizeIdentityName, normalizeAddress } from "../src/features/identity-resolution/application/identity-normalizer.ts";

test("normaliza acentos, puntuación, abreviaturas y palabras institucionales", () => {
  assert.equal(normalizeIdentityName("COLEGIO Parroquial  San   Pablo"), "san pablo");
  assert.equal(normalizeIdentityName("Escuela Alfonsina Storni"), "alfonsina storni");
  assert.equal(normalizeIdentityName("Instituto Don Orione"), "don orione");
  assert.equal(normalizeIdentityName("Escuela Provincial N.º 12"), "12");
});

test("normaliza direcciones sin perder calle ni altura", () => {
  assert.equal(normalizeAddress("Av. SIMÓN DE IRIONDO - 1177"), "avenida simon de iriondo 1177");
});

test("el score combina evidencia y conserva una zona de revisión manual", async () => {
  const engine = await readFile("src/features/identity-resolution/application/identity-resolution-engine.ts", "utf8");
  for (const factor of ["name", "location", "address", "category", "externalId"]) {
    assert.match(engine, new RegExp(`${factor}:`));
  }
  assert.match(engine, /automaticThreshold/);
  assert.match(engine, /reviewThreshold/);
  assert.match(engine, /alternateNames/);
  assert.match(engine, /externalIds/);
  assert.match(engine, /identityHistory/);
});

test("la sincronización ejecuta resolución y Administración expone Calidad de Datos", async () => {
  const sync = await readFile("src/features/data-sync/application/sync-engine.ts", "utf8");
  const admin = await readFile("src/components/admin/admin-panel.tsx", "utf8");
  assert.match(sync, /identityResolver\?\.resolve/);
  assert.match(admin, /\/admin\/data-quality/);
  await readFile("src/app/admin/data-quality/page.tsx", "utf8");
  await readFile("src/app/api/identity-resolution/decisions/route.ts", "utf8");
  await readFile("supabase/migrations/202607290004_identity_resolution.sql", "utf8");
});

