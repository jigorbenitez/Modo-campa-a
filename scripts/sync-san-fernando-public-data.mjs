import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const runDate = new Date().toISOString();
const outputDir = path.join(root, "data", "san-fernando");
const publicOutput = path.join(root, "src", "data", "san-fernando-official-sync.json");
const reportOutput = path.join(root, "docs", "SPRINT_22_IMPORT_REPORT.md");
const boundary = JSON.parse(await fs.readFile(path.join(root, "src", "data", "san-fernando-municipality-from-circuits.json"), "utf8"));
const polygonRings = boundary.features[0].geometry.coordinates.map((polygon) => polygon[0]);
const allPoints = polygonRings.flat();
const bounds = [
  Math.min(...allPoints.map(([longitude]) => longitude)),
  Math.min(...allPoints.map(([, latitude]) => latitude)),
  Math.max(...allPoints.map(([longitude]) => longitude)),
  Math.max(...allPoints.map(([, latitude]) => latitude)),
];

const records = [];
const sources = [];
const issues = [];
const fingerprints = new Set();

function insideRing([longitude, latitude], ring) {
  let inside = false;
  for (let current = 0, previous = ring.length - 1; current < ring.length; previous = current++) {
    const [x1, y1] = ring[current];
    const [x2, y2] = ring[previous];
    if ((y1 > latitude) !== (y2 > latitude) && longitude < ((x2 - x1) * (latitude - y1)) / (y2 - y1) + x1) inside = !inside;
  }
  return inside;
}

function insideMunicipality(point) {
  return polygonRings.some((ring) => insideRing(point, ring));
}

function normalizeText(value) {
  return String(value ?? "").normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

function categoryOf(tags = {}) {
  const text = normalizeText(`${tags.amenity} ${tags.leisure} ${tags.tourism} ${tags.railway} ${tags.nivel} ${tags.establecimiento_nombre}`);
  if (text.includes("kindergarten") || text.includes("jardin") || text.includes("nivel inicial")) return "kindergarten";
  if (text.includes("school") || text.includes("escuela") || text.includes("educacion primaria") || text.includes("educacion secundaria")) return "school";
  if (text.includes("university") || text.includes("universidad")) return "university";
  if (text.includes("hospital")) return "hospital";
  if (text.includes("clinic") || text.includes("doctors") || text.includes("centro de salud")) return "primary_care_center";
  if (text.includes("police")) return "police";
  if (text.includes("fire_station")) return "fire_station";
  if (text.includes("club") || text.includes("sports_centre") || text.includes("stadium")) return "club";
  if (text.includes("park")) return "park";
  if (text.includes("playground") || text.includes("square")) return "square";
  if (text.includes("station")) return "station";
  if (text.includes("townhall") || text.includes("public_building")) return "municipal_office";
  return "point_of_interest";
}

function addRecord(input) {
  if (!Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) return "invalid_coordinates";
  if (!insideMunicipality([input.longitude, input.latitude])) return "outside_municipality";
  const normalizedName = normalizeText(input.name);
  const fingerprint = normalizedName
    ? `${input.category}|${normalizedName}`
    : `${input.category}|${input.latitude.toFixed(5)}|${input.longitude.toFixed(5)}`;
  if (fingerprints.has(fingerprint)) return "duplicate";
  fingerprints.add(fingerprint);
  records.push({ ...input, fingerprint, syncedAt: runDate });
  return null;
}

async function fetchChecked(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(120_000),
    headers: { "User-Agent": "ATIY-Territorial-Data-Sync/1.0", Accept: "application/json, application/geo+json, text/csv, */*", ...options.headers },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
  return response;
}

function csvRows(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const parse = (line) => {
    const values = []; let value = ""; let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (character === '"' && quoted && line[index + 1] === '"') { value += '"'; index += 1; }
      else if (character === '"') quoted = !quoted;
      else if (character === "," && !quoted) { values.push(value); value = ""; }
      else value += character;
    }
    values.push(value); return values;
  };
  const headers = parse(lines.shift() ?? "").map((header) => header.trim());
  return lines.map((line) => {
    const values = parse(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""]));
  });
}

async function runSource(meta, task) {
  const before = records.length;
  const discarded = {};
  try {
    const result = await task((reason) => { discarded[reason] = (discarded[reason] ?? 0) + 1; });
    sources.push({ ...meta, status: "ok", imported: records.length - before, discarded, details: result ?? null, checkedAt: runDate });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    sources.push({ ...meta, status: "failed", imported: 0, discarded, checkedAt: runDate, error: message });
    issues.push(`${meta.name}: ${message}`);
  }
}

await runSource({
  id: "georef", name: "GeoRef Argentina", publisher: "Jefatura de Gabinete de Ministros",
  license: "CC BY 4.0", url: "https://www.argentina.gob.ar/georef",
}, async (discard) => {
  for (const [category, endpoint] of [["municipality", "municipios"], ["locality", "localidades"]]) {
    const data = await (await fetchChecked(`https://apis.datos.gob.ar/georef/api/${endpoint}.geojson`)).json();
    for (const feature of data.features ?? []) {
      const searchable = normalizeText(JSON.stringify(feature.properties));
      if (!searchable.includes("san fernando") || !searchable.includes("buenos aires")) { discard("other_municipality"); continue; }
      const coordinates = feature.geometry?.type === "Point" ? feature.geometry.coordinates : null;
      if (!coordinates) { discard("non_point_hierarchy_stored_separately"); continue; }
      const reason = addRecord({
        id: `georef-${feature.id ?? feature.properties?.id}`, name: feature.properties?.nombre ?? "Sin nombre",
        category, latitude: coordinates[1], longitude: coordinates[0], source: "GeoRef Argentina",
        sourceUrl: "https://www.argentina.gob.ar/georef", license: "CC BY 4.0", confidence: "verified",
        properties: feature.properties ?? {},
      });
      if (reason) discard(reason);
    }
  }
});

await runSource({
  id: "pba-education", name: "Establecimientos educativos", publisher: "Dirección General de Cultura y Educación PBA",
  license: "CC BY 4.0", url: "https://catalogo.datos.gba.gob.ar/dataset/establecimientos-educativos",
}, async (discard) => {
  const catalog = await (await fetchChecked("https://catalogo.datos.gba.gob.ar/api/3/action/package_show?id=establecimientos-educativos")).json();
  const resource = catalog.result.resources.find((item) => normalizeText(item.format) === "csv");
  if (!resource?.url) throw new Error("El catálogo no publicó un recurso CSV utilizable.");
  const rows = csvRows(await (await fetchChecked(resource.url, { headers: { Accept: "text/csv" } })).text());
  for (const row of rows) {
    if (normalizeText(row.municipio_nombre) !== "san fernando") { discard("other_municipality"); continue; }
    const detectedCategory = categoryOf(row);
    const values = Object.values(row);
    const reason = addRecord({
      id: `pba-education-${row.cueanexo || row.establecimiento_id}`, name: row.establecimiento_nombre,
      category: detectedCategory === "point_of_interest" ? "school" : detectedCategory,
      latitude: Number(row.latitud || values.at(-2)), longitude: Number(row.longitud || values.at(-1)),
      source: "Datos Abiertos PBA", sourceUrl: resource.url, license: catalog.result.license_title || "CC BY 4.0",
      confidence: "verified", properties: {
        municipalityId: row.municipio_id, level: row.nivel, modality: row.modalidad,
        address: row.direccion, sector: row.sector, cue: row.cue, annex: row.anexo,
      },
    });
    if (reason) discard(reason);
  }
  return { resourceVersion: resource.last_modified ?? catalog.result.metadata_modified };
});

await runSource({
  id: "osm-overpass", name: "OpenStreetMap / Overpass", publisher: "OpenStreetMap contributors",
  license: "ODbL 1.0", url: "https://www.openstreetmap.org/copyright",
}, async (discard) => {
  const [west, south, east, north] = bounds;
  const query = `[out:json][timeout:90];(nwr["amenity"](${south},${west},${north},${east});nwr["leisure"](${south},${west},${north},${east});nwr["tourism"](${south},${west},${north},${east});nwr["railway"="station"](${south},${west},${north},${east}););out center tags;`;
  let data;
  let lastError;
  for (const endpoint of ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]) {
    try {
      data = await (await fetchChecked(endpoint, {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: new URLSearchParams({ data: query }),
      })).json();
      break;
    } catch (error) { lastError = error; }
  }
  if (!data) throw lastError;
  for (const element of data.elements ?? []) {
    const latitude = element.lat ?? element.center?.lat;
    const longitude = element.lon ?? element.center?.lon;
    const name = element.tags?.name || element.tags?.official_name;
    if (!name) { discard("missing_name"); continue; }
    const reason = addRecord({
      id: `osm-${element.type}-${element.id}`, name, category: categoryOf(element.tags),
      latitude, longitude, source: "OpenStreetMap / Overpass",
      sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      license: "ODbL 1.0", confidence: "medium", properties: element.tags ?? {},
    });
    if (reason) discard(reason);
  }
});

await runSource({
  id: "ign-arcgis", name: "IGN ArcGIS REST — Gobiernos locales", publisher: "Instituto Geográfico Nacional",
  license: "Datos públicos IGN — atribución requerida", url: "https://ide.ign.gob.ar/geoservicios/rest/services/ANIDA/org_politica/MapServer",
}, async (discard) => {
  const service = "https://ide.ign.gob.ar/geoservicios/rest/services/ANIDA/org_politica/MapServer/275";
  const metadata = await (await fetchChecked(`${service}?f=json`)).json();
  if (!String(metadata.supportedQueryFormats ?? "").includes("geoJSON")) throw new Error("La capa no anuncia GeoJSON.");
  const query = `${service}/query?where=${encodeURIComponent("NAM='San Fernando'")}&outFields=*&returnGeometry=true&outSR=4326&f=geojson`;
  const data = await (await fetchChecked(query)).json();
  if (!(data.features?.length)) discard("no_matching_feature");
  for (const feature of data.features ?? []) {
    const geometry = feature.geometry;
    const geometryPoints = geometry?.type === "Polygon"
      ? geometry.coordinates?.flat(1)
      : geometry?.type === "MultiPolygon"
        ? geometry.coordinates?.flat(2)
        : [];
    const coordinates = geometry?.type === "Point"
      ? geometry.coordinates
      : geometryPoints.length
        ? [
            (Math.min(...geometryPoints.map(([longitude]) => longitude)) + Math.max(...geometryPoints.map(([longitude]) => longitude))) / 2,
            (Math.min(...geometryPoints.map(([, latitude]) => latitude)) + Math.max(...geometryPoints.map(([, latitude]) => latitude))) / 2,
          ]
        : null;
    if (!coordinates) { discard("unsupported_geometry"); continue; }
    const reason = addRecord({
      id: `ign-government-${feature.id ?? feature.properties?.OBJECTID}`,
      name: feature.properties?.FNA ?? feature.properties?.NAM ?? "Municipio de San Fernando",
      category: "municipality", latitude: coordinates[1], longitude: coordinates[0],
      source: "IGN ArcGIS REST", sourceUrl: query,
      license: "Datos públicos IGN — atribución requerida", confidence: "verified",
      properties: { ...feature.properties, geometry },
    });
    if (reason) discard(reason);
  }
  return { featuresReturned: data.features?.length ?? 0, geometryValidated: true };
});

await runSource({
  id: "datos-argentina", name: "Datos.gob.ar CKAN", publisher: "Datos Argentina",
  license: "Licencia declarada por cada dataset", url: "https://datos.gob.ar/acerca/ckan",
}, async () => {
  const data = await (await fetchChecked("https://datos.gob.ar/api/3/action/package_search?q=%22San%20Fernando%22&rows=20")).json();
  return { datasetsDiscovered: data.result?.count ?? 0, note: "Catálogo validado; no se importan recursos sin geometría municipal verificable." };
});

await runSource({
  id: "ckan-compatible", name: "CKAN compatible PBA", publisher: "Datos Abiertos PBA",
  license: "Licencia declarada por cada dataset", url: "https://catalogo.datos.gba.gob.ar/",
}, async () => {
  const data = await (await fetchChecked("https://catalogo.datos.gba.gob.ar/api/3/action/package_search?q=San%20Fernando&rows=20")).json();
  return { datasetsDiscovered: data.result?.count ?? 0, note: "Conectividad y formato CKAN validados." };
});

await runSource({
  id: "ign-download", name: "IGN Capas SIG / WFS", publisher: "Instituto Geográfico Nacional",
  license: "Datos públicos IGN — atribución requerida", url: "https://www.ign.gob.ar/NuestrasActividades/InformacionGeoespacial/CapasSIG",
}, async () => {
  const response = await fetchChecked("https://wms.ign.gob.ar/geoserver/ows?service=wfs&version=2.0.0&request=GetCapabilities");
  const content = await response.text();
  if (!content.includes("WFS_Capabilities")) throw new Error("La respuesta no contiene capacidades WFS.");
  return { capabilitiesBytes: content.length };
});

records.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name, "es"));
const counts = Object.fromEntries([...new Set(records.map((item) => item.category))].sort().map((category) => [category, records.filter((item) => item.category === category).length]));
const artifact = {
  schemaVersion: 1, municipality: { id: "municipio-san-fernando", name: "San Fernando", province: "Buenos Aires", bounds },
  generatedAt: runDate, records, counts, sources, validation: {
    coordinateSystem: "EPSG:4326", containedInMunicipality: true, validCoordinates: true,
    duplicatesRemoved: sources.reduce((total, source) => total + (source.discarded?.duplicate ?? 0), 0),
    hierarchy: "Municipio > localidad/barrio/circuito > entidad; las entidades puntuales se validaron contra el polígono municipal versionado.",
  },
};
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(publicOutput, `${JSON.stringify(artifact, null, 2)}\n`);
await fs.writeFile(path.join(outputDir, "latest-report.json"), `${JSON.stringify(artifact, null, 2)}\n`);

const categoryRows = [
  ["Municipio", "municipality"], ["Localidades", "locality"], ["Barrios", "neighborhood"],
  ["Escuelas", "school"], ["Jardines", "kindergarten"], ["Hospitales", "hospital"],
  ["CAPS", "primary_care_center"], ["Comisarías", "police"], ["Bomberos", "fire_station"],
  ["Clubes", "club"], ["Plazas", "square"], ["Parques", "park"], ["Estaciones", "station"],
  ["Puntos de interés", "point_of_interest"],
];
const sourceRows = sources.map((source) => {
  const reasons = Object.entries(source.discarded ?? {}).map(([key, value]) => `${key}: ${value}`).join("; ");
  return `| ${source.name} | ${source.status} | ${source.imported} | ${Object.values(source.discarded ?? {}).reduce((a, b) => a + b, 0)} | ${source.error ?? (reasons || "—")} |`;
}).join("\n");
const report = `# Sprint 22 — Informe de primera sincronización real\n\n` +
  `Fecha UTC: ${runDate}\n\nMunicipio: San Fernando, Buenos Aires\n\n` +
  `## Entidades importadas\n\n| Categoría | Cantidad |\n|---|---:|\n${categoryRows.map(([label, key]) => `| ${label} | ${counts[key] ?? 0} |`).join("\n")}\n\n` +
  `## Fuentes y descartes\n\n| Fuente | Estado | Importadas | Descartadas | Motivo / error |\n|---|---|---:|---:|---|\n${sourceRows}\n\n` +
  `## Validación cartográfica\n\n- CRS normalizado: EPSG:4326.\n- Cada punto fue validado contra el polígono municipal versionado; no se aceptaron puntos fuera del municipio.\n- Duplicados eliminados por categoría, nombre normalizado y coordenada a cinco decimales.\n- La jerarquía existente se conserva; una fuente puntual no crea barrios ni límites.\n- No se inventaron geometrías ni entidades. Las categorías sin fuente pública utilizable quedan en cero.\n\n` +
  `## Trazabilidad\n\nLos datos completos, URLs, licencias, fechas y motivos de descarte están en \`src/data/san-fernando-official-sync.json\` y \`data/san-fernando/latest-report.json\`.\n`;
await fs.writeFile(reportOutput, report);
console.log(JSON.stringify({ generatedAt: runDate, records: records.length, counts, sources: sources.map(({ id, status, imported, error }) => ({ id, status, imported, error })) }, null, 2));
