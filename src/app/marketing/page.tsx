import { SectionPage } from "@/components/pages/section-page";

export default function MarketingPage() {
  return <SectionPage eyebrow="Comunicación" title="Marketing" description="Coordiná mensajes, canales y piezas para sostener una comunicación coherente en toda la campaña." cards={[
    { eyebrow: "Mensaje", title: "Eje de la semana", description: "La idea central que ordena vocerías, recorridas y publicaciones.", status: "Aprobado" },
    { eyebrow: "Redes", title: "Calendario de contenidos", description: "Publicaciones previstas y materiales que todavía faltan.", status: "5 piezas" },
    { eyebrow: "Prensa", title: "Agenda de medios", description: "Oportunidades de entrevistas y temas a preparar.", status: "Abierto" },
  ]} />;
}
