import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const roots = ["src", "tests", "docs", "data", "public", "scripts"];
const textExtensions = new Set([
  ".css",
  ".geojson",
  ".html",
  ".json",
  ".md",
  ".mjs",
  ".sql",
  ".ts",
  ".tsx",
]);
const suspiciousText = /(?:Ã.|Â.|â€¦|â€”|â€“|â€|ï¿½|�)/u;
const failures = [];

async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (path.endsWith(join("scripts", "check-utf8.mjs"))) continue;
    if (entry.isDirectory()) {
      await inspect(path);
      continue;
    }
    if (!textExtensions.has(extname(entry.name))) continue;

    const bytes = await readFile(path);
    let text;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      failures.push(`${relative(process.cwd(), path)}: UTF-8 inválido`);
      continue;
    }
    if (suspiciousText.test(text)) {
      failures.push(`${relative(process.cwd(), path)}: posible texto mal codificado`);
    }
  }
}

for (const root of roots) {
  await inspect(root);
}

if (failures.length) {
  throw new Error(`Auditoría UTF-8 fallida:\n${failures.join("\n")}`);
}

console.log("Auditoría UTF-8 completada sin errores.");
