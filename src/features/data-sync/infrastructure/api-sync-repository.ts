import type { DatasetVersion, NormalizedFeature, TerritorialSyncRun } from "../domain";
import type { SyncRepository } from "../ports";

export class ApiSyncRepository implements SyncRepository {
  private async call<T>(action: string, payload: Record<string, unknown>): Promise<T> {
    const response = await fetch("/api/territorial-sync/repository", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
    const data = await response.json().catch(() => null) as { data?: T; error?: string } | null;
    if (!response.ok) throw new Error(data?.error ?? `Repositorio territorial HTTP ${response.status}.`);
    return data?.data as T;
  }
  getLatestVersion(municipalityId: string, datasetId: string) {
    return this.call<DatasetVersion | null>("getLatestVersion", { municipalityId, datasetId });
  }
  async saveVersion(version: DatasetVersion) {
    await this.call("saveVersion", { version });
  }
  async applyChanges(municipalityId: string, features: NormalizedFeature[], removedIds: string[]) {
    await this.call("applyChanges", { municipalityId, features, removedIds });
  }
  async saveRun(run: TerritorialSyncRun) {
    await this.call("saveRun", { run });
  }
  listRuns(municipalityId: string) {
    return this.call<TerritorialSyncRun[]>("listRuns", { municipalityId });
  }
  listFeatures(municipalityId: string) {
    return this.call<NormalizedFeature[]>("listFeatures", { municipalityId });
  }
}
