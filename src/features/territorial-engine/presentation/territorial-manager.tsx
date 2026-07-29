import { OperationalManager } from "@/components/management/operational-manager";
import { TerritorialDataExchange } from "./territorial-data-exchange";

const typeOptions = [
  ["municipality", "Municipio"],
  ["locality", "Localidad"],
  ["electoral_circuit", "Circuito"],
  ["hospital", "Hospital"],
  ["primary_care_center", "CAPS"],
  ["school", "Escuela"],
  ["kindergarten", "Jardín"],
  ["club", "Club"],
  ["square", "Plaza"],
  ["institution", "Institución"],
  ["fire_station", "Bomberos"],
  ["police_station", "Policía"],
  ["library", "Biblioteca"],
  ["cultural_center", "Centro cultural"],
  ["municipal_office", "Dependencia municipal"],
  ["organization", "Organización"],
  ["public_space", "Espacio verde"],
  ["neighborhood", "Barrio"],
] as const;

export function TerritorialManager() {
  return (
    <>
    <TerritorialDataExchange />
    <OperationalManager
      storageKey="atiy:territorial-entities:v1"
      eyebrow="Motor territorial ATIY"
      title="Territorio"
      description="Creá y mantené lugares e instituciones con ubicación verificable, relaciones y documentación."
      singular="Entidad territorial"
      primaryField="name"
      secondaryField="description"
      locationFields={{ latitude: "latitude", longitude: "longitude" }}
      categoryFilterField="type"
      statuses={[
        { value: "active", label: "Activa" },
        { value: "pending_review", label: "Pendiente de revisión" },
        { value: "inactive", label: "Inactiva" },
        { value: "archived", label: "Archivada" },
      ]}
      fields={[
        { id: "name", label: "Nombre", required: true },
        {
          id: "type",
          label: "Categoría",
          type: "select",
          required: true,
          options: typeOptions.map(([value, label]) => ({ value, label })),
        },
        { id: "locality", label: "Localidad", required: true },
        { id: "neighborhood", label: "Barrio" },
        { id: "circuit", label: "Circuito electoral" },
        { id: "address", label: "Dirección" },
        { id: "latitude", label: "Latitud", type: "number", required: true },
        { id: "longitude", label: "Longitud", type: "number", required: true },
        { id: "phone", label: "Teléfono", type: "tel" },
        { id: "email", label: "Correo electrónico", type: "email" },
        { id: "relationships", label: "Relaciones", placeholder: "Personas, recorridas, propuestas o compromisos" },
        { id: "description", label: "Descripción", type: "textarea" },
      ]}
    />
    </>
  );
}
