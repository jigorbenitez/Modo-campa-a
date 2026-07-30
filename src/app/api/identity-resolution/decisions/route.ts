import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export const runtime = "nodejs";

type Payload = {
  municipalityId?: string;
  matchId?: string;
  leftId?: string;
  rightId?: string;
  score?: number;
  decision?: "merged" | "ignored" | "later";
  evidence?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const client = await createServerSupabaseClient();
  if (!client) return NextResponse.json({ stored: false, mode: "demo" });
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sesión requerida." }, { status: 401 });
  const payload = await request.json().catch(() => null) as Payload | null;
  if (!payload?.municipalityId || !payload.matchId || !payload.leftId || !payload.rightId || !payload.decision) {
    return NextResponse.json({ error: "Decisión incompleta." }, { status: 400 });
  }
  const { error } = await client.from("territorial_identity_decisions").upsert({
    municipality_id: payload.municipalityId,
    match_id: payload.matchId,
    left_external_id: payload.leftId,
    right_external_id: payload.rightId,
    score: payload.score ?? 0,
    decision: payload.decision,
    evidence: payload.evidence ?? {},
    decided_by: auth.user.id,
    decided_at: new Date().toISOString(),
  }, { onConflict: "municipality_id,match_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ stored: true });
}

