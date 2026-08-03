import type { TerritorialEntity, TerritorialEntityType } from "@/features/territorial-engine/domain";
import { territorialTaxonomy, type TerritorialCategoryId } from "../domain/taxonomy";

export interface ClassificationSuggestion {
  category: TerritorialCategoryId;
  type: TerritorialEntityType;
  confidence: number;
  reason: string;
  originalCategory: string;
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es-AR").replace(/[^a-z0-9]+/g, " ").trim();
}

const mapping: Array<{ category: TerritorialCategoryId; type: TerritorialEntityType; terms: string[]; source?: string[]; nameOnly?: boolean }> = [
  { category: "sport_sports_center", type: "club", terms: ["polideportivo", "poli deportivo"], nameOnly: true },
  { category: "sport_municipal_field", type: "club", terms: ["cancha municipal", "campo deportes"] },
  { category: "sport_club", type: "club", terms: ["club", "atletico", "deportivo"], source: ["club"], nameOnly: true },
  { category: "education_kindergarten", type: "kindergarten", terms: ["jardin", "maternal", "infantes"], source: ["kindergarten"] },
  { category: "education_technical", type: "school", terms: ["tecnica", "tecnico"] },
  { category: "education_secondary", type: "school", terms: ["secundaria", "bachiller" ] },
  { category: "education_primary", type: "school", terms: ["primaria", "eep"] },
  { category: "education_university", type: "university", terms: ["universidad", "universitario", "facultad"], source: ["university"] },
  { category: "education_school", type: "school", terms: ["escuela", "colegio", "instituto"], source: ["school"] },
  { category: "health_caps", type: "primary_care_center", terms: ["caps", "centro salud", "atencion primaria"], source: ["primary_care_center"] },
  { category: "health_hospital", type: "hospital", terms: ["hospital", "sanatorio"], source: ["hospital"] },
  { category: "health_clinic", type: "health_center", terms: ["clinica", "salita", "sala salud"] },
  { category: "security_fire_station", type: "institution", terms: ["bomberos", "cuartel"], source: ["fire_station"] },
  { category: "security_civil_defense", type: "institution", terms: ["defensa civil"] },
  { category: "security_police", type: "institution", terms: ["comisaria", "policia", "destacamento"], source: ["police"] },
  { category: "public_waterfront", type: "public_space", terms: ["costanera", "paseo costero"] },
  { category: "public_square", type: "square", terms: ["plaza"], source: ["square"] },
  { category: "public_park", type: "public_space", terms: ["parque", "espacio verde", "boulevard"], source: ["park"] },
  { category: "municipality_delegation", type: "municipal_office", terms: ["delegacion"] },
  { category: "municipality_secretariat", type: "municipal_office", terms: ["secretaria", "municipalidad", "dependencia"], source: ["municipal_office"] },
  { category: "transport_station", type: "station", terms: ["estacion", "terminal"], source: ["station"] },
  { category: "community_library", type: "institution", terms: ["biblioteca", "library"] },
  { category: "community_cultural_center", type: "institution", terms: ["centro cultural", "casa cultura", "museo", "teatro", "community centre", "community_centre"] },
  { category: "community_senior_center", type: "organization", terms: ["centro jubilados", "adultos mayores", "senior centre", "social facility"] },
  { category: "organization_neighborhood_association", type: "organization", terms: ["sociedad fomento", "asociacion vecinal", "centro vecinal"] },
  { category: "government_provincial_office", type: "institution", terms: ["oficina provincial", "dependencia provincial", "gobierno provincia"] },
  { category: "government_national_office", type: "institution", terms: ["oficina nacional", "dependencia nacional", "anses", "pami", "afip", "renaper"] },
  { category: "public_reserve", type: "public_space", terms: ["reserva natural", "area protegida", "protected area"] },
  { category: "religious_place", type: "religious_place", terms: ["iglesia", "parroquia", "capilla", "templo"] },
  { category: "organization", type: "organization", terms: ["ong", "asociacion", "sociedad fomento", "fundacion"] },
];

const directSource: Record<string, TerritorialCategoryId> = {
  municipality: "municipality", locality: "locality", neighborhood: "neighborhood",
  point_of_interest: "point_of_interest",
};

export class TerritorialClassificationEngine {
  classify(entity: TerritorialEntity): ClassificationSuggestion {
    const sourceCategory = String(entity.metadata.sourceCategory ?? entity.category);
    const properties = entity.metadata.sourceProperties && typeof entity.metadata.sourceProperties === "object"
      ? JSON.stringify(entity.metadata.sourceProperties) : "";
    const nameEvidence = normalize(entity.name);
    const evidence = normalize(`${entity.name} ${entity.tags.join(" ")} ${properties}`);
    for (const rule of mapping) {
      const nameMatch = rule.terms.some((term) => (rule.nameOnly ? nameEvidence : evidence).includes(normalize(term)));
      const sourceMatch = rule.source?.includes(sourceCategory) ?? false;
      if (nameMatch || sourceMatch) return {
        category: rule.category,
        type: rule.type,
        confidence: nameMatch && sourceMatch ? 0.98 : nameMatch ? 0.9 : 0.82,
        reason: nameMatch ? `Nombre, tags o contexto coinciden con ${territorialTaxonomy[rule.category].label}.` : `Categoría de fuente ${sourceCategory}.`,
        originalCategory: sourceCategory,
      };
    }
    const category = directSource[sourceCategory] ?? "point_of_interest";
    return { category, type: entity.type, confidence: directSource[sourceCategory] ? 0.9 : 0.45, reason: directSource[sourceCategory] ? "Categoría territorial directa." : "Sin evidencia suficiente para una categoría específica.", originalCategory: sourceCategory };
  }

  apply(entity: TerritorialEntity): TerritorialEntity {
    const suggestion = this.classify(entity);
    return {
      ...entity,
      type: suggestion.type,
      category: suggestion.category,
      subcategory: territorialTaxonomy[suggestion.category].label,
      metadata: { ...entity.metadata, sourceCategory: suggestion.originalCategory, classification: suggestion },
    };
  }
}
