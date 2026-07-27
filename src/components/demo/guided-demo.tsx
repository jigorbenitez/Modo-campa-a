"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";

const steps = [
  {
    eyebrow: "Paso 1 · La plataforma",
    title: "Un municipio, conectado.",
    description: "ATIY reúne territorio, actividad e historia institucional para que el equipo pueda decidir con contexto.",
    accent: "Panorama general",
    facts: ["Villa del Encuentro", "4 barrios activos", "26 instituciones"],
  },
  {
    eyebrow: "Paso 2 · Territorio",
    title: "El municipio se vuelve visible.",
    description: "Cada actividad, problema y compromiso aparece vinculado al lugar donde ocurrió y a su evolución.",
    accent: "Mapa Vivo",
    facts: ["4 capas activas", "12 problemas abiertos", "Última recorrida: ayer"],
  },
  {
    eyebrow: "Paso 3 · Diario",
    title: "Cada actividad cuenta la historia completa.",
    description: "Una recorrida conserva participantes, observaciones, evidencia y todos los compromisos que generó.",
    accent: "Registro operativo",
    facts: ["38 actividades", "9 esta semana", "74 aportes conectados"],
  },
  {
    eyebrow: "Paso 4 · Relaciones",
    title: "La información deja de estar aislada.",
    description: "Personas, instituciones, barrios y documentos se exploran como una memoria compartida.",
    accent: "Contexto cruzado",
    facts: ["118 conexiones", "26 instituciones", "43 personas"],
  },
  {
    eyebrow: "Paso 5 · Inteligencia",
    title: "Los datos se convierten en prioridades.",
    description: "Reglas transparentes detectan concentración de problemas, actividad antigua y compromisos vencidos.",
    accent: "Señales útiles",
    facts: ["5 prioridades", "3 alertas", "Sin IA generativa"],
  },
  {
    eyebrow: "Paso 6 · Recorrido",
    title: "Hecho para trabajar desde la calle.",
    description: "Con una sola mano, el equipo registra fotos, hallazgos, personas y acuerdos mientras avanza.",
    accent: "Captura móvil",
    facts: ["Funciona offline", "Guardado inmediato", "Sin formularios largos"],
  },
  {
    eyebrow: "Paso 7 · Listo",
    title: "Una misma verdad para todo el equipo.",
    description: "La demostración terminó. Podés explorar la plataforma o iniciar un recorrido de prueba.",
    accent: "Villa del Encuentro",
    facts: ["Territorio", "Memoria", "Acción"],
  },
];

export function GuidedDemo() {
  const [step, setStep] = useState(0);
  const current = steps[step] ?? steps[0];

  useEffect(() => {
    localStorage.setItem("modo-campana:demo-seen", "true");
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--brand-primary)] text-white">
      <div className="absolute -left-24 top-1/4 size-72 rounded-full bg-[var(--brand-accent)]/10 blur-3xl" />
      <div className="absolute -right-20 bottom-0 size-96 rounded-full bg-[var(--brand-accent)]/8 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <Link href="/" className="atiy-logo-crop h-14 w-40" aria-label="ATIY — Inicio">
            <BrandLogo surface="dark" priority />
          </Link>
          <Link href="/" className="text-xs font-bold text-white/55 transition hover:text-white">Salir de la demo</Link>
        </header>

        <div className="flex flex-1 items-center py-10">
          <div className="grid w-full gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <section>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand-accent)]">{current.eyebrow}</p>
              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.045em] sm:text-6xl">{current.title}</h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">{current.description}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {current.facts.map((fact) => <span key={fact} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/75">{fact}</span>)}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">{current.accent}</p>
                <span className="rounded-full bg-[var(--brand-accent)]/15 px-3 py-1 text-[10px] font-black text-[var(--brand-accent)]">EN VIVO</span>
              </div>
              <div className="mt-6 h-56 rounded-3xl bg-[var(--brand-dark-background)] p-5">
                <div className="grid h-full grid-cols-4 gap-2 opacity-80">
                  {[72, 44, 86, 58, 64, 92, 39, 76].map((height, index) => <div key={index} className="flex items-end"><span className="w-full rounded-xl bg-[var(--brand-accent)]/20" style={{ height: `${height}%` }} /></div>)}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {current.facts.map((fact, index) => <div key={fact} className="rounded-2xl bg-black/15 p-3"><p className="text-xl font-black">{[82, 12, 7][index]}{index === 0 ? "%" : ""}</p><p className="mt-1 truncate text-[9px] font-bold uppercase text-white/35">{fact}</p></div>)}
              </div>
            </section>
          </div>
        </div>

        <footer>
          <div className="mb-5 flex gap-1.5">
            {steps.map((item, index) => <button key={item.title} type="button" onClick={() => setStep(index)} className={`h-1.5 flex-1 rounded-full transition ${index <= step ? "bg-[var(--brand-accent)]" : "bg-white/10"}`} aria-label={`Ir al paso ${index + 1}`} />)}
          </div>
          <div className="flex items-center justify-between">
            <button type="button" disabled={step === 0} onClick={() => setStep((value) => value - 1)} className="h-12 rounded-2xl px-5 text-sm font-bold text-white/55 disabled:opacity-0">Anterior</button>
            {step < steps.length - 1 ? (
              <button type="button" onClick={() => setStep((value) => value + 1)} className="h-12 rounded-2xl bg-[var(--brand-accent)] px-6 text-sm font-black text-[var(--brand-primary)]">Continuar →</button>
            ) : (
              <div className="flex gap-2"><Link href="/" className="grid h-12 place-items-center rounded-2xl border border-white/15 px-5 text-sm font-black">Explorar</Link><Link href="/recorrido" className="grid h-12 place-items-center rounded-2xl bg-[var(--brand-accent)] px-5 text-sm font-black text-[var(--brand-primary)]">Iniciar recorrido</Link></div>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}
