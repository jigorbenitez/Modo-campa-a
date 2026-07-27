"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegación móvil" className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-white/10 bg-[var(--sidebar)] p-1.5 text-white shadow-2xl lg:hidden">
      {navigation.slice(0, 5).map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={cn("flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold text-[var(--sidebar-muted)]", active && "bg-white/10 text-emerald-300")}>
            <span className="text-base" aria-hidden="true">{item.icon}</span>
            <span className="max-w-full truncate">{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
