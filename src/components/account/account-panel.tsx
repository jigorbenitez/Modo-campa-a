import type { PlatformContext } from "@/infrastructure/supabase/platform-context";
import { SignOutButton } from "@/components/auth/sign-out-button";

const roleLabels = {
  administrator: "Administrador",
  coordinator: "Coordinador",
  territorial_manager: "Responsable Territorial",
  institutional_manager: "Responsable Institucional",
  volunteer: "Voluntario",
  consultant: "Consultor",
  guest: "Invitado",
  read_only: "Solo lectura",
};

export function AccountPanel({ context }: { context: PlatformContext }) {
  const { user } = context;
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
  const preferences = [
    ["Tema", user.preferences.theme],
    ["Idioma", user.preferences.locale],
    ["Zona horaria", user.preferences.timezone],
    ["Avisos por correo", user.preferences.emailNotifications ? "Activados" : "Desactivados"],
    ["Resumen semanal", user.preferences.weeklyDigest ? "Activado" : "Desactivado"],
    ["Movimiento reducido", user.preferences.reducedMotion ? "Activado" : "Desactivado"],
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <header className="flex flex-col justify-between gap-5 border-b border-[var(--border)] pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Perfil y preferencias</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Mi cuenta</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {context.configured ? "Cuenta conectada a Supabase." : "Perfil de demostración local."}
          </p>
        </div>
        <SignOutButton />
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="grid size-16 place-items-center rounded-2xl bg-[var(--accent-soft)] text-xl font-black text-[var(--accent-strong)]">{initials}</div>
          <h2 className="mt-4 text-xl font-extrabold">{user.firstName} {user.lastName}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{user.email}</p>
          <dl className="mt-6 space-y-4 border-t border-[var(--border)] pt-5">
            <div><dt className="text-[10px] font-bold uppercase text-[var(--muted)]">Rol</dt><dd className="mt-1 text-sm font-extrabold">{roleLabels[user.role]}</dd></div>
            <div><dt className="text-[10px] font-bold uppercase text-[var(--muted)]">Municipio</dt><dd className="mt-1 text-sm font-extrabold">{context.municipalityName}</dd></div>
            <div><dt className="text-[10px] font-bold uppercase text-[var(--muted)]">Último acceso</dt><dd className="mt-1 text-sm font-extrabold">{user.lastAccessAt ? new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(user.lastAccessAt)) : "Primer acceso"}</dd></div>
          </dl>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">Experiencia personal</p><h2 className="mt-1 text-xl font-extrabold">Preferencias</h2></div>
            <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-bold text-[var(--muted)]">Edición futura</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {preferences.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-[var(--surface-muted)] p-4">
                <p className="text-[10px] font-bold uppercase text-[var(--muted)]">{label}</p>
                <p className="mt-1 text-sm font-extrabold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-dashed border-[var(--border)] p-4 text-xs leading-5 text-[var(--muted)]">
            La edición de avatar, preferencias y conexiones OAuth se habilitará en una siguiente etapa.
          </div>
        </section>
      </div>
    </div>
  );
}
