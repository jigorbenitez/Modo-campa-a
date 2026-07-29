import { NextResponse } from "next/server";

export const runtime = "nodejs";

const allowedHosts = new Set([
  "apis.datos.gob.ar",
  "datos.gob.ar",
  "www.datos.gob.ar",
  "catalogo.datos.gba.gob.ar",
  "overpass-api.de",
  "overpass.kumi.systems",
  "ide.ign.gob.ar",
  "wms.ign.gob.ar",
  "www.ign.gob.ar",
  "services6.arcgis.com",
]);
const maximumBytes = 50 * 1024 * 1024;

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as { url?: string } | null;
  if (!payload?.url) return NextResponse.json({ error: "Falta la URL del dataset." }, { status: 400 });

  let url: URL;
  try {
    url = new URL(payload.url);
  } catch {
    return NextResponse.json({ error: "URL de dataset inválida." }, { status: 400 });
  }
  if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)) {
    return NextResponse.json({ error: "La fuente no pertenece a un proveedor público permitido." }, { status: 403 });
  }

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(60_000),
      headers: {
        Accept: "application/geo+json, application/json, text/csv, application/octet-stream",
        "User-Agent": "ATIY-Territorial-Data-Sync/1.0",
      },
      cache: "no-store",
    });
    if (!response.ok) {
      return NextResponse.json({ error: `La fuente respondió HTTP ${response.status}.` }, { status: 502 });
    }
    const declaredSize = Number(response.headers.get("content-length") ?? 0);
    if (declaredSize > maximumBytes) {
      return NextResponse.json({ error: "El dataset supera el límite de 50 MB." }, { status: 413 });
    }
    const content = await response.arrayBuffer();
    if (content.byteLength > maximumBytes) {
      return NextResponse.json({ error: "El dataset supera el límite de 50 MB." }, { status: 413 });
    }
    return new Response(content, {
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
        "X-ATIY-Source": url.hostname,
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "No se pudo descargar la fuente pública.",
    }, { status: 502 });
  }
}
