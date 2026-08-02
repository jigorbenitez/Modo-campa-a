import type { TerritorialEntity } from "@/features/territorial-engine/domain";
import type { EnrichmentCandidate, EnrichmentField, EnrichmentProvider } from "../domain/enrichment";

const compatiblePhotoLicenses = /cc0|cc by|public domain|dominio p[uú]blico/i;

function text(properties: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = properties[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
}

function source(entity: TerritorialEntity, now: string) {
  return {
    name: String(entity.metadata.source ?? "Fuente pública"),
    url: typeof entity.metadata.sourceUrl === "string" ? entity.metadata.sourceUrl : undefined,
    license: String(entity.metadata.license ?? "Licencia no informada"),
    retrievedAt: now,
    confidence: entity.metadata.confidence === "high" ? 0.95 : entity.metadata.confidence === "medium" ? 0.8 : 0.65,
    externalId: entity.id,
  };
}

export class PublicMetadataEnrichmentProvider implements EnrichmentProvider {
  readonly id = "public-source-metadata";

  enrich(entity: TerritorialEntity, now: string): EnrichmentCandidate[] {
    const properties = (entity.metadata.sourceProperties ?? {}) as Record<string, unknown>;
    const candidates: Array<[EnrichmentField, unknown, unknown, string]> = [
      ["address", entity.address?.formatted, text(properties, "addr:full", "address", "direccion"), "Dirección declarada por la fuente"],
      ["street", entity.address?.street, text(properties, "addr:street", "calle"), "Calle declarada por la fuente"],
      ["number", entity.address?.number, text(properties, "addr:housenumber", "altura", "numero"), "Numeración declarada por la fuente"],
      ["postalCode", entity.address?.postalCode, text(properties, "addr:postcode", "postal_code", "codigo_postal"), "Código postal declarado por la fuente"],
      ["locality", entity.localityName, text(properties, "addr:city", "localidad", "locality"), "Localidad declarada por la fuente"],
      ["neighborhood", entity.neighborhoodName, text(properties, "addr:suburb", "barrio", "neighbourhood"), "Barrio declarado por la fuente"],
      ["electoralCircuit", entity.metadata.electoralCircuit, text(properties, "circuito", "electoral_circuit"), "Circuito declarado por la fuente"],
      ["phone", entity.phone, text(properties, "contact:phone", "phone", "telefono"), "Teléfono público"],
      ["email", entity.email, text(properties, "contact:email", "email", "correo"), "Email público"],
      ["website", entity.website, text(properties, "contact:website", "website", "url"), "Sitio web público"],
      ["openingHours", entity.openingHours, text(properties, "opening_hours", "horarios"), "Horario publicado"],
      ["responsibleOrganization", entity.metadata.responsibleOrganization, text(properties, "operator", "operator:type", "gestion", "dependencia"), "Organismo responsable publicado"],
    ];
    const license = String(entity.metadata.license ?? "");
    const photo = text(properties, "image", "wikimedia_commons", "photo");
    if (photo && compatiblePhotoLicenses.test(license)) candidates.push(["photo", entity.metadata.photo, { url: photo, author: text(properties, "image:author", "author"), license }, "Fotografía con licencia compatible"]);
    const socialProfiles = ["facebook", "instagram", "twitter", "youtube"].flatMap((network) => {
      const value = text(properties, `contact:${network}`, network);
      return value ? [{ network, url: value, verifiedBy: entity.metadata.source }] : [];
    });
    if (socialProfiles.length) candidates.push(["socialProfiles", entity.metadata.socialProfiles, socialProfiles, "Perfiles publicados por la fuente institucional"]);
    const institutionalDetails = this.institutionalDetails(entity, properties);
    if (Object.keys(institutionalDetails).length) candidates.push(["institutionalDetails", entity.metadata.institutionalDetails, institutionalDetails, "Atributos específicos publicados por la fuente"]);
    return candidates.flatMap(([field, previousValue, proposedValue, reason]) => proposedValue === undefined ? [] : [{
      id: `${entity.id}:${field}:${this.id}`,
      entityId: entity.id,
      field,
      previousValue,
      proposedValue,
      status: previousValue === undefined || previousValue === "" ? "applied" : JSON.stringify(previousValue) === JSON.stringify(proposedValue) ? "rejected" : "conflict",
      source: source(entity, now),
      reason,
    }]);
  }

  private institutionalDetails(entity: TerritorialEntity, properties: Record<string, unknown>) {
    const keysByType: Record<string, string[]> = {
      school: ["level", "nivel", "management", "gestion", "orientation", "modalidad"],
      kindergarten: ["level", "nivel", "management", "gestion", "modalidad"],
      hospital: ["healthcare:speciality", "emergency", "guardia"],
      primary_care_center: ["healthcare:speciality", "services", "servicios"],
      club: ["sport", "disciplines", "disciplinas"],
      square: ["playground", "toilets", "lit", "sport"],
    };
    return Object.fromEntries((keysByType[entity.type] ?? []).flatMap((key) => properties[key] === undefined ? [] : [[key, properties[key]]]));
  }
}
