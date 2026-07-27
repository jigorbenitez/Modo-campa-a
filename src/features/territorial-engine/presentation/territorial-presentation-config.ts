import type { FilterDefinition } from "@/application/shared/filters";
import type { TerritorialEntityType } from "../domain";

export const territorialTypeLabels: Record<TerritorialEntityType, string> = {
  locality: "Localidad",
  neighborhood: "Barrio",
  school: "Escuela",
  kindergarten: "Jardín",
  university: "Universidad",
  club: "Club",
  hospital: "Hospital",
  primary_care_center: "CAPS",
  health_center: "Centro de salud",
  square: "Plaza",
  municipal_office: "Dependencia municipal",
  institution: "Institución",
  organization: "Organización",
  public_space: "Espacio público",
  station: "Estación",
  transport_line: "Línea de transporte",
  transport_stop: "Parada",
  relevant_business: "Comercio relevante",
  shopping_center: "Centro comercial",
  religious_place: "Lugar religioso",
  point_of_interest: "Punto de interés",
};

export function buildTerritorialFilterDefinitions(input: {
  categories: string[];
  localities: Array<{ id: string; name: string }>;
  neighborhoods: Array<{ id: string; name: string }>;
}): FilterDefinition[] {
  return [
    {
      id: "type",
      label: "Tipo",
      kind: "single",
      placeholder: "Todos los tipos",
      options: Object.entries(territorialTypeLabels).map(([value, label]) => ({ value, label })),
    },
    {
      id: "category",
      label: "Categoría",
      kind: "single",
      placeholder: "Todas las categorías",
      options: input.categories.map((category) => ({ value: category, label: category })),
    },
    {
      id: "localityId",
      label: "Localidad",
      kind: "single",
      placeholder: "Todas las localidades",
      options: input.localities.map((locality) => ({ value: locality.id, label: locality.name })),
    },
    {
      id: "neighborhoodId",
      label: "Barrio",
      kind: "single",
      placeholder: "Todos los barrios",
      options: input.neighborhoods.map((neighborhood) => ({ value: neighborhood.id, label: neighborhood.name })),
    },
  ];
}
