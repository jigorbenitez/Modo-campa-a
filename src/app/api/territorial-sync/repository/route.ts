import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import type { DatasetVersion, NormalizedFeature, TerritorialSyncRun } from "@/features/data-sync";

export const runtime = "nodejs";

type Payload = {
  action?: string;
  municipalityId?: string;
  datasetId?: string;
  version?: DatasetVersion;
  run?: TerritorialSyncRun;
  features?: NormalizedFeature[];
  removedIds?: string[];
};

export async function POST(request: Request) {
  const client = await createServerSupabaseClient();
  if (!client) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sesión requerida." }, { status: 401 });
  const payload = await request.json().catch(() => null) as Payload | null;
  if (!payload?.action) return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  try {
    switch (payload.action) {
      case "getLatestVersion":
        return NextResponse.json({ data: await latestVersion(client, payload.municipalityId!, payload.datasetId!) });
      case "saveVersion":
        await saveVersion(client, payload.version!);
        return NextResponse.json({ data: true });
      case "applyChanges":
        await applyChanges(client, payload.municipalityId!, payload.features ?? [], payload.removedIds ?? []);
        return NextResponse.json({ data: true });
      case "saveRun":
        await saveRun(client, payload.run!);
        return NextResponse.json({ data: true });
      case "listRuns":
        return NextResponse.json({ data: await listRuns(client, payload.municipalityId!) });
      case "listFeatures":
        return NextResponse.json({ data: await listFeatures(client, payload.municipalityId!) });
      default:
        return NextResponse.json({ error: "Acción no soportada." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error de persistencia." }, { status: 500 });
  }
}

type Client = NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>;

async function sourceId(client: Client, municipalityId: string, datasetId: string) {
  const { data, error } = await client.from("territorial_data_sources")
    .select("id").eq("municipality_id", municipalityId).eq("external_id", datasetId).maybeSingle();
  if (error) throw error;
  return (data as { id?: string } | null)?.id;
}

async function latestVersion(client: Client, municipalityId: string, datasetId: string): Promise<DatasetVersion | null> {
  const id = await sourceId(client, municipalityId, datasetId);
  if (!id) return null;
  const { data: version, error } = await client.from("territorial_dataset_versions")
    .select("id, version, checksum, downloaded_at, metadata")
    .eq("municipality_id", municipalityId).eq("source_id", id)
    .order("downloaded_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!version) return null;
  const { data: features, error: featureError } = await client.from("territorial_public_features")
    .select("external_id, category, name, geometry, properties, fingerprint")
    .eq("municipality_id", municipalityId).eq("source_id", id).eq("status", "active");
  if (featureError) throw featureError;
  const metadata = version.metadata as { dataset?: DatasetVersion["dataset"]; errors?: DatasetVersion["errors"] } | null;
  if (!metadata?.dataset) return null;
  return {
    id: version.id,
    municipalityId,
    dataset: metadata.dataset,
    checkedAt: version.downloaded_at,
    checksum: version.checksum,
    features: (features ?? []).map((row) => ({
      externalId: row.external_id,
      category: row.category,
      name: row.name,
      geometry: row.geometry,
      properties: row.properties,
      sourceDatasetId: datasetId,
      fingerprint: row.fingerprint,
    })),
    errors: metadata.errors ?? [],
  };
}

async function saveVersion(client: Client, version: DatasetVersion) {
  const dataset = version.dataset;
  const { data: source, error: sourceError } = await client.from("territorial_data_sources").upsert({
    municipality_id: version.municipalityId,
    external_id: dataset.id,
    connector_id: dataset.connectorId,
    name: dataset.name,
    category: dataset.category,
    publisher: dataset.publisher,
    source_url: dataset.sourcePageUrl,
    download_url: dataset.downloadUrl,
    license: dataset.license,
    format: dataset.format,
    confidence: dataset.confidence,
    updated_at: version.checkedAt,
  }, { onConflict: "municipality_id,external_id" }).select("id").single();
  if (sourceError) throw sourceError;
  const { error } = await client.from("territorial_dataset_versions").upsert({
    municipality_id: version.municipalityId,
    source_id: source.id,
    version: dataset.version,
    checksum: version.checksum,
    published_at: dataset.publishedAt ?? null,
    downloaded_at: version.checkedAt,
    record_count: version.features.length,
    discarded_count: version.errors.length,
    metadata: { dataset, errors: version.errors },
  }, { onConflict: "municipality_id,source_id,checksum" });
  if (error) throw error;
}

async function applyChanges(client: Client, municipalityId: string, features: NormalizedFeature[], removedIds: string[]) {
  const grouped = new Map<string, NormalizedFeature[]>();
  for (const feature of features) {
    grouped.set(feature.sourceDatasetId, [...(grouped.get(feature.sourceDatasetId) ?? []), feature]);
  }
  for (const [datasetId, datasetFeatures] of grouped) {
    const id = await sourceId(client, municipalityId, datasetId);
    if (!id) throw new Error(`No existe la fuente ${datasetId}.`);
    const { data: version, error: versionError } = await client.from("territorial_dataset_versions").select("id")
      .eq("municipality_id", municipalityId).eq("source_id", id)
      .order("downloaded_at", { ascending: false }).limit(1).single();
    if (versionError || !version) throw versionError ?? new Error(`No existe una versión para ${datasetId}.`);
    for (let offset = 0; offset < datasetFeatures.length; offset += 500) {
      const rows = datasetFeatures.slice(offset, offset + 500).map((feature) => ({
        municipality_id: municipalityId, source_id: id, version_id: version.id,
        external_id: feature.externalId, category: feature.category, name: feature.name,
        geometry: feature.geometry, properties: feature.properties, fingerprint: feature.fingerprint,
        status: "active", updated_at: new Date().toISOString(),
      }));
      const { error } = await client.from("territorial_public_features")
        .upsert(rows, { onConflict: "municipality_id,source_id,external_id" });
      if (error) throw error;
    }
  }
  if (removedIds.length) {
    const { error } = await client.from("territorial_public_features").update({ status: "removed" })
      .eq("municipality_id", municipalityId).in("external_id", removedIds);
    if (error) throw error;
  }
}

async function saveRun(client: Client, run: TerritorialSyncRun) {
  const { error } = await client.from("territorial_sync_runs").insert({
    municipality_id: run.municipalityId, status: run.status, started_at: run.startedAt,
    finished_at: run.finishedAt, datasets_used: run.results.length,
    imported_count: run.results.reduce((sum, result) => sum + result.imported, 0),
    discarded_count: run.results.reduce((sum, result) => sum + result.discarded, 0),
    summary: run, errors: run.results.flatMap((result) => result.issues),
  });
  if (error) throw error;
}

async function listRuns(client: Client, municipalityId: string): Promise<TerritorialSyncRun[]> {
  const { data, error } = await client.from("territorial_sync_runs").select("summary")
    .eq("municipality_id", municipalityId).order("started_at", { ascending: false }).limit(50);
  if (error) throw error;
  return (data ?? []).map((row) => row.summary as TerritorialSyncRun);
}

async function listFeatures(client: Client, municipalityId: string): Promise<NormalizedFeature[]> {
  const { data, error } = await client.from("territorial_public_features")
    .select("external_id, category, name, geometry, properties, fingerprint, territorial_data_sources(external_id)")
    .eq("municipality_id", municipalityId).eq("status", "active").limit(5000);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    externalId: row.external_id, category: row.category, name: row.name,
    geometry: row.geometry, properties: row.properties, fingerprint: row.fingerprint,
    sourceDatasetId: (row.territorial_data_sources as unknown as { external_id?: string } | null)?.external_id ?? "",
  }));
}
