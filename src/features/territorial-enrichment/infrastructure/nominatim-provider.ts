import type { TerritorialEntity } from "@/features/territorial-engine/domain";
import type { EnrichmentCandidate, EnrichmentProvider } from "../domain/enrichment";

type NominatimResult = { display_name?: string; licence?: string; osm_type?: string; osm_id?: number; address?: Record<string, string> };

/** Proveedor acotado y secuencial para respetar el máximo público de 1 req/s. */
export class NominatimReverseGeocodingProvider implements EnrichmentProvider {
  readonly id = "nominatim-reverse";
  private queued = Promise.resolve();
  private accepted = 0;
  constructor(private readonly limit = 5) {}

  enrich(entity: TerritorialEntity, now: string): Promise<EnrichmentCandidate[]> {
    if (entity.address?.formatted || entity.latitude === undefined || entity.longitude === undefined || this.accepted >= this.limit) return Promise.resolve([]);
    this.accepted += 1;
    const task = this.queued.then(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const url = new URL("https://nominatim.openstreetmap.org/reverse");
      url.search = new URLSearchParams({ format: "jsonv2", lat: String(entity.latitude), lon: String(entity.longitude), addressdetails: "1", zoom: "18" }).toString();
      const response = await fetch(url, { headers: { "User-Agent": "ATIY Territorial Enrichment/1.0 (https://atiy.vercel.app)", "Accept-Language": "es-AR,es" } });
      if (!response.ok) return [];
      const result = await response.json() as NominatimResult;
      if (!result.display_name) return [];
      const source = { name: "OpenStreetMap Nominatim", url: url.toString(), license: result.licence ?? "ODbL 1.0", retrievedAt: now, confidence: 0.72, externalId: result.osm_id ? `${result.osm_type}-${result.osm_id}` : undefined };
      const address = result.address ?? {};
      const values = [
        ["address", result.display_name], ["street", address.road], ["number", address.house_number], ["postalCode", address.postcode],
        ["locality", address.city ?? address.town ?? address.village], ["neighborhood", address.suburb ?? address.neighbourhood],
      ] as const;
      return values.flatMap(([field, proposedValue]) => proposedValue ? [{ id: `${entity.id}:${field}:${this.id}`, entityId: entity.id, field, previousValue: undefined, proposedValue, status: "applied" as const, source, reason: "Geocodificación inversa sobre coordenada pública" }] : []);
    });
    this.queued = task.then(() => undefined, () => undefined);
    return task;
  }
}
