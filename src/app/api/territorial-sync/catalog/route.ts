import { NextResponse } from "next/server";

export const runtime = "nodejs";

const catalogs = new Set([
  "https://catalogo.datos.gba.gob.ar/api/3/action",
  "https://datos.gob.ar/api/3/action",
]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const catalog = url.searchParams.get("catalog")?.replace(/\/$/, "");
  const query = url.searchParams.get("query")?.trim();
  if (!catalog || !catalogs.has(catalog) || !query) {
    return NextResponse.json({ error: "Catálogo o consulta no permitidos." }, { status: 400 });
  }
  const action = query === "establecimientos-educativos"
    ? `${catalog}/package_show?id=${encodeURIComponent(query)}`
    : `${catalog}/package_search?q=${encodeURIComponent(query)}&rows=20`;
  try {
    const response = await fetch(action, {
      signal: AbortSignal.timeout(30_000),
      headers: { Accept: "application/json", "User-Agent": "ATIY-Territorial-Data-Sync/1.0" },
      cache: "no-store",
    });
    const payload = await response.json();
    if (!response.ok || payload.success === false) {
      return NextResponse.json({ error: `El catálogo respondió HTTP ${response.status}.` }, { status: 502 });
    }
    if (query === "establecimientos-educativos" && payload.result) {
      payload.result = { results: [payload.result] };
    }
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "No se pudo consultar el catálogo.",
    }, { status: 502 });
  }
}
