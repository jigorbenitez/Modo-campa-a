import { SectionPage } from "@/components/pages/section-page";

export default function VecinosPage() {
  return <SectionPage eyebrow="Comunidad" title="Vecinos" description="Ordená contactos, conversaciones y temas recurrentes sin perder el contexto de cada vínculo." cards={[
    { eyebrow: "Escucha", title: "Temas recurrentes", description: "Síntesis breve de las inquietudes recogidas en el territorio.", status: "Actualizado" },
    { eyebrow: "Referentes", title: "Contactos barriales", description: "Personas y organizaciones vinculadas a cada zona.", status: "12 contactos" },
    { eyebrow: "Seguimiento", title: "Conversaciones abiertas", description: "Compromisos y respuestas que el equipo debe retomar.", status: "4 pendientes" },
  ]} />;
}
