import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("Diario usa un fallback estable y no rearma la suscripción en cada render", async () => {
  const [diary, journalHook] = await Promise.all([
    read("src/components/diary/campaign-diary.tsx"),
    read("src/hooks/use-activity-journal.ts"),
  ]);
  assert.match(diary, /const emptyActivityRecords: ActivityRecord\[\] = \[\]/);
  assert.match(diary, /useActivityJournal\(emptyActivityRecords\)/);
  assert.doesNotMatch(diary, /useActivityJournal\(\[\]\)/);
  assert.match(journalHook, /\}, \[fallback\]\);/);
});

test("la navegación activa el destino más específico", async () => {
  const [navigation, sidebar, mobile] = await Promise.all([
    read("src/data/navigation.ts"),
    read("src/components/layout/sidebar.tsx"),
    read("src/components/layout/mobile-nav.tsx"),
  ]);
  assert.match(navigation, /sort\(\(left, right\) => right\.href\.length - left\.href\.length\)/);
  assert.match(sidebar, /activeHref === item\.href/);
  assert.match(mobile, /activeHref === item\.href/);
  assert.match(sidebar, /aria-current=\{active \? "page" : undefined\}/);
});

test("Abrir registro solo se muestra para una actividad presente en el Diario", async () => {
  const pulse = await read("src/components/beta/context-sync-pulse.tsx");
  assert.match(pulse, /journalIds\.has\(activity\.id\)/);
  assert.match(pulse, /if \(!latest\) return null/);
  assert.match(pulse, /\/diario\?activity=/);
  assert.doesNotMatch(pulse, /\/recorrido/);
});

test("Mapa, Relaciones, Inteligencia y Territorio comparten el acceso validado al Diario", async () => {
  const [mapPage, relationsPage, intelligencePage, directoryPage] = await Promise.all([
    read("src/app/territorio/page.tsx"),
    read("src/app/relaciones/page.tsx"),
    read("src/app/inteligencia/page.tsx"),
    read("src/app/territorio/entidades/page.tsx"),
  ]);
  for (const source of [mapPage, relationsPage, intelligencePage, directoryPage]) {
    assert.match(source, /ContextSyncPulse/);
  }
});

test("los indicadores no duplican una recorrida ya incorporada al Diario", async () => {
  const dashboard = await read("src/components/dashboard/dashboard.tsx");
  assert.match(dashboard, /const activities = useMemo\(\(\) => records/);
  assert.doesNotMatch(dashboard, /\.\.\.tours\.map/);
  assert.match(dashboard, /actividades únicas del Diario/);
  assert.match(dashboard, /recorridas describe únicamente sesiones de campo/);
  assert.match(dashboard, /repositorio canónico/);
});
