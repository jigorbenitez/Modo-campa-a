import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { TerritorialEnrichmentEngine, calculateEnrichmentCoverage, validateEnrichmentData } from "../src/features/territorial-enrichment/application/enrichment-engine.ts";
import { PublicMetadataEnrichmentProvider } from "../src/features/territorial-enrichment/application/public-metadata-provider.ts";

const base = { id:"school-1", municipalityId:"m1", name:"Escuela 1", type:"school", category:"education_school", latitude:-34.45, longitude:-58.56, notes:[], tags:[], status:"active", createdAt:"2026-01-01", updatedAt:"2026-01-01", metadata:{ source:"OSM", sourceUrl:"https://osm.org", license:"ODbL 1.0", confidence:"high", sourceProperties:{ "addr:street":"Constitución", "addr:housenumber":"100", phone:"4744-0000", operator:"Municipio" }, classification:{confidence:.98} } };

test("enriquece campos vacíos sin sobrescribir datos existentes", async () => {
  let saved;
  const engine = new TerritorialEnrichmentEngine([new PublicMetadataEnrichmentProvider()], { listEntities: async()=>[{...base, phone:"validado"}], saveRun:async(run)=>{saved=run;} }, ()=>new Date("2026-08-02T00:00:00Z"));
  const run = await engine.enrich("m1");
  assert.equal(run.candidates.find((item)=>item.field==="phone")?.status,"conflict");
  assert.ok(run.candidates.some((item)=>item.field==="street"&&item.status==="applied"));
  assert.equal(saved,run);
});

test("calcula completitud reproducible y valida contactos", () => {
  const coverage=calculateEnrichmentCoverage({...base,email:"incorrecto",website:"no-url"});
  assert.equal(coverage.quality,98);
  assert.ok(coverage.missing.includes("electoralCircuit"));
  assert.deepEqual(validateEnrichmentData({...base,email:"incorrecto",website:"no-url"}),["Email inválido","URL inválida"]);
});

test("sincronización encadena identidad y enriquecimiento", async()=>{
  const source=await readFile(new URL("../src/features/data-sync/presentation/data-sync-panel.tsx",import.meta.url),"utf8");
  assert.match(source,/api\/identity-resolution\/run/);
  assert.match(source,/api\/territorial-enrichment/);
});

test("persistencia conserva fuente, historial y RLS",async()=>{
  const sql=await readFile(new URL("../supabase/migrations/202608020001_sprint_25_enrichment.sql",import.meta.url),"utf8");
  assert.match(sql,/territorial_enrichment_history/);
  assert.match(sql,/previous_value jsonb/);
  assert.match(sql,/source jsonb not null/);
  assert.match(sql,/enable row level security/g);
});
