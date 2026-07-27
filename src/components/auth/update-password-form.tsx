"use client";

import { useState } from "react";
import { SupabaseAuthGateway, isSupabaseConfigured } from "@/infrastructure/supabase";
import { AuthField } from "./auth-field";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string>();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmation) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    if (!isSupabaseConfigured()) {
      setMessage("Supabase no está configurado.");
      return;
    }
    const result = await new SupabaseAuthGateway().updatePassword(password);
    setMessage(result.ok ? "Contraseña actualizada. Ya podés iniciar sesión." : result.error.message);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <AuthField label="Nueva contraseña" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
      <AuthField label="Confirmar contraseña" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
      {message && <p role="status" className="rounded-xl bg-[var(--surface-muted)] p-3 text-xs">{message}</p>}
      <button className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-extrabold text-white">Actualizar contraseña</button>
    </form>
  );
}
