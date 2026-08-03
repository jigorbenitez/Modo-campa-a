export const territorialTaxonomy = {
  municipality: { family: "Municipio", label: "Municipio", synonyms: ["municipalidad"] },
  locality: { family: "Territorio", label: "Localidad", synonyms: ["localidades"] },
  neighborhood: { family: "Territorio", label: "Barrio", synonyms: ["barrios"] },
  education_kindergarten: { family: "Educación", label: "Jardín", synonyms: ["jardin", "jardines", "jardin de infantes", "maternal"] },
  education_primary: { family: "Educación", label: "Primaria", synonyms: ["primaria", "escuela primaria", "eep"] },
  education_secondary: { family: "Educación", label: "Secundaria", synonyms: ["secundaria", "escuela secundaria", "ees"] },
  education_technical: { family: "Educación", label: "Técnica", synonyms: ["tecnica", "escuela tecnica", "et"] },
  education_university: { family: "Educación", label: "Universidad", synonyms: ["universidad", "universidades", "facultad"] },
  education_school: { family: "Educación", label: "Escuela", synonyms: ["escuela", "escuelas", "colegio", "instituto educativo"] },
  health_hospital: { family: "Salud", label: "Hospital", synonyms: ["hospital", "hospitales", "sanatorio"] },
  health_caps: { family: "Salud", label: "CAPS", synonyms: ["caps", "centro de atencion primaria", "centro de salud"] },
  health_clinic: { family: "Salud", label: "Sala", synonyms: ["sala", "salita", "clinica"] },
  sport_club: { family: "Deporte", label: "Club", synonyms: ["club", "clubes"] },
  sport_sports_center: { family: "Deporte", label: "Polideportivo", synonyms: ["polideportivo", "polideportivos", "poli"] },
  sport_municipal_field: { family: "Deporte", label: "Cancha municipal", synonyms: ["cancha", "campo de deportes"] },
  security_police: { family: "Seguridad", label: "Comisaría", synonyms: ["comisaria", "policia", "destacamento"] },
  security_fire_station: { family: "Seguridad", label: "Bomberos", synonyms: ["bombero", "bomberos", "cuartel"] },
  security_civil_defense: { family: "Seguridad", label: "Defensa Civil", synonyms: ["defensa civil", "emergencias"] },
  public_square: { family: "Espacio Público", label: "Plaza", synonyms: ["plaza", "plazas"] },
  public_park: { family: "Espacio Público", label: "Parque", synonyms: ["parque", "parques", "espacio verde"] },
  public_waterfront: { family: "Espacio Público", label: "Costanera", synonyms: ["costanera", "paseo costero"] },
  municipality_delegation: { family: "Municipio", label: "Delegación", synonyms: ["delegacion municipal", "delegaciones"] },
  municipality_secretariat: { family: "Municipio", label: "Secretaría", synonyms: ["secretaria", "dependencia municipal"] },
  transport_station: { family: "Transporte", label: "Estación", synonyms: ["estacion", "estaciones", "terminal"] },
  religious_place: { family: "Comunidad", label: "Lugar religioso", synonyms: ["iglesia", "parroquia", "capilla", "templo"] },
  organization: { family: "Comunidad", label: "Organización", synonyms: ["organizacion", "ong", "asociacion", "sociedad de fomento"] },
  community_library: { family: "Comunidad", label: "Biblioteca", synonyms: ["biblioteca", "bibliotecas"] },
  community_cultural_center: { family: "Comunidad", label: "Centro cultural", synonyms: ["centro cultural", "casa de la cultura", "museo", "teatro"] },
  community_senior_center: { family: "Comunidad", label: "Centro de jubilados", synonyms: ["centro de jubilados", "jubilados", "adultos mayores"] },
  organization_neighborhood_association: { family: "Comunidad", label: "Sociedad de fomento", synonyms: ["sociedad de fomento", "asociacion vecinal", "centro vecinal"] },
  government_provincial_office: { family: "Estado", label: "Oficina provincial", synonyms: ["oficina provincial", "dependencia provincial", "provincia"] },
  government_national_office: { family: "Estado", label: "Oficina nacional", synonyms: ["oficina nacional", "dependencia nacional", "nacion"] },
  public_reserve: { family: "Espacio Público", label: "Reserva", synonyms: ["reserva", "reserva natural", "area protegida"] },
  commerce: { family: "Economía", label: "Comercio", synonyms: ["comercio", "comercios", "local"] },
  point_of_interest: { family: "Otros", label: "Punto de interés", synonyms: ["punto de interes", "lugar"] },
} as const;

export type TerritorialCategoryId = keyof typeof territorialTaxonomy;

export function categoryLabel(category: string) {
  return territorialTaxonomy[category as TerritorialCategoryId]?.label ?? "Sin clasificar";
}

export function categorySearchTerms(category: string) {
  const item = territorialTaxonomy[category as TerritorialCategoryId];
  return item ? [item.family, item.label, ...item.synonyms].join(" ") : category;
}
