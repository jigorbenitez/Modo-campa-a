"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { ModuleTour } from "@/components/tours/module-tour";

const immersiveRoutes = new Set(["/demo", "/presentacion", "/ejecutivo"]);

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const immersive = immersiveRoutes.has(pathname);

  if (immersive) {
    return (
      <>
        <ServiceWorkerRegister />
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <ServiceWorkerRegister />
      <ModuleTour />
      <Sidebar />
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/90 px-4 backdrop-blur-md sm:px-6 lg:ml-64 lg:px-10">
        <Link href="/" className="flex items-center gap-2 font-black lg:hidden">
          <span className="grid size-8 place-items-center rounded-lg bg-[var(--accent)] text-xs text-white">MC</span>
          Modo Campaña
        </Link>
        <div className="hidden items-center gap-2 text-sm text-[var(--muted)] lg:flex">
          <span className="size-2 rounded-full bg-emerald-500" />
          Espacio de planificación
        </div>
        <div className="flex items-center gap-2">
          <Link href="/recorrido" className="hidden h-10 items-center rounded-xl bg-[var(--accent)] px-4 text-xs font-extrabold text-white sm:flex">
            Iniciar recorrida
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="pb-28 lg:ml-64 lg:pb-12">{children}</main>
      <MobileNav />
    </div>
  );
}
