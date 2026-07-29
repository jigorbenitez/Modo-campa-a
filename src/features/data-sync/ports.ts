import type {
  DatasetVersion, DiscoveredDataset, MunicipalitySelection, NormalizedFeature,
  SyncFrequency, TerritorialSyncRun,
} from "./domain";

export interface TerritorialDatasetConnector {
  readonly id: string;
  discover(selection: MunicipalitySelection, signal?: AbortSignal): Promise<DiscoveredDataset[]>;
}

export interface DatasetDownloader {
  download(dataset: DiscoveredDataset, signal?: AbortSignal): Promise<ArrayBuffer>;
}

export interface DatasetParser {
  supports(format: DiscoveredDataset["format"]): boolean;
  parse(content: ArrayBuffer, dataset: DiscoveredDataset): Promise<NormalizedFeature[]>;
}

export interface TerritorialFilter {
  filter(features: NormalizedFeature[], selection: MunicipalitySelection): Promise<NormalizedFeature[]>;
}

export interface SyncRepository {
  getLatestVersion(municipalityId: string, datasetId: string): Promise<DatasetVersion | null>;
  saveVersion(version: DatasetVersion): Promise<void>;
  applyChanges(municipalityId: string, features: NormalizedFeature[], removedIds: string[]): Promise<void>;
  saveRun(run: TerritorialSyncRun): Promise<void>;
  listRuns(municipalityId: string): Promise<TerritorialSyncRun[]>;
}

export interface SyncScheduleRepository {
  get(municipalityId: string): Promise<{ frequency: SyncFrequency; nextRunAt: string | null }>;
  save(municipalityId: string, frequency: SyncFrequency, nextRunAt: string | null): Promise<void>;
}

