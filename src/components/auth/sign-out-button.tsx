"use client";

import { SupabaseAuthGateway, isSupabaseConfigured } from "@/infrastructure/supabase";

export function SignOutButton() {
  async function signOut() {
    if (!isSupabaseConfigured()) {
      window.location.href = "/login";
      return;
    }
    await new SupabaseAuthGateway().signOut();
    window.location.href = "/login";
  }

  return (
    <button type="button" onClick={signOut} className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-extrabold text-[var(--muted)]">
      Cerrar sesión
    </button>
  );
}
