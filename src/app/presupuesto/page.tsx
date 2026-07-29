import { OperationalManager } from "@/components/management/operational-manager";

export default function PresupuestoPage() {
  return (
    <OperationalManager
      storageKey="atiy:budget-lines:v1"
      eyebrow="Gestión financiera"
      title="Presupuesto"
      description="Administrá partidas, documentación y relaciones presupuestarias con trazabilidad."
      singular="Partida"
      primaryField="name"
      secondaryField="description"
      statuses={[
        { value: "draft", label: "Borrador" },
        { value: "approved", label: "Aprobada" },
        { value: "executing", label: "En ejecución" },
        { value: "closed", label: "Cerrada" },
      ]}
      fields={[
        { id: "name", label: "Nombre de la partida", required: true },
        { id: "amount", label: "Monto", type: "number", required: true },
        { id: "area", label: "Área responsable", required: true },
        { id: "period", label: "Período", type: "date" },
        { id: "proposals", label: "Propuestas relacionadas", placeholder: "Nombres o identificadores separados por coma" },
        { id: "commitments", label: "Compromisos relacionados", placeholder: "Nombres o identificadores separados por coma" },
        { id: "description", label: "Descripción", type: "textarea" },
      ]}
    />
  );
}
