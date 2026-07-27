"use client";

import { useEffect, useState } from "react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { BrandMark } from "@/components/brand/brand-logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function ServiceWorkerRegister() {
  const online = useNetworkStatus();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent>();
  const [updateReady, setUpdateReady] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    if (standalone && !sessionStorage.getItem("modo-campana:splash-seen")) {
      sessionStorage.setItem("modo-campana:splash-seen", "true");
      const revealTimer = window.setTimeout(() => setShowSplash(true), 0);
      const timer = window.setTimeout(() => setShowSplash(false), 900);
      return () => {
        window.clearTimeout(revealTimer);
        window.clearTimeout(timer);
      };
    }
  }, []);

  useEffect(() => {
    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onInstall);

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) setUpdateReady(true);
          });
        });
      }).catch(() => undefined);
    }

    return () => window.removeEventListener("beforeinstallprompt", onInstall);
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(undefined);
  }

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-[var(--brand-primary)] text-white">
        <div className="animate-[page-enter_500ms_ease-out] text-center">
          <BrandMark className="mx-auto size-24 rounded-[1.75rem] shadow-2xl" priority />
          <p className="mt-6 text-xl font-black tracking-[0.18em]">ATIY</p>
          <p className="mt-2 text-xs text-white/55">Inteligencia para transformar el territorio.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!online && (
        <div className="fixed inset-x-3 top-3 z-[70] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-amber-400 px-4 py-3 text-amber-950 shadow-xl">
          <div><p className="text-xs font-black">Sin conexión</p><p className="text-[10px] font-bold opacity-70">Los cambios quedarán en este dispositivo.</p></div>
          <span className="size-2 animate-pulse rounded-full bg-amber-950" />
        </div>
      )}
      {updateReady && (
        <div className="fixed inset-x-3 bottom-24 z-[70] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-white shadow-xl">
          <div><p className="text-xs font-black">Actualización disponible</p><p className="text-[10px] text-white/50">Hay una versión nueva lista.</p></div>
          <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-[var(--brand-accent)] px-3 py-2 text-[10px] font-black text-[var(--brand-primary)]">Actualizar</button>
        </div>
      )}
      {installPrompt && (
        <button type="button" onClick={install} className="premium-button fixed bottom-24 right-4 z-[65] px-4 py-3 text-xs font-black shadow-xl lg:bottom-6">
          Instalar aplicación
        </button>
      )}
    </>
  );
}
