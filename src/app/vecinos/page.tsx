import { OperationalManager } from "@/components/management/operational-manager";

export default function VecinosPage() {
  return (
    <OperationalManager
      storageKey="atiy:neighbors:v1"
      eyebrow="CRM territorial"
      title="Vecinos"
      description="Conservá contactos, historial y compromisos con aislamiento municipal y contexto territorial."
      singular="Vecino"
      primaryField="firstName"
      secondaryField="observations"
      statuses={[
        { value: "active", label: "Activo" },
        { value: "follow_up", label: "Requiere seguimiento" },
        { value: "inactive", label: "Inactivo" },
      ]}
      fields={[
        { id: "firstName", label: "Nombre", required: true },
        { id: "lastName", label: "Apellido", required: true },
        { id: "address", label: "Dirección", required: true },
        { id: "neighborhood", label: "Barrio", required: true },
        { id: "circuit", label: "Circuito electoral", required: true },
        { id: "phone", label: "Teléfono", type: "tel" },
        { id: "email", label: "Correo electrónico", type: "email" },
        { id: "institutions", label: "Instituciones relacionadas" },
        { id: "commitments", label: "Compromisos" },
        { id: "history", label: "Historial", type: "textarea" },
        { id: "observations", label: "Observaciones", type: "textarea" },
      ]}
    />
  );
}
