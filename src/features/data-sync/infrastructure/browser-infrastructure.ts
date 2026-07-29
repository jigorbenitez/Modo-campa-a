import type { DatasetVersion, DiscoveredDataset, NormalizedFeature, TerritorialSyncRun } from "../domain";
import type { DatasetDownloader, SyncRepository, TerritorialFilter } from "../ports";

export class HttpDatasetDownloader implements DatasetDownloader {
  async download(dataset: DiscoveredDataset, signal?: AbortSignal): Promise<ArrayBuffer> {
    if (dataset.downloadUrl.startsWith("/")) {
      const response = await fetch(dataset.downloadUrl, { signal, cache: "no-store" });
      if (!response.ok) throw new Error(`La caché territorial respondió HTTP ${response.status}.`);
      return response.arrayBuffer();
    }
    const response = await fetch("/api/territorial-sync/download", {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: dataset.downloadUrl }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      throw new Error(payload?.error ?? `${dataset.publisher} respondió HTTP ${response.status}.`);
    }
    return response.arrayBuffer();
  }
}

function pointInsideBounds(geometry: Record<string, unknown> | null, bounds?: [number, number, number, number]) {
  if (!bounds || !geometry) return true;
  const coordinates = geometry.coordinates;
  if (geometry.type !== "Point" || !Array.isArray(coordinates)) return true;
  const [longitude, latitude] = coordinates as number[];
  const [west, south, east, north] = bounds;
  return longitude >= west && longitude <= east && latitude >= south && latitude <= north;
}

export class BoundsTerritorialFilter implements TerritorialFilter {
  async filter(
    features: NormalizedFeature[],
    selection: { municipalityName: string; provinceName: string; georefId?: string; bounds?: [number, number, number, number] },
  ) {
    const municipality = selection.municipalityName.toLocaleLowerCase("es-AR");
    const province = selection.provinceName.toLocaleLowerCase("es-AR");
    return features.filter((feature) => {
      if (feature.sourceDatasetId.startsWith("verified-hierarchy-")) return true;
      if (!pointInsideBounds(feature.geometry, selection.bounds)) return false;
      if (feature.sourceDatasetId.startsWith("osm-")) return Boolean(selection.bounds);
      const searchable = JSON.stringify(feature.properties).toLocaleLowerCase("es-AR");
      if (
        feature.sourceDatasetId.includes("4becb4b7-0a21-4fef-8f2c-30df7f345a01")
        || feature.sourceDatasetId.startsWith("ign-arcgis-")
      ) return searchable.includes(municipality);
      if (selection.georefId && searchable.includes(selection.georefId.toLocaleLowerCase("es-AR"))) return true;
      if (feature.category === "municipality") {
        return feature.name.toLocaleLowerCase("es-AR").includes(municipality)
          && searchable.includes(province);
      }
      return searchable.includes(municipality) && searchable.includes(province);
    });
  }
}

export class BrowserSyncRepository implements SyncRepository {
  private versionsKey(municipalityId: string) { return `atiy:data-sync:versions:${municipalityId}`; }
  private runsKey(municipalityId: string) { return `atiy:data-sync:runs:${municipalityId}`; }
  private read<T>(key: string): T[] {
    if (typeof localStorage === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(key) ?? "[]") as T[]; } catch { return []; }
  }
  private write<T>(key: string, value: T[]) {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, JSON.stringify(value));
  }
  async getLatestVersion(municipalityId: string, datasetId: string) {
    return this.read<DatasetVersion>(this.versionsKey(municipalityId))
      .filter((version) => version.dataset.id === datasetId)
      .sort((a, b) => b.checkedAt.localeCompare(a.checkedAt))[0] ?? null;
  }
  async saveVersion(version: DatasetVersion) {
    const key = this.versionsKey(version.municipalityId);
    this.write(key, [version, ...this.read<DatasetVersion>(key)].slice(0, 100));
  }
  async applyChanges(municipalityId: string, features: NormalizedFeature[], removedIds: string[]) {
    const key = `atiy:data-sync:features:${municipalityId}`;
    const current = new Map(this.read<NormalizedFeature>(key).map((item) => [item.externalId, item]));
    removedIds.forEach((id) => current.delete(id));
    features.forEach((feature) => current.set(feature.externalId, feature));
    this.write(key, [...current.values()]);
  }
  async saveRun(run: TerritorialSyncRun) {
    const key = this.runsKey(run.municipalityId);
    this.write(key, [run, ...this.read<TerritorialSyncRun>(key)].slice(0, 50));
  }
  async listRuns(municipalityId: string) {
    return this.read<TerritorialSyncRun>(this.runsKey(municipalityId));
  }
  async listFeatures(municipalityId: string) {
    return this.read<NormalizedFeature>(`atiy:data-sync:features:${municipalityId}`);
  }
}
