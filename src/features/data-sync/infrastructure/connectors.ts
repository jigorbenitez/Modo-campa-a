import type { DatasetCategory, DiscoveredDataset, MunicipalitySelection, SyncFormat } from "../domain";
import type { TerritorialDatasetConnector } from "../ports";

const today = () => new Date().toISOString().slice(0, 10);

function dataset(
  selection: MunicipalitySelection,
  connectorId: string,
  input: Omit<DiscoveredDataset, "connectorId" | "version"> & { version?: string },
): DiscoveredDataset {
  return { ...input, connectorId, version: input.version ?? today(), id: `${input.id}-${selection.municipalityId}` };
}

export class GeoRefConnector implements TerritorialDatasetConnector {
  readonly id = "georef-argentina";
  async discover(selection: MunicipalitySelection): Promise<DiscoveredDataset[]> {
    const base = "https://apis.datos.gob.ar/georef/api";
    return [
      dataset(selection, this.id, {
        id: "georef-municipality", name: `Municipio de ${selection.municipalityName}`,
        category: "municipality", downloadUrl: `${base}/municipios.geojson`,
        sourcePageUrl: "https://www.argentina.gob.ar/georef", publisher: "Datos Argentina / GeoRef",
        license: "CC BY 4.0", format: "geojson", confidence: "verified",
      }),
      dataset(selection, this.id, {
        id: "georef-localities", name: `Localidades de ${selection.municipalityName}`,
        category: "locality", downloadUrl: `${base}/localidades.geojson`,
        sourcePageUrl: "https://www.argentina.gob.ar/georef", publisher: "Datos Argentina / GeoRef",
        license: "CC BY 4.0", format: "geojson", confidence: "verified",
      }),
    ];
  }
}

type CkanResource = { id: string; name?: string; format?: string; url?: string; last_modified?: string };
type CkanPackage = {
  id: string; name: string; title?: string; license_title?: string; metadata_modified?: string;
  organization?: { title?: string }; resources?: CkanResource[];
};

function supportedFormat(value = ""): SyncFormat | null {
  const format = value.toLowerCase();
  if (format === "csv") return "csv";
  if (format === "geojson" || format === "json") return "geojson";
  if (format === "kml") return "kml";
  if (format === "gpkg" || format === "geopackage") return "geopackage";
  if (format === "shp" || format === "shapefile" || format === "zip") return "shapefile";
  return null;
}

function categoryFor(value: string): DatasetCategory {
  const text = value.toLocaleLowerCase("es-AR");
  if (text.includes("jard")) return "kindergarten";
  if (text.includes("escuel") || text.includes("educativ")) return "school";
  if (text.includes("hospital")) return "hospital";
  if (text.includes("caps") || text.includes("salud")) return "primary_care_center";
  if (text.includes("comisar") || text.includes("polic")) return "police";
  if (text.includes("bomber")) return "fire_station";
  if (text.includes("club")) return "club";
  if (text.includes("plaza")) return "square";
  if (text.includes("parque")) return "park";
  if (text.includes("estaci")) return "station";
  if (text.includes("calle") || text.includes("vial")) return "main_street";
  if (text.includes("municip")) return "municipal_office";
  return "public_institution";
}

abstract class CkanConnector implements TerritorialDatasetConnector {
  abstract readonly id: string;
  protected abstract readonly catalogUrl: string;
  protected abstract readonly publisher: string;
  protected abstract query(selection: MunicipalitySelection): string;

  async discover(selection: MunicipalitySelection, signal?: AbortSignal): Promise<DiscoveredDataset[]> {
    const url = new URL("/api/territorial-sync/catalog", window.location.origin);
    url.searchParams.set("catalog", this.catalogUrl);
    url.searchParams.set("query", this.query(selection));
    const response = await fetch(url, { signal, cache: "no-store" });
    if (!response.ok) throw new Error(`${this.publisher}: catálogo HTTP ${response.status}.`);
    const payload = await response.json() as { result?: { results?: CkanPackage[] } };
    return (payload.result?.results ?? []).flatMap((item) => {
      const resources = (item.resources ?? [])
        .map((resource) => ({ resource, format: supportedFormat(resource.format) }))
        .filter((entry): entry is { resource: CkanResource; format: SyncFormat } => Boolean(entry.format && entry.resource.url));
      const preferred = resources.find(({ format }) => format === "csv")
        ?? resources.find(({ format }) => format === "geojson")
        ?? resources[0];
      if (!preferred) return [];
      const { resource, format } = preferred;
      return [dataset(selection, this.id, {
        id: `${item.id}-${resource.id}`,
        name: resource.name || item.title || item.name,
        category: categoryFor(`${item.title ?? ""} ${resource.name ?? ""}`),
        downloadUrl: resource.url!,
        sourcePageUrl: `${this.catalogUrl.replace(/\/api\/3\/action\/?$/, "")}/dataset/${item.name}`,
        publisher: item.organization?.title || this.publisher,
        license: item.license_title || "Licencia informada por el catálogo",
        format,
        version: (resource.last_modified || item.metadata_modified || today()).slice(0, 10),
        confidence: "high",
      })];
    });
  }
}

export class BuenosAiresOpenDataConnector extends CkanConnector {
  readonly id = "buenos-aires-open-data";
  protected readonly catalogUrl = "https://catalogo.datos.gba.gob.ar/api/3/action";
  protected readonly publisher = "Datos Abiertos de la Provincia de Buenos Aires";
  protected query() { return "establecimientos-educativos"; }
}

export class DatosArgentinaConnector extends CkanConnector {
  readonly id = "datos-argentina-ckan";
  protected readonly catalogUrl = "https://datos.gob.ar/api/3/action";
  protected readonly publisher = "Datos Argentina";
  protected query(selection: MunicipalitySelection) { return `"${selection.municipalityName}"`; }
}

export class CompatibleCkanConnector extends CkanConnector {
  readonly id = "ckan-compatible";
  protected readonly catalogUrl = "https://catalogo.datos.gba.gob.ar/api/3/action";
  protected readonly publisher = "Catálogo CKAN compatible";
  protected query(selection: MunicipalitySelection) { return selection.municipalityName; }
}

export class ArcGisRestConnector implements TerritorialDatasetConnector {
  readonly id = "arcgis-rest";
  async discover(selection: MunicipalitySelection): Promise<DiscoveredDataset[]> {
    const where = `NAM='${selection.municipalityName.replaceAll("'", "''")}'`;
    return [dataset(selection, this.id, {
      id: "ign-arcgis-governments",
      name: `Gobierno local ${selection.municipalityName} (ArcGIS REST)`,
      category: "municipality",
      downloadUrl: `https://ide.ign.gob.ar/geoservicios/rest/services/ANIDA/org_politica/MapServer/275/query?where=${encodeURIComponent(where)}&outFields=*&returnGeometry=true&outSR=4326&f=geojson`,
      sourcePageUrl: "https://ide.ign.gob.ar/geoservicios/rest/services/ANIDA/org_politica/MapServer",
      publisher: "Instituto Geográfico Nacional",
      license: "Datos públicos IGN — atribución requerida",
      format: "geojson",
      confidence: "verified",
    })];
  }
}

export class IgnConnector implements TerritorialDatasetConnector {
  readonly id = "ign-official-download";
  async discover(selection: MunicipalitySelection): Promise<DiscoveredDataset[]> {
    return [dataset(selection, this.id, {
      id: "ign-municipalities",
      name: `Municipios IGN para validar ${selection.municipalityName}`,
      category: "municipality",
      downloadUrl: "https://www.ign.gob.ar/descargas/geodatos/municipio_geojson.zip",
      sourcePageUrl: "https://www.ign.gob.ar/NuestrasActividades/InformacionGeoespacial/CapasSIG",
      publisher: "Instituto Geográfico Nacional",
      license: "Datos públicos IGN — atribución requerida",
      format: "shapefile",
      confidence: "verified",
    })];
  }
}

export class OpenStreetMapConnector implements TerritorialDatasetConnector {
  readonly id = "openstreetmap-overpass";
  async discover(selection: MunicipalitySelection): Promise<DiscoveredDataset[]> {
    if (!selection.bounds) return [];
    const [west, south, east, north] = selection.bounds;
    const query = `[out:json][timeout:90];(nwr["amenity"](${south},${west},${north},${east});nwr["leisure"](${south},${west},${north},${east});nwr["tourism"](${south},${west},${north},${east});nwr["railway"="station"](${south},${west},${north},${east}););out center tags;`;
    return [dataset(selection, this.id, {
      id: "osm-poi", name: `Equipamiento y puntos de interés de ${selection.municipalityName}`,
      category: "point_of_interest",
      downloadUrl: `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      sourcePageUrl: "https://www.openstreetmap.org/copyright", publisher: "OpenStreetMap contributors",
      license: "ODbL 1.0", format: "osmjson", confidence: "medium",
    })];
  }
}

export class BundledVerifiedTerritoryConnector implements TerritorialDatasetConnector {
  readonly id = "atiy-verified-territorial-cache";
  async discover(selection: MunicipalitySelection): Promise<DiscoveredDataset[]> {
    if (selection.municipalityName.toLocaleLowerCase("es-AR") !== "san fernando") return [];
    return [dataset(selection, this.id, {
      id: "verified-hierarchy", name: `Jerarquía territorial verificada de ${selection.municipalityName}`,
      category: "locality", downloadUrl: "/data/san-fernando-territorial-hierarchy.geojson",
      sourcePageUrl: "https://www.openstreetmap.org/copyright",
      publisher: "ATIY, derivado de CNE y OpenStreetMap",
      license: "CC BY 4.0 / ODbL según capa de origen", format: "geojson",
      version: "2026-07-29", confidence: "verified",
    })];
  }
}

export const officialTerritorialConnectors = () => [
  new GeoRefConnector(),
  new BuenosAiresOpenDataConnector(),
  new DatosArgentinaConnector(),
  new CompatibleCkanConnector(),
  new ArcGisRestConnector(),
  new IgnConnector(),
  new OpenStreetMapConnector(),
  new BundledVerifiedTerritoryConnector(),
];
