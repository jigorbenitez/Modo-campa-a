"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const modules: Record<string, { title: string; description: string; benefit: string }> = {
  "/": { title: "Resumen ejecutivo", description: "Reúne el pulso general y las acciones que requieren atención.", benefit: "Empezá el día sabiendo dónde enfocar al equipo." },
  "/territorio": { title: "Territorio", description: "Activá capas, elegí un barrio y mové la línea temporal.", benefit: "Entendé qué ocurre, dónde y desde cuándo." },
  "/diario": { title: "Diario", description: "Abrí cada actividad para ver hallazgos, personas y evidencia.", benefit: "Conservá la historia operativa completa." },
  "/relaciones": { title: "Relaciones", description: "Seleccioná una entidad para recorrer todo su contexto conectado.", benefit: "Encontrá antecedentes sin saltar entre pantallas." },
  "/inteligencia": { title: "Inteligencia", description: "Revisá señales derivadas y prioridades ordenadas por reglas.", benefit: "Pasá de números aislados a decisiones concretas." },
  "/recorrido": { title: "Modo Recorrida", description: "Elegí un barrio, iniciá el cronómetro y capturá con el dock inferior.", benefit: "Registrá el territorio con una sola mano, incluso offline." },
  "/admin": { title: "Administración", description: "Consultá usuarios, roles y estado de la plataforma.", benefit: "Mantené acceso y operación bajo control." },
};

export function ModuleTour() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const moduleInfo = modules[pathname];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const disabled = localStorage.getItem("modo-campana:tours-disabled") === "true";
      const seen = localStorage.getItem(`modo-campana:tour-seen:${pathname}`);
      setVisible(Boolean(moduleInfo && !disabled && !seen));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [moduleInfo, pathname]);

  if (!visible || !moduleInfo) return null;

  function close() {
    localStorage.setItem(`modo-campana:tour-seen:${pathname}`, "true");
    setVisible(false);
  }

  function disable() {
    localStorage.setItem("modo-campana:tours-disabled", "true");
    setVisible(false);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-black/35 p-3 backdrop-blur-[2px] sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-label={`Ayuda: ${moduleInfo.title}`}>
      <section className="w-full max-w-md rounded-[1.75rem] bg-[var(--surface)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-lg">?</span>
          <button type="button" onClick={close} className="grid size-9 place-items-center rounded-full bg-[var(--surface-muted)]" aria-label="Cerrar ayuda">×</button>
        </div>
        <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">Primera visita</p>
        <h2 className="mt-1 text-2xl font-black">{moduleInfo.title}</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{moduleInfo.description}</p>
        <div className="mt-4 rounded-2xl bg-[var(--surface-muted)] p-4">
          <p className="text-xs font-extrabold">Por qué sirve</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{moduleInfo.benefit}</p>
        </div>
        <button type="button" onClick={close} className="mt-5 h-12 w-full rounded-2xl bg-[var(--accent)] text-sm font-black text-white">Entendido</button>
        <button type="button" onClick={disable} className="mt-2 h-10 w-full text-xs font-bold text-[var(--muted)]">No mostrar estas ayudas</button>
      </section>
    </div>
  );
}
