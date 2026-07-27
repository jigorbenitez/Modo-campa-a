"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[var(--sidebar)] px-4 py-6 text-white lg:flex">
      <Link href="/" className="mb-10 flex items-center gap-3 px-2">
        <span className="grid size-10 place-items-center rounded-xl bg-emerald-400 font-black text-emerald-950">MC</span>
        <span><strong className="block text-sm tracking-wide">MODO CAMPAÑA</strong><small className="text-[var(--sidebar-muted)]">Gestión municipal</small></span>
      </Link>
      <nav aria-label="Navegación principal" className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {navigation.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition", active ? "bg-white/12 text-white" : "text-[var(--sidebar-muted)] hover:bg-white/7 hover:text-white")}>
              <span className={cn("grid size-7 place-items-center rounded-lg text-base", active && "bg-emerald-400 text-emerald-950")} aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 rounded-2xl bg-white/6 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Próximo paso</p>
        <p className="mt-2 text-sm leading-5 text-[var(--sidebar-muted)]">Definí objetivos y responsables para esta semana.</p>
      </div>
    </aside>
  );
}
