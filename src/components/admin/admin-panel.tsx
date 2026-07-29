"use client";

import { useState } from "react";
import type {
  AdminOverview,
  PlatformContext,
} from "@/infrastructure/supabase/platform-context";
import { rolePermissions } from "@/application/auth";
import type { UserRole } from "@/domain/entities";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { TerritorialDataExchange } from "@/features/territorial-engine/presentation";

const roleLabels: Record<UserRole, string> = {
  administrator: "Administrador",
  coordinator: "Coordinador",
  territorial_manager: "Responsable Territorial",
  institutional_manager: "Responsable Institucional",
  volunteer: "Voluntario",
  consultant: "Consultor",
  guest: "Invitado",
  read_only: "Solo lectura",
};

export function AdminPanel({
  context,
  overview,
}: {
  context: PlatformContext;
  overview: AdminOverview;
}) {
  const [audit, setAudit] = useState<string[]>([]);
  const activeUsers = overview.users.filter((user) => user.status === "active").length;

  function register(action: string) {
    setAudit((items) => [`${new Date().toLocaleString("es-AR")} · ${action}`, ...items]);
  }

  function downloadAudit() {
    const url = URL.createObjectURL(new Blob([audit.join("\n") || "Sin eventos locales."], { type: "text/plain" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "atiy-auditoria-local.txt";
    anchor.click();
    URL.revokeObjectURL(url);
    register("Auditoría exportada");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <header className="border-b border-[var(--border)] pb-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">
          Plataforma colaborativa
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Administración</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Usuarios, roles y estado de la infraestructura de {context.municipalityName}.
        </p>
      </header>

      <section aria-label="Estado del sistema" className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Usuarios", overview.users.length.toString()],
          ["Usuarios activos", activeUsers.toString()],
          ["Municipios visibles", overview.municipalities.length.toString()],
          ["Persistencia", overview.configured ? "Supabase" : "Modo demo"],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
            <p className="mt-2 text-2xl font-black">{value}</p>
          </article>
        ))}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] p-5">
            <h2 className="text-lg font-extrabold">Usuarios</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Accesos limitados automáticamente al municipio activo.</p>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {overview.users.map((user) => (
              <article key={user.id} className="grid gap-2 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <h3 className="text-sm font-extrabold">{user.name}</h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">{user.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-bold">
                    {roleLabels[user.role]}
                  </span>
                  <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--accent-strong)]">
                    {user.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-lg font-extrabold">Municipios</h2>
            <div className="mt-4 space-y-3">
              {overview.municipalities.map((municipality) => (
                <div key={municipality.id} className="rounded-xl bg-[var(--surface-muted)] p-4">
                  <p className="text-sm font-extrabold">{municipality.name}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase text-[var(--muted)]">
                    {municipality.active ? "Activo" : "Inactivo"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold">Auditoría y respaldos</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">Registro local de acciones administrativas.</p>
              </div>
              <button type="button" onClick={downloadAudit} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-extrabold">Exportar</button>
            </div>
            <button type="button" onClick={() => register("Revisión manual del estado del sistema")} className="mt-4 w-full rounded-xl bg-[var(--primary)] px-3 py-2.5 text-xs font-extrabold text-white">Registrar revisión</button>
            <div className="mt-3 max-h-32 space-y-2 overflow-y-auto" aria-live="polite">
              {audit.length === 0 ? <p className="text-xs text-[var(--muted)]">Todavía no hay acciones locales en esta sesión.</p> : audit.map((item) => <p key={item} className="rounded-lg bg-[var(--surface-muted)] p-2 text-[10px]">{item}</p>)}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-lg font-extrabold">Roles y permisos</h2>
            <div className="mt-4 space-y-3">
              {(Object.keys(rolePermissions) as UserRole[]).map((role) => (
                <div key={role} className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-bold">{roleLabels[role]}</span>
                  <span className="text-[var(--muted)]">{rolePermissions[role].length} permisos</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-dashed border-[var(--border)] p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Configuración</p>
            <p className="mt-2 text-sm font-bold">
              {overview.configured
                ? "Autenticación, RLS y auditoría habilitadas."
                : "Definí las variables de Supabase y aplicá la migración para activar la infraestructura real."}
            </p>
          </section>
        </div>
      </div>
      <section className="mt-8 border-t border-[var(--border)] pt-2">
        <TerritorialDataExchange />
      </section>
      <section id="configuracion" className="mt-2 border-t border-[var(--border)]">
        <SettingsPanel />
      </section>
    </div>
  );
}
