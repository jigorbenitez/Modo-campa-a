import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export async function POST(request: Request) {
  const client = await createServerSupabaseClient();
  if (!client) return NextResponse.json({ stored: false, mode: "demo" });
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sesión requerida." }, { status: 401 });
  const payload = await request.json().catch(() => null) as { municipalityId?: string; issueId?: string; entityId?: string; action?: "approved" | "rejected"; category?: string } | null;
  if (!payload?.municipalityId || !payload.issueId || !payload.entityId || !payload.action) return NextResponse.json({ error: "Decisión incompleta." }, { status: 400 });
  const { error } = await client.from("territorial_quality_decisions").upsert({ municipality_id: payload.municipalityId, issue_id: payload.issueId, entity_external_id: payload.entityId, action: payload.action, proposed_category: payload.category ?? null, decided_by: auth.user.id, decided_at: new Date().toISOString() }, { onConflict: "municipality_id,issue_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ stored: true });
}

