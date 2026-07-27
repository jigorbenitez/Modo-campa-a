import { SectionPage } from "@/components/pages/section-page";

export default function PresupuestoPage() {
  return <SectionPage eyebrow="Recursos" title="Presupuesto" description="Organizá los recursos de campaña con una lectura simple de partidas, compromisos y disponibilidad." cards={[
    { eyebrow: "Resumen", title: "Presupuesto general", description: "Vista consolidada de los recursos asignados a la campaña.", status: "Al día" },
    { eyebrow: "Planificación", title: "Partidas por área", description: "Distribución prevista entre territorio, comunicación y logística.", status: "Borrador" },
    { eyebrow: "Seguimiento", title: "Próximos compromisos", description: "Pagos y decisiones que requieren atención durante la semana.", status: "2 pendientes" },
  ]} />;
}
