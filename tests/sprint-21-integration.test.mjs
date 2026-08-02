import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Administración navega a /admin y mantiene activas sus rutas hijas", async () => {
  const navigation = await read("../src/data/navigation.ts");
  const sidebar = await read("../src/components/layout/sidebar.tsx");
  assert.match(navigation, /href: "\/admin", label: "Administración"/);
  assert.match(sidebar, /activeNavigationHref\(pathname\)/);
});

test("el centro de sincronización posee ruta principal y alias compatible", async () => {
  const page = await read("../src/app/admin/data-sync/page.tsx");
  const alias = await read("../src/app/admin/sync/page.tsx");
  const screen = await read("../src/features/data-sync/presentation/data-sync-admin-screen.tsx");
  assert.match(page, /DataSyncAdminScreen/);
  assert.match(alias, /redirect\("\/admin\/data-sync"\)/);
  assert.match(screen, /Municipio a sincronizar/);
  assert.match(screen, /municipalities\.map/);
});

test("la interfaz ejecuta el motor y muestra progreso, entidades e historial", async () => {
  const panel = await read("../src/features/data-sync/presentation/data-sync-panel.tsx");
  assert.match(panel, /engine\.synchronize/);
  assert.match(panel, /Progreso de sincronización/);
  assert.match(panel, /Entidades importadas/);
  assert.match(panel, /Historial/);
  assert.match(panel, /repository\.listFeatures/);
});

test("las descargas remotas usan un proxy con allowlist y existe caché verificada", async () => {
  const route = await read("../src/app/api/territorial-sync/download/route.ts");
  const downloader = await read("../src/features/data-sync/infrastructure/browser-infrastructure.ts");
  const connectors = await read("../src/features/data-sync/infrastructure/connectors.ts");
  assert.match(route, /allowedHosts/);
  assert.match(route, /url\.protocol !== "https:"/);
  assert.match(route, /maximumBytes/);
  assert.match(downloader, /\/api\/territorial-sync\/download/);
  assert.match(connectors, /BundledVerifiedTerritoryConnector/);
});

test("Relaciones permite que las columnas se contraigan en móvil", async () => {
  const explorer = await read("../src/components/relationships/relationship-explorer.tsx");
  assert.match(explorer, /<aside className="min-w-0/);
  assert.match(explorer, /<div className="min-w-0 overflow-hidden/);
});
