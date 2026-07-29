import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const diary = await readFile(new URL("../src/components/diary/campaign-diary.tsx", import.meta.url), "utf8");
const activity = await readFile(new URL("../src/components/diary/activity-card.tsx", import.meta.url), "utf8");
const tour = await readFile(new URL("../src/components/recorrido/tour-mode.tsx", import.meta.url), "utf8");
const recorder = await readFile(new URL("../src/components/recorrido/voice-recorder.tsx", import.meta.url), "utf8");
const pwa = await readFile(new URL("../src/components/pwa/service-worker-register.tsx", import.meta.url), "utf8");
const relations = await readFile(new URL("../src/components/relationships/relationship-explorer.tsx", import.meta.url), "utf8");

test("el Diario ofrece el ciclo operativo completo", () => {
  for (const action of ["Editar", "Finalizar", "Duplicar", "Exportar", "Eliminar"]) assert.match(activity, new RegExp(action));
  assert.match(diary, /window\.confirm/);
  assert.match(diary, /status: "completed"/);
});

test("la recorrida captura audio real y muestra el estado operativo", () => {
  assert.match(recorder, /getUserMedia/);
  assert.match(recorder, /MediaRecorder/);
  for (const status of ["GPS", "Sincronización", "Registros", "Fotos", "Videos / audios", "Batería", "Duración"]) assert.match(tour, new RegExp(status));
});

test("el banner PWA recuerda el cierre y no ocupa el dock inferior", () => {
  assert.match(pwa, /INSTALL_DISMISSED_KEY/);
  assert.match(pwa, /top-20/);
  assert.match(pwa, /Cerrar sugerencia de instalación/);
});

test("el grafo permanece disponible como vista secundaria", () => {
  assert.match(relations, /<details/);
  assert.match(relations, /Ver grafo de relaciones/);
});
