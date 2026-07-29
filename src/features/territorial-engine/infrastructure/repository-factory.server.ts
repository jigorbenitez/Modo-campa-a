import "server-only";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { isSupabaseConfigured } from "@/infrastructure/supabase/config";
import type { TerritorialEntityRepository } from "../domain";
import { SupabaseTerritorialRepository } from "./supabase-territorial-repository";
import { VerifiedTerritorialRepository } from "./verified-territorial-repository";
import { SupabaseFirstTerritorialRepository } from "./supabase-first-territorial-repository";

export async function createTerritorialEntityRepository(): Promise<TerritorialEntityRepository> {
  if (isSupabaseConfigured()) {
    const client = await createServerSupabaseClient();
    if (!client) throw new Error("Supabase está configurado pero no existe una sesión válida.");
    return new SupabaseFirstTerritorialRepository(
      new SupabaseTerritorialRepository(client),
      new VerifiedTerritorialRepository(),
    );
  }
  return new VerifiedTerritorialRepository();
}
