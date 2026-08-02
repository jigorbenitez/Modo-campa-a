"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeNavigationHref, navigation } from "@/data/navigation";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/brand-logo";

export function Sidebar() {
  const pathname = usePathname();
  const activeHref = activeNavigationHref(pathname);
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/8 bg-[var(--sidebar)] px-4 py-6 text-white lg:flex">
      <Link href="/" className="atiy-logo-crop mb-9 h-16 w-full shrink-0" aria-label="ATIY — Inicio">
        <BrandLogo surface="dark" priority />
      </Link>
      <nav aria-label="Navegación principal" className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {navigation.map((item) => {
          const active = activeHref === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-[var(--brand-accent)] text-[var(--brand-primary)] shadow-sm"
                  : "text-[var(--sidebar-muted)] hover:bg-white/8 hover:text-white",
              )}
            >
              <span className={cn("grid size-7 place-items-center text-base", active && "text-[var(--brand-primary)]")} aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 p-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-accent)]">Inteligencia territorial</p>
        <p className="mt-2 text-sm leading-5 text-[var(--sidebar-muted)]">Información conectada para decidir con contexto.</p>
      </div>
    </aside>
  );
}
