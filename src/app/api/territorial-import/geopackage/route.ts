import { NextResponse } from "next/server";
import { ServerGeoPackageParser } from "@/features/data-sync/infrastructure/geopackage-parser.server";
import type { DatasetCategory, DiscoveredDataset } from "@/features/data-sync/domain";

export const runtime = "nodejs";

const allowedCategories = new Set<DatasetCategory>([
  "municipality", "locality", "neighborhood", "electoral_circuit", "school", "kindergarten",
  "university", "hospital", "primary_care_center", "police", "fire_station", "club", "square",
  "park", "station", "main_street", "municipal_office", "public_institution", "point_of_interest",
]);

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const category = String(form.get("category") ?? "point_of_interest") as DatasetCategory;
  const sourceUrl = String(form.get("sourceUrl") ?? "");
  if (!(file instanceof File)) return NextResponse.json({ error: "Falta el archivo GeoPackage." }, { status: 400 });
  if (!allowedCategories.has(category)) return NextResponse.json({ error: "Categoría territorial inválida." }, { status: 400 });
  if (!sourceUrl.startsWith("https://")) return NextResponse.json({ error: "La fuente pública HTTPS es obligatoria." }, { status: 400 });
  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: "El archivo supera el límite de 50 MB." }, { status: 413 });

  const dataset: DiscoveredDataset = {
    id: `manual-geopackage-${file.name}`,
    connectorId: "manual-verified-source",
    name: file.name,
    category,
    downloadUrl: sourceUrl,
    sourcePageUrl: sourceUrl,
    publisher: String(form.get("publisher") ?? "Fuente pública declarada"),
    license: String(form.get("license") ?? "Sin licencia declarada"),
    format: "geopackage",
    version: String(form.get("version") ?? new Date().toISOString().slice(0, 10)),
    confidence: "medium",
  };

  try {
    const features = await new ServerGeoPackageParser().parse(await file.arrayBuffer(), dataset);
    return NextResponse.json({
      dataset,
      totalRows: features.length,
      validRows: features.filter((feature) => feature.geometry).length,
      preview: features.slice(0, 25),
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "No se pudo procesar el GeoPackage.",
    }, { status: 422 });
  }
}
