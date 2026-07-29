import { kml } from "@tmcw/togeojson";
import type { DatasetCategory, DiscoveredDataset, NormalizedFeature, SyncFormat } from "../domain";
import type { DatasetParser } from "../ports";

type GeoFeature = { id?: string | number; geometry?: Record<string, unknown> | null; properties?: Record<string, unknown> | null };
type GeoCollection = { type?: string; features?: GeoFeature[] };

function text(content: ArrayBuffer) { return new TextDecoder("utf-8", { fatal: false }).decode(content); }
function fingerprint(value: unknown) {
  const input = JSON.stringify(value);
  let result = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    result ^= input.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(16);
}
function normalized(features: GeoFeature[], dataset: DiscoveredDataset): NormalizedFeature[] {
  return features.map((feature, index) => {
    const properties = feature.properties ?? {};
    const externalId = String(feature.id ?? properties.id ?? properties.osm_id ?? `${dataset.id}-${index}`);
    const name = String(properties.name ?? properties.nombre ?? properties.descripcion ?? externalId);
    const value = { externalId, geometry: feature.geometry ?? null, properties };
    return {
      externalId,
      category: classify(properties, dataset.category),
      name,
      geometry: feature.geometry ?? null,
      properties,
      sourceDatasetId: dataset.id,
      fingerprint: fingerprint(value),
    };
  });
}
function classify(properties: Record<string, unknown>, fallback: DatasetCategory): DatasetCategory {
  const terms = `${properties.amenity ?? ""} ${properties.leisure ?? ""} ${properties.tipo ?? ""}`.toLowerCase();
  if (terms.includes("school")) return "school";
  if (terms.includes("kindergarten")) return "kindergarten";
  if (terms.includes("university")) return "university";
  if (terms.includes("hospital")) return "hospital";
  if (terms.includes("clinic") || terms.includes("doctors")) return "primary_care_center";
  if (terms.includes("police")) return "police";
  if (terms.includes("fire_station")) return "fire_station";
  if (terms.includes("park")) return "park";
  if (terms.includes("playground") || terms.includes("square")) return "square";
  return fallback;
}

export class GeoJsonParser implements DatasetParser {
  supports(format: SyncFormat) { return format === "geojson"; }
  async parse(content: ArrayBuffer, dataset: DiscoveredDataset) {
    const parsed = JSON.parse(text(content)) as GeoCollection;
    if (parsed.type !== "FeatureCollection" || !Array.isArray(parsed.features)) {
      throw new Error("El recurso no es un FeatureCollection GeoJSON válido.");
    }
    return normalized(parsed.features, dataset);
  }
}

export class CsvParser implements DatasetParser {
  supports(format: SyncFormat) { return format === "csv"; }
  async parse(content: ArrayBuffer, dataset: DiscoveredDataset) {
    const rows = text(content).replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
    const headers = rows.shift()?.split(",").map((item) => item.trim()) ?? [];
    const features: GeoFeature[] = rows.map((row) => {
      const values = row.split(",");
      const properties = Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""]));
      const latitudeValue = properties.latitud ?? properties.latitude ?? properties.lat;
      const longitudeValue = properties.longitud ?? properties.longitude ?? properties.lon;
      const latitude = latitudeValue === "" || latitudeValue == null ? Number.NaN : Number(latitudeValue);
      const longitude = longitudeValue === "" || longitudeValue == null ? Number.NaN : Number(longitudeValue);
      return {
        properties,
        geometry: Number.isFinite(latitude) && Number.isFinite(longitude)
          ? { type: "Point", coordinates: [longitude, latitude] }
          : null,
      };
    });
    return normalized(features, dataset);
  }
}

export class KmlParser implements DatasetParser {
  supports(format: SyncFormat) { return format === "kml"; }
  async parse(content: ArrayBuffer, dataset: DiscoveredDataset) {
    if (typeof DOMParser === "undefined") throw new Error("KML requiere un entorno con DOMParser.");
    const document = new DOMParser().parseFromString(text(content), "application/xml");
    if (document.querySelector("parsererror")) throw new Error("El archivo KML no es XML válido.");
    return normalized(kml(document).features as GeoFeature[], dataset);
  }
}

export class OsmJsonParser implements DatasetParser {
  supports(format: SyncFormat) { return format === "osmjson"; }
  async parse(content: ArrayBuffer, dataset: DiscoveredDataset) {
    const parsed = JSON.parse(text(content)) as {
      elements?: Array<{
        id: number;
        type: string;
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: Record<string, unknown>;
      }>;
    };
    if (!Array.isArray(parsed.elements)) throw new Error("La respuesta Overpass no contiene elementos.");
    const features: GeoFeature[] = parsed.elements.map((element) => {
      const latitude = element.lat ?? element.center?.lat;
      const longitude = element.lon ?? element.center?.lon;
      return {
        id: `${element.type}/${element.id}`,
        properties: { ...element.tags, osm_id: element.id, osm_type: element.type },
        geometry: Number.isFinite(latitude) && Number.isFinite(longitude)
          ? { type: "Point", coordinates: [longitude, latitude] }
          : null,
      };
    });
    return normalized(features, dataset);
  }
}

export class ShapefileParser implements DatasetParser {
  supports(format: SyncFormat) { return format === "shapefile"; }
  async parse(content: ArrayBuffer, dataset: DiscoveredDataset) {
    const shapefileLibrary = await import("shpjs");
    const result = await shapefileLibrary.default(content);
    const collections = Array.isArray(result) ? result : [result];
    return normalized(collections.flatMap((item) => item.features as GeoFeature[]), dataset);
  }
}

export class CompositeDatasetParser implements DatasetParser {
  private readonly parsers: DatasetParser[];
  constructor(parsers: DatasetParser[]) { this.parsers = parsers; }
  supports(format: SyncFormat) { return this.parsers.some((parser) => parser.supports(format)); }
  async parse(content: ArrayBuffer, dataset: DiscoveredDataset) {
    const parser = this.parsers.find((candidate) => candidate.supports(dataset.format));
    if (!parser) throw new Error(`Formato no soportado: ${dataset.format}.`);
    return parser.parse(content, dataset);
  }
}
