import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { createTerritorialEntityRepository } from "@/features/territorial-engine/infrastructure/repository-factory.server";
import { NominatimReverseGeocodingProvider, PublicMetadataEnrichmentProvider, TerritorialEnrichmentEngine, type EnrichmentCandidate, type EnrichmentRepository, type EnrichmentRun } from "@/features/territorial-enrichment";

export const runtime = "nodejs";
type Client = NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>;

export async function GET(request: Request) {
  const client = await createServerSupabaseClient();
  if (!client) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sesión requerida." }, { status: 401 });
  const municipalityId = new URL(request.url).searchParams.get("municipalityId");
  if (!municipalityId) return NextResponse.json({ error: "Municipio requerido." }, { status: 400 });
  const [{ data: runs }, { data: candidates }] = await Promise.all([
    client.from("territorial_enrichment_runs").select("*").eq("municipality_id", municipalityId).order("finished_at", { ascending: false }).limit(20),
    client.from("territorial_enrichment_candidates").select("*").eq("municipality_id", municipalityId).order("updated_at", { ascending: false }).limit(500),
  ]);
  return NextResponse.json({ runs: runs ?? [], candidates: candidates ?? [] });
}

export async function POST(request: Request) {
  const client = await createServerSupabaseClient();
  if (!client) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sesión requerida." }, { status: 401 });
  const payload = await request.json().catch(() => null) as { action?: string; municipalityId?: string; candidateId?: string } | null;
  if (!payload?.municipalityId) return NextResponse.json({ error: "Municipio requerido." }, { status: 400 });
  if (payload.action === "run") {
    const territorialRepository = await createTerritorialEntityRepository();
    const repository: EnrichmentRepository = {
      listEntities: async (municipalityId) => (await territorialRepository.search(municipalityId, { pageSize: 5000 })).items,
      saveRun: async (run) => saveRun(client, auth.user.id, run),
    };
    const result = await new TerritorialEnrichmentEngine([new PublicMetadataEnrichmentProvider(), new NominatimReverseGeocodingProvider()], repository).enrich(payload.municipalityId);
    return NextResponse.json({ data: result });
  }
  if ((payload.action === "accept" || payload.action === "reject") && payload.candidateId) {
    const status = payload.action === "accept" ? "applied" : "rejected";
    const { data: candidate, error } = await client.from("territorial_enrichment_candidates").update({ status, reviewed_by: auth.user.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("municipality_id", payload.municipalityId).eq("id", payload.candidateId).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await client.from("territorial_enrichment_history").insert({ municipality_id: payload.municipalityId, entity_external_id: candidate.entity_external_id, field: candidate.field, previous_value: candidate.previous_value, new_value: candidate.proposed_value, action: status, source: candidate.source, actor_id: auth.user.id, actor_type: "user" });
    return NextResponse.json({ data: candidate });
  }
  return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
}

async function saveRun(client: Client, userId: string, run: EnrichmentRun) {
  const { error: runError } = await client.from("territorial_enrichment_runs").insert({ municipality_id: run.municipalityId, started_at: run.startedAt, finished_at: run.finishedAt, entities_reviewed: run.entitiesReviewed, entities_enriched: run.entitiesEnriched, applied_count: run.applied, conflict_count: run.conflicts, rejected_count: run.rejected, sources: run.sources, executed_by: userId });
  if (runError) throw runError;
  for (let offset = 0; offset < run.candidates.length; offset += 500) {
    const rows = run.candidates.slice(offset, offset + 500).map((candidate: EnrichmentCandidate) => ({ id: candidate.id, municipality_id: run.municipalityId, entity_external_id: candidate.entityId, field: candidate.field, previous_value: candidate.previousValue ?? null, proposed_value: candidate.proposedValue, status: candidate.status, source: candidate.source, reason: candidate.reason, updated_at: run.finishedAt }));
    const { error } = await client.from("territorial_enrichment_candidates").upsert(rows, { onConflict: "municipality_id,id" });
    if (error) throw error;
  }
  const automatic = run.candidates.filter((candidate) => candidate.status === "applied").map((candidate) => ({ municipality_id: run.municipalityId, entity_external_id: candidate.entityId, field: candidate.field, previous_value: candidate.previousValue ?? null, new_value: candidate.proposedValue, action: "automatic_enrichment", source: candidate.source, actor_type: "process" }));
  if (automatic.length) await client.from("territorial_enrichment_history").insert(automatic);
}
