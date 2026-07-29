import { OperationalManager } from "@/components/management/operational-manager";

export default function MarketingPage() {
  return (
    <OperationalManager
      storageKey="atiy:communication-campaigns:v1"
      eyebrow="Comunicación"
      title="Campañas"
      description="Planificá acciones de comunicación con objetivo, territorio y responsables claros."
      singular="Campaña"
      primaryField="name"
      secondaryField="objective"
      statuses={[
        { value: "draft", label: "Borrador" },
        { value: "planned", label: "Planificada" },
        { value: "active", label: "Activa" },
        { value: "completed", label: "Finalizada" },
      ]}
      fields={[
        { id: "name", label: "Nombre", required: true },
        { id: "objective", label: "Objetivo", type: "textarea", required: true },
        { id: "territory", label: "Territorio" },
        { id: "circuit", label: "Circuito electoral" },
        { id: "responsible", label: "Responsable", required: true },
        { id: "material", label: "Material y canales", type: "textarea" },
        { id: "result", label: "Resultado", type: "textarea" },
      ]}
    />
  );
}
