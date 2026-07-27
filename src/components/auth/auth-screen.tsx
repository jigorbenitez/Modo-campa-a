import Link from "next/link";
import type { ReactNode } from "react";

export function AuthScreen({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[var(--background)]">
      <div className="grid min-h-full lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="hidden bg-[var(--sidebar)] p-10 text-white lg:flex lg:flex-col">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-400 font-black text-emerald-950">MC</span>
            <span className="font-extrabold">Modo Campaña</span>
          </Link>
          <div className="my-auto max-w-md">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-300">Plataforma colaborativa</p>
            <p className="mt-5 text-3xl font-extrabold leading-tight tracking-tight">
              Información compartida, responsabilidades claras y memoria institucional.
            </p>
            <p className="mt-5 text-sm leading-6 text-[var(--sidebar-muted)]">
              El acceso está aislado por municipio y protegido mediante permisos en cada capa.
            </p>
          </div>
          <p className="text-xs text-[var(--sidebar-muted)]">Supabase Auth · Row Level Security</p>
        </aside>
        <main className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-10 flex items-center gap-2 font-extrabold lg:hidden">
              <span className="grid size-8 place-items-center rounded-lg bg-[var(--accent)] text-xs text-white">MC</span>
              Modo Campaña
            </Link>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>
            <div className="mt-7">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-[var(--muted)]">{footer}</div>}
          </div>
        </main>
      </div>
    </div>
  );
}
