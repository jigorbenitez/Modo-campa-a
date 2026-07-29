"use client";

import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { ModuleTour } from "@/components/tours/module-tour";
import { BrandLogo } from "@/components/brand/brand-logo";
import { CommandPalette } from "./command-palette";
import { ContextBar } from "./context-bar";

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
      <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/92 px-4 backdrop-blur-xl sm:px-6 lg:ml-64 lg:px-10">
        <Link href="/" className="atiy-logo-crop h-12 w-28 lg:hidden" aria-label="ATIY — Inicio">
          <BrandLogo priority />
        </Link>
        <div className="hidden min-w-0 flex-1 lg:block"><Suspense fallback={<span className="text-xs text-[var(--muted)]">San Fernando</span>}><ContextBar /></Suspense></div>
        <div className="flex items-center gap-2">
          <CommandPalette />
          <Link href="/recorrido" className="premium-button hidden h-10 items-center px-4 text-xs font-extrabold sm:flex">
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
