"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeNavigationHref, navigation } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const activeHref = activeNavigationHref(pathname);
  const [open, setOpen] = useState(false);
  const primary = navigation.slice(0, 4);
  const secondary = navigation.slice(4);
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-[var(--primary)]/35 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
        <nav aria-label="Más centros de trabajo" className="absolute inset-x-3 bottom-20 grid grid-cols-2 gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          {secondary.map((item) => <Link key={item.href} href={item.href} aria-current={activeHref === item.href ? "page" : undefined} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl bg-[var(--surface-muted)] p-3 text-xs font-extrabold", activeHref === item.href && "bg-[var(--accent-soft)] text-[var(--accent-strong)]")}><span className="text-lg">{item.icon}</span>{item.label}</Link>)}
        </nav>
      </div>}
      <nav aria-label="Navegación móvil" className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-2xl border border-white/10 bg-[var(--sidebar)] p-1.5 text-white shadow-2xl lg:hidden">
        {primary.map((item) => {
          const active = activeHref === item.href;
          return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold text-[var(--sidebar-muted)]", active && "bg-[var(--brand-accent)] text-[var(--brand-primary)]")}><span className="text-base" aria-hidden>{item.icon}</span><span className="max-w-full truncate">{item.shortLabel}</span></Link>;
        })}
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className={cn("flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold text-[var(--sidebar-muted)]", open && "bg-[var(--brand-accent)] text-[var(--brand-primary)]")}><span className="text-base" aria-hidden>•••</span><span>Más</span></button>
      </nav>
    </>
  );
}
