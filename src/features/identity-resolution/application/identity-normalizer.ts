const irrelevantWords = new Set([
  "colegio", "escuela", "instituto", "parroquial", "municipal", "provincial",
  "establecimiento", "educativo", "educativa", "centro", "de", "del", "la",
  "el", "los", "las", "n", "no", "numero",
]);

const abbreviations: Array<[RegExp, string]> = [
  [/\bn[°º.o]*\s*(\d+)/g, " numero $1 "],
  [/\bgral\b/g, " general "],
  [/\bsta\b/g, " santa "],
  [/\bsto\b/g, " santo "],
  [/\bdr\b/g, " doctor "],
  [/\bprof\b/g, " profesor "],
];

export function normalizeIdentityName(value: string) {
  let normalized = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es-AR");
  for (const [pattern, replacement] of abbreviations) normalized = normalized.replace(pattern, replacement);
  return normalized
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((word) => word && !irrelevantWords.has(word))
    .join(" ");
}

export function normalizeAddress(value?: string) {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es-AR")
    .replace(/\b(av|avda|avenida)\b/g, "avenida")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

