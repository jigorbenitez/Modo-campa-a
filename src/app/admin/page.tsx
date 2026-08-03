import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin/admin-panel";
import {
  canUser,
  getAdminOverview,
  getPlatformContext,
} from "@/infrastructure/supabase/platform-context";
import Link from "next/link";

export default async function AdminPage() {
  const context = await getPlatformContext();
  if (!context) redirect("/login");
  if (!canUser(context.user.role, "users:read")) {
    return (
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-3xl place-items-center px-4 py-12 text-center">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-sm)]">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Administración</p>
          <h1 className="mt-3 text-3xl font-black">Tu rol no tiene acceso administrativo</h1>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">La sesión es válida, pero el rol asignado no incluye el permiso para consultar usuarios y configuración. Solicitá acceso a una persona administradora del municipio.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/mi-cuenta" className="premium-button px-5 py-3 text-xs font-extrabold">Revisar Mi Cuenta</Link>
            <Link href="/" className="rounded-xl border border-[var(--border)] px-5 py-3 text-xs font-extrabold">Volver al Dashboard</Link>
          </div>
        </section>
      </div>
    );
  }

  const overview = await getAdminOverview(context);
  return <AdminPanel context={context} overview={overview} />;
}
