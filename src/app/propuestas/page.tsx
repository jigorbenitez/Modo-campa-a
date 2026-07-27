import { SectionPage } from "@/components/pages/section-page";

export default function PropuestasPage() {
  return <SectionPage eyebrow="Plan de gobierno" title="Propuestas" description="Centralizá las ideas, su estado de elaboración y los responsables de convertirlas en compromisos claros." cards={[
    { eyebrow: "Movilidad", title: "Calles más conectadas", description: "Lineamientos para mejorar recorridos y conectividad barrial.", status: "En revisión" },
    { eyebrow: "Ambiente", title: "Ciudad más limpia", description: "Acciones municipales para residuos, plazas y cuidado urbano.", status: "Borrador" },
    { eyebrow: "Gestión", title: "Trámites simples", description: "Una propuesta para acercar los servicios municipales.", status: "Idea" },
  ]} />;
}
