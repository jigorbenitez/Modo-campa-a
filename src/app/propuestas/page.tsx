import { OperationalManager } from "@/components/management/operational-manager";

export default function PropuestasPage() {
  return (
    <OperationalManager
      storageKey="atiy:proposals:v1"
      eyebrow="Planificación"
      title="Propuestas"
      description="Convertí necesidades territoriales en propuestas trazables y relacionadas."
      singular="Propuesta"
      primaryField="title"
      secondaryField="description"
      allowArchive
      statuses={[
        { value: "study", label: "En estudio" },
        { value: "ready", label: "Lista" },
        { value: "executing", label: "En ejecución" },
        { value: "completed", label: "Ejecutada" },
        { value: "archived", label: "Archivada" },
      ]}
      fields={[
        { id: "title", label: "Título", required: true },
        { id: "responsible", label: "Responsable", required: true },
        { id: "neighborhood", label: "Barrio" },
        { id: "circuit", label: "Circuito electoral", placeholder: "Ej. 878A" },
        { id: "budget", label: "Partida presupuestaria" },
        { id: "institutions", label: "Instituciones relacionadas" },
        { id: "commitments", label: "Compromisos relacionados" },
        { id: "description", label: "Descripción y alcance", type: "textarea", required: true },
      ]}
    />
  );
}
