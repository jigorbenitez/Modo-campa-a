import type { DiscoveredDataset, MunicipalitySelection } from "../domain";
import type { TerritorialDatasetConnector } from "../ports";

export class GeoRefConnector implements TerritorialDatasetConnector {
  readonly id = "georef-argentina";
  async discover(selection: MunicipalitySelection): Promise<DiscoveredDataset[]> {
    const base = "https://apis.datos.gob.ar/georef/api";
    return [
      ["georef-municipality", "Municipio", "municipality", `${base}/municipios.geojson`],
      ["georef-localities", "Localidades", "locality", `${base}/localidades.geojson`],
    ].map(([id, name, category, downloadUrl]) => ({
      id: `${id}-${selection.municipalityId}`,
      connectorId: this.id,
      name: `${name} de ${selection.municipalityName}`,
      category: category as DiscoveredDataset["category"],
      downloadUrl,
      sourcePageUrl: "https://www.argentina.gob.ar/georef",
      publisher: "Datos Argentina / GeoRef",
      license: "CC BY 4.0",
      format: "geojson",
      version: new Date().toISOString().slice(0, 10),
      confidence: "verified",
    }));
  }
}

export class OpenStreetMapConnector implements TerritorialDatasetConnector {
  readonly id = "openstreetmap-overpass";
  async discover(selection: MunicipalitySelection): Promise<DiscoveredDataset[]> {
    if (!selection.bounds) return [];
    const [west, south, east, north] = selection.bounds;
    const query = `[out:json][timeout:60];(nwr["amenity"](${south},${west},${north},${east});nwr["leisure"](${south},${west},${north},${east});nwr["tourism"](${south},${west},${north},${east}););out center tags;`;
    return [{
      id: `osm-poi-${selection.municipalityId}`,
      connectorId: this.id,
      name: `Equipamiento y puntos de interés de ${selection.municipalityName}`,
      category: "point_of_interest",
      downloadUrl: `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      sourcePageUrl: "https://www.openstreetmap.org/copyright",
      publisher: "OpenStreetMap contributors",
      license: "ODbL 1.0",
      format: "osmjson",
      version: new Date().toISOString().slice(0, 10),
      confidence: "medium",
    }];
  }
}
