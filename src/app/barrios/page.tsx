import { SectionPage } from "@/components/pages/section-page";

export default function BarriosPage() {
  return <SectionPage eyebrow="Territorio" title="Barrios" description="Planificá la presencia territorial y mantené visibles las prioridades de cada zona del municipio." cards={[
    { eyebrow: "Zona centro", title: "Centro", description: "Recorridas comerciales y encuentro con organizaciones locales.", status: "Activo" },
    { eyebrow: "Zona norte", title: "Norte", description: "Agenda de infraestructura y espacios públicos.", status: "Planificado" },
    { eyebrow: "Zona oeste", title: "Oeste", description: "Relevamiento de transporte y acceso a servicios.", status: "Pendiente" },
  ]} />;
}
