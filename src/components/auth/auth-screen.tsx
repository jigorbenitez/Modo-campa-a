import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo, BrandMark } from "@/components/brand/brand-logo";

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
      <div className="grid min-h-full lg:grid-cols-[1fr_1fr]">
        <aside className="relative hidden overflow-hidden bg-[var(--brand-primary)] p-12 text-white lg:flex lg:flex-col">
          <div className="absolute -left-32 top-1/3 size-96 rounded-full bg-[var(--brand-accent)]/10 blur-3xl" />
          <div className="absolute -right-20 bottom-0 size-80 rounded-full bg-white/5 blur-3xl" />
          <Link href="/" className="atiy-logo-crop relative h-20 w-56" aria-label="ATIY — Inicio">
            <BrandLogo surface="dark" priority />
          </Link>
          <div className="relative my-auto max-w-lg">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--brand-accent)]">Plataforma de inteligencia territorial</p>
            <h2 className="mt-6 text-4xl font-black leading-[1.08] tracking-[-0.04em]">
              Inteligencia para transformar el territorio.
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-[var(--sidebar-muted)]">
              Centralizá información, relaciones, actividades y conocimiento para tomar mejores decisiones.
            </p>
          </div>
          <p className="relative text-xs text-[var(--sidebar-muted)]">Seguridad multi-municipio · Acceso por roles</p>
        </aside>
        <main className="flex items-center justify-center p-5 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-10 flex items-center gap-3 lg:hidden" aria-label="ATIY — Inicio">
              <BrandMark className="size-12 rounded-2xl" priority />
              <div><strong className="block tracking-[0.16em] text-[var(--brand-primary)] dark:text-white">ATIY</strong><span className="text-[10px] text-[var(--muted)]">Inteligencia territorial</span></div>
            </Link>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">{eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.035em]">{title}</h1>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{description}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-7 text-center text-sm text-[var(--muted)]">{footer}</div>}
          </div>
        </main>
      </div>
    </div>
  );
}
