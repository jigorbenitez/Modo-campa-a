import type {
  DatasetSyncResult, DatasetVersion, DiscoveredDataset, MunicipalitySelection,
  NormalizedFeature, SyncCoverage, SyncDelta, SyncIssue, TerritorialSyncRun,
} from "../domain";
import type {
  DatasetDownloader, DatasetParser, SyncRepository, TerritorialDatasetConnector, TerritorialFilter,
} from "../ports";

function hash(value: string): string {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(16).padStart(8, "0");
}

export function calculateDelta(previous: NormalizedFeature[], current: NormalizedFeature[]): SyncDelta {
  const previousById = new Map(previous.map((feature) => [feature.externalId, feature]));
  const currentById = new Map(current.map((feature) => [feature.externalId, feature]));
  const added: NormalizedFeature[] = [];
  const updated: NormalizedFeature[] = [];
  let unchanged = 0;
  for (const feature of current) {
    const before = previousById.get(feature.externalId);
    if (!before) added.push(feature);
    else if (before.fingerprint !== feature.fingerprint) updated.push(feature);
    else unchanged += 1;
  }
  return {
    added,
    updated,
    removed: previous.filter((feature) => !currentById.has(feature.externalId)),
    unchanged,
  };
}

function coverage(results: DatasetSyncResult[], checkedAt: string): SyncCoverage[] {
  const required: SyncCoverage["category"][] = [
    "municipality", "locality", "neighborhood", "electoral_circuit", "school", "kindergarten",
    "university", "hospital", "primary_care_center", "police", "fire_station", "club", "square",
    "park", "station", "main_street", "municipal_office", "public_institution", "point_of_interest",
  ];
  const categories = new Map<string, { loaded: number; sources: Set<string> }>();
  for (const result of results) {
    const entry = categories.get(result.dataset.category) ?? { loaded: 0, sources: new Set<string>() };
    entry.loaded += result.delta.added.length + result.delta.updated.length + result.delta.unchanged;
    entry.sources.add(result.dataset.publisher);
    categories.set(result.dataset.category, entry);
  }
  return required.map((category) => {
    const value = categories.get(category);
    return {
    category,
    loaded: value?.loaded ?? 0,
    estimated: null,
    percentage: null,
    source: value ? [...value.sources].join(", ") : null,
    checkedAt,
    status: value && value.loaded > 0 ? "measured" : "pending_manual",
  };
  });
}

export class TerritorialDataSyncEngine {
  private readonly connectors: TerritorialDatasetConnector[];
  private readonly downloader: DatasetDownloader;
  private readonly parsers: DatasetParser[];
  private readonly territorialFilter: TerritorialFilter;
  private readonly repository: SyncRepository;
  private readonly now: () => Date;

  constructor(
    connectors: TerritorialDatasetConnector[],
    downloader: DatasetDownloader,
    parsers: DatasetParser[],
    territorialFilter: TerritorialFilter,
    repository: SyncRepository,
    now: () => Date = () => new Date(),
  ) {
    this.connectors = connectors;
    this.downloader = downloader;
    this.parsers = parsers;
    this.territorialFilter = territorialFilter;
    this.repository = repository;
    this.now = now;
  }

  async synchronize(selection: MunicipalitySelection, signal?: AbortSignal): Promise<TerritorialSyncRun> {
    const startedAt = this.now().toISOString();
    const discoveries = await Promise.allSettled(
      this.connectors.map((connector) => connector.discover(selection, signal)),
    );
    const datasets = discoveries.flatMap((result) => result.status === "fulfilled" ? result.value : []);
    const discoveryFailures: DatasetSyncResult[] = discoveries.flatMap((result, index) => {
      if (result.status === "fulfilled") return [];
      const connector = this.connectors[index];
      const message = result.reason instanceof Error ? result.reason.message : "No se pudo consultar la fuente.";
      return [{
        dataset: {
          id: `discovery-${connector.id}-${selection.municipalityId}`,
          connectorId: connector.id,
          name: `Conectividad de ${connector.id}`,
          category: "point_of_interest",
          downloadUrl: "",
          sourcePageUrl: "",
          publisher: connector.id,
          license: "No verificada: la fuente no respondió",
          format: "geojson",
          version: startedAt.slice(0, 10),
          confidence: "low",
        },
        status: "unavailable" as const,
        delta: { added: [], updated: [], removed: [], unchanged: 0 },
        imported: 0,
        discarded: 0,
        issues: [{ code: "discovery_failed", message, severity: "error" as const }],
      }];
    });
    const results = [
      ...await Promise.all(datasets.map((dataset) => this.synchronizeDataset(selection, dataset, signal))),
      ...discoveryFailures,
    ];
    const finishedAt = this.now().toISOString();
    const run: TerritorialSyncRun = {
      id: `sync-${selection.municipalityId}-${startedAt}`,
      municipalityId: selection.municipalityId,
      startedAt,
      finishedAt,
      status: results.some((item) => item.status === "failed" || item.status === "unavailable")
        ? (results.some((item) => item.status !== "failed" && item.status !== "unavailable") ? "partial" : "failed")
        : "completed",
      results,
      coverage: coverage(results, finishedAt),
    };
    await this.repository.saveRun(run);
    return run;
  }

  private async synchronizeDataset(
    selection: MunicipalitySelection,
    dataset: DiscoveredDataset,
    signal?: AbortSignal,
  ): Promise<DatasetSyncResult> {
    const emptyDelta = { added: [], updated: [], removed: [], unchanged: 0 };
    const parser = this.parsers.find((candidate) => candidate.supports(dataset.format));
    if (!parser) return {
      dataset, status: "failed", delta: emptyDelta, imported: 0, discarded: 0,
      issues: [{ code: "unsupported_format", message: `No hay parser habilitado para ${dataset.format}.`, severity: "error" }],
    };
    try {
      const content = await this.downloadWithRetry(dataset, signal);
      const parsed = await parser.parse(content, dataset);
      const valid = parsed.filter((feature) => feature.externalId && feature.name && feature.geometry);
      const filtered = await this.territorialFilter.filter(valid, selection);
      const deduplicated = [...new Map(filtered.map((feature) => [feature.fingerprint, feature])).values()];
      const previous = await this.repository.getLatestVersion(selection.municipalityId, dataset.id);
      const delta = calculateDelta(previous?.features ?? [], deduplicated);
      const issues: SyncIssue[] = [];
      if (filtered.length !== parsed.length) issues.push({
        code: "outside_municipality",
        message: `${parsed.length - filtered.length} registros fueron descartados por quedar fuera del municipio.`,
        severity: "warning",
      });
      const version: DatasetVersion = {
        id: `${dataset.id}-${dataset.version}-${hash(JSON.stringify(deduplicated.map((item) => item.fingerprint)))}`,
        municipalityId: selection.municipalityId,
        dataset,
        checkedAt: this.now().toISOString(),
        checksum: hash(new TextDecoder().decode(content)),
        features: deduplicated,
        errors: issues,
      };
      await this.repository.applyChanges(
        selection.municipalityId,
        [...delta.added, ...delta.updated],
        delta.removed.map((feature) => feature.externalId),
      );
      await this.repository.saveVersion(version);
      return {
        dataset,
        status: delta.added.length || delta.updated.length || delta.removed.length ? "updated" : "unchanged",
        delta,
        imported: delta.added.length + delta.updated.length,
        discarded: parsed.length - deduplicated.length,
        issues,
      };
    } catch (error) {
      return {
        dataset, status: "failed", delta: emptyDelta, imported: 0, discarded: 0,
        issues: [{ code: "sync_failed", message: error instanceof Error ? error.message : "Error de sincronización.", severity: "error" }],
      };
    }
  }

  private async downloadWithRetry(dataset: DiscoveredDataset, signal?: AbortSignal): Promise<ArrayBuffer> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try { return await this.downloader.download(dataset, signal); }
      catch (error) { lastError = error; }
    }
    throw lastError instanceof Error ? lastError : new Error("La descarga falló después de tres intentos.");
  }
}
