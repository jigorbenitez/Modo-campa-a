import "server-only";
import { GeoPackageAPI } from "@ngageoint/geopackage";
import type { DiscoveredDataset, NormalizedFeature, SyncFormat } from "../domain";
import type { DatasetParser } from "../ports";

function fingerprint(value: unknown) {
  const input = JSON.stringify(value);
  let result = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    result ^= input.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(16);
}

export class ServerGeoPackageParser implements DatasetParser {
  supports(format: SyncFormat) { return format === "geopackage"; }

  async parse(content: ArrayBuffer, dataset: DiscoveredDataset): Promise<NormalizedFeature[]> {
    const geopackage = await GeoPackageAPI.open(new Uint8Array(content));
    try {
      return geopackage.getFeatureTables().flatMap((table) =>
        [...geopackage.iterateGeoJSONFeatures(table)].map((feature, index) => {
          const properties = (feature.properties ?? {}) as Record<string, unknown>;
          const externalId = String(feature.id ?? properties.id ?? `${table}-${index}`);
          const name = String(properties.name ?? properties.nombre ?? externalId);
          const geometry = feature.geometry as unknown as Record<string, unknown> | null;
          return {
            externalId,
            category: dataset.category,
            name,
            geometry,
            properties: { ...properties, geopackageTable: table },
            sourceDatasetId: dataset.id,
            fingerprint: fingerprint({ externalId, geometry, properties }),
          };
        }),
      );
    } finally {
      geopackage.close();
    }
  }
}
