import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)]))).flat();
}

test("toda la navegación RC1 posee una ruta real", async () => {
  const expected = ["/", "/territorio", "/territorio/entidades", "/inteligencia", "/diario", "/recorrido", "/relaciones", "/admin", "/admin/data-quality", "/admin/data-sync", "/configuracion", "/mi-cuenta"];
  const appRoot = fileURLToPath(new URL("../src/app", import.meta.url));
  const pages = (await walk(appRoot)).filter((file) => file.endsWith("page.tsx")).map((file) => {
    const relativePage = relative(appRoot, file).replaceAll("\\", "/");
    const route = relativePage === "page.tsx" ? "" : relativePage.replace(/\/page\.tsx$/, "");
    return route ? `/${route}` : "/";
  });
  expected.forEach((route) => assert.ok(pages.includes(route), `Falta la ruta ${route}`));
});

test("Administración abre su panel y no el Dashboard", async () => {
  const [navigation, adminPage] = await Promise.all([read("src/data/navigation.ts"), read("src/app/admin/page.tsx")]);
  assert.match(navigation, /href: "\/admin", label: "Administración"/);
  assert.match(adminPage, /return <AdminPanel/);
  assert.doesNotMatch(adminPage, /redirect\("\/"\).*AdminPanel/s);
});

test("todos los accesos a entidades convergen en la ficha territorial", async () => {
  const [intelligence, relations, map, directory] = await Promise.all([
    read("src/components/intelligence/intelligence-center.tsx"), read("src/components/relationships/entity-header.tsx"),
    read("src/components/territory/territory-sidebar.tsx"), read("src/features/territorial-engine/presentation/territorial-directory.tsx"),
  ]);
  [intelligence, relations, map, directory].forEach((source) => assert.match(source, /\/territorio\/entidades\//));
  assert.doesNotMatch(intelligence, /Abrir registro[\s\S]{0,180}\/recorrido/);
});

test("el Diario conecta abrir, editar, duplicar, eliminar y exportar", async () => {
  const [diary, card, timeline] = await Promise.all([read("src/components/diary/campaign-diary.tsx"), read("src/components/diary/activity-card.tsx"), read("src/components/diary/activity-timeline.tsx")]);
  for (const handler of ["onEdit", "onDelete", "onDuplicate", "onExport"]) assert.match(card, new RegExp(handler));
  for (const implementation of ["deleteRecord", "duplicateRecord", "exportRecord"]) assert.match(diary, new RegExp(`function ${implementation}`));
  assert.match(card, />Abrir<\/button>/);
  assert.match(timeline, /id={`activity-\$\{record\.activity\.id\}`}/);
});

test("Abrir registro contextual vuelve al Diario y conserva la actividad", async () => {
  const [pulse, diary] = await Promise.all([read("src/components/beta/context-sync-pulse.tsx"), read("src/components/diary/campaign-diary.tsx")]);
  assert.match(pulse, /\/diario\?activity=/);
  assert.doesNotMatch(pulse, /href="\/recorrido"/);
  assert.match(diary, /searchParams\.get\("activity"\)/);
});

test("el mapa hidrata con estado determinista y carga preferencias después del montaje", async () => {
  const source = await read("src/components/territory/territory-operations.tsx");
  assert.match(source, /useState<TerritoryFeature\[]>\(\[\]\)/);
  assert.match(source, /\(!requestedActivityId && !requestedEntityId\)/);
  assert.match(source, /setPreferencesLoaded\(true\)/);
  assert.match(source, /if \(!preferencesLoaded\) return/);
});
