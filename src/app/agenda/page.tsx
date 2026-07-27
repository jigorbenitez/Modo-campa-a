import { SectionPage } from "@/components/pages/section-page";

export default function AgendaPage() {
  return <SectionPage eyebrow="Organización" title="Agenda" description="Reuniones, recorridas y entregas reunidas en un solo lugar para que el equipo avance coordinado." cards={[
    { eyebrow: "Martes · 10:00", title: "Mesa de territorio", description: "Revisión semanal de barrios, referentes y próximos recorridos.", status: "Confirmado" },
    { eyebrow: "Miércoles · 16:30", title: "Revisión de propuestas", description: "Encuentro de trabajo sobre movilidad y servicios.", status: "Equipo" },
    { eyebrow: "Viernes · 18:00", title: "Recorrida barrial", description: "Visita programada con referentes de la zona norte.", status: "A coordinar" },
  ]} />;
}
