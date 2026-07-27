"use client";

import { useState } from "react";
import { SupabaseAuthGateway, isSupabaseConfigured } from "@/infrastructure/supabase";
import { AuthField } from "./auth-field";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!isSupabaseConfigured()) {
      window.location.href = "/";
      return;
    }
    setLoading(true);
    setMessage(undefined);
    const result = await new SupabaseAuthGateway().signIn({ email, password });
    setLoading(false);
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    window.location.href = "/";
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <AuthField label="Correo electrónico" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <AuthField label="Contraseña" type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
      {message && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950 dark:text-rose-200">{message}</p>}
      <button disabled={loading} className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50">
        {loading ? "Ingresando…" : isSupabaseConfigured() ? "Iniciar sesión" : "Continuar en modo demo"}
      </button>
    </form>
  );
}
