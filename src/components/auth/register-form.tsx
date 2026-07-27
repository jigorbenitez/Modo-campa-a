"use client";

import { useState } from "react";
import { SupabaseAuthGateway, isSupabaseConfigured } from "@/infrastructure/supabase";
import { AuthField } from "./auth-field";

export function RegisterForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    municipalityName: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!isSupabaseConfigured()) {
      setMessage("El registro real se habilitará al configurar Supabase.");
      return;
    }
    setLoading(true);
    const result = await new SupabaseAuthGateway().signUp(form);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    if (result.value) window.location.href = "/";
    else setMessage("Revisá tu correo para confirmar la cuenta y luego iniciá sesión.");
  }

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <AuthField label="Nombre" autoComplete="given-name" required value={form.firstName} onChange={(event) => update("firstName", event.target.value)} />
        <AuthField label="Apellido" autoComplete="family-name" required value={form.lastName} onChange={(event) => update("lastName", event.target.value)} />
      </div>
      <AuthField label="Municipio u organización" required value={form.municipalityName} onChange={(event) => update("municipalityName", event.target.value)} />
      <AuthField label="Correo electrónico" type="email" autoComplete="email" required value={form.email} onChange={(event) => update("email", event.target.value)} />
      <AuthField label="Contraseña" type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={(event) => update("password", event.target.value)} />
      {message && <p role="status" className="rounded-xl bg-[var(--surface-muted)] p-3 text-xs leading-5">{message}</p>}
      <button disabled={loading} className="premium-button w-full px-4 py-3 text-sm font-extrabold disabled:opacity-50">
        {loading ? "Creando cuenta…" : "Crear espacio de trabajo"}
      </button>
      <p className="text-[11px] leading-5 text-[var(--muted)]">OAuth con Google y Microsoft queda preparado como evolución futura, pero no está habilitado.</p>
    </form>
  );
}
