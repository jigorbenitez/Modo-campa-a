"use client";

import { useState } from "react";
import { SupabaseAuthGateway, isSupabaseConfigured } from "@/infrastructure/supabase";
import { AuthField } from "./auth-field";

export function PasswordResetForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string>();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!isSupabaseConfigured()) {
      setMessage("La recuperación se habilitará al configurar Supabase.");
      return;
    }
    const redirectTo = `${window.location.origin}/auth/callback?next=/actualizar-clave`;
    const result = await new SupabaseAuthGateway().requestPasswordReset(email, redirectTo);
    setMessage(result.ok ? "Si la cuenta existe, recibirás un enlace de recuperación." : result.error.message);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <AuthField label="Correo electrónico" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      {message && <p role="status" className="rounded-xl bg-[var(--surface-muted)] p-3 text-xs leading-5">{message}</p>}
      <button className="premium-button w-full px-4 py-3 text-sm font-extrabold">Enviar enlace seguro</button>
    </form>
  );
}
