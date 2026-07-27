"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseConfig } from "./config";

export function createBrowserSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no está configurado.");
  }
  return createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
}
