import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Actividad,
  Barrio,
  Compromiso,
  Documento,
  Institucion,
  Oportunidad,
  Persona,
  Problema,
  Propuesta,
} from "@/domain/entities";
import type {
  ActividadQuery,
  BarrioQuery,
  CompromisoQuery,
  DocumentoQuery,
  InstitucionQuery,
  OportunidadQuery,
  PersonaQuery,
  ProblemaQuery,
  PropuestaQuery,
} from "@/domain/repositories";
import { SupabaseRepository } from "./supabase-repository";

export function createSupabaseRepositories(client: SupabaseClient) {
  return {
    actividades: new SupabaseRepository<Actividad, ActividadQuery>(client, "activities"),
    barrios: new SupabaseRepository<Barrio, BarrioQuery>(client, "neighborhoods", "name"),
    problemas: new SupabaseRepository<Problema, ProblemaQuery>(client, "problems"),
    oportunidades: new SupabaseRepository<Oportunidad, OportunidadQuery>(client, "opportunities"),
    compromisos: new SupabaseRepository<Compromiso, CompromisoQuery>(client, "commitments"),
    propuestas: new SupabaseRepository<Propuesta, PropuestaQuery>(client, "proposals"),
    instituciones: new SupabaseRepository<Institucion, InstitucionQuery>(client, "institutions", "name"),
    personas: new SupabaseRepository<Persona, PersonaQuery>(client, "persons", "name"),
    documentos: new SupabaseRepository<Documento, DocumentoQuery>(client, "documents"),
  };
}

export * from "./supabase-repository";
