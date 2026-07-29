import { OperationalManager } from "@/components/management/operational-manager";

export default function AgendaPage() {
  return (
    <OperationalManager
      storageKey="atiy:agenda:v1"
      eyebrow="Organización"
      title="Agenda"
      description="Gestioná reuniones, recorridas y recordatorios vinculados con el contexto territorial."
      singular="Actividad de agenda"
      primaryField="title"
      secondaryField="description"
      statuses={[
        { value: "pending", label: "Pendiente" },
        { value: "confirmed", label: "Confirmada" },
        { value: "completed", label: "Realizada" },
        { value: "cancelled", label: "Cancelada" },
      ]}
      fields={[
        { id: "title", label: "Título", required: true },
        { id: "startsAt", label: "Fecha y hora", type: "datetime-local", required: true },
        { id: "reminder", label: "Recordatorio", type: "datetime-local" },
        { id: "view", label: "Tipo", type: "select", options: [
          { value: "meeting", label: "Reunión" },
          { value: "tour", label: "Recorrida" },
          { value: "commitment", label: "Compromiso" },
          { value: "event", label: "Evento" },
        ] },
        { id: "neighbors", label: "Vecinos relacionados" },
        { id: "institutions", label: "Instituciones relacionadas" },
        { id: "commitments", label: "Compromisos relacionados" },
        { id: "description", label: "Descripción", type: "textarea" },
      ]}
    />
  );
}
