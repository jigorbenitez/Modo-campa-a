import { NextResponse } from "next/server";
import { SupabaseTerritorialRepository } from "@/features/territorial-engine/infrastructure/supabase-territorial-repository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const client = await createServerSupabaseClient();
  if (!client) return NextResponse.json({ resolved: false, mode: "demo" }, { status: 503 });
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sesión requerida." }, { status: 401 });
  const payload = await request.json().catch(() => null) as { municipalityId?: string } | null;
  if (!payload?.municipalityId) return NextResponse.json({ error: "Municipio requerido." }, { status: 400 });
  const repository = new SupabaseTerritorialRepository(client);
  const result = await repository.search(payload.municipalityId, { pageSize: 5000 });
  const clusters = result.items.filter((entity) => (entity.externalIds?.length ?? 0) > 1).map((entity) => ({
    municipality_id: payload.municipalityId,
    canonical_external_id: entity.id,
    external_ids: entity.externalIds,
    alternate_names: entity.alternateNames ?? [],
    sources: entity.sources ?? [],
    history: entity.identityHistory ?? [],
    updated_at: new Date().toISOString(),
  }));
  if (clusters.length) {
    const { error } = await client.from("territorial_identity_clusters")
      .upsert(clusters, { onConflict: "municipality_id,canonical_external_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ resolved: true, canonical: result.total, clusters: clusters.length });
}

