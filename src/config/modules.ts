export const systemModules = [
  "dashboard",
  "activity_journal",
  "budget",
  "territory",
  "proposals",
  "marketing",
  "agenda",
  "residents",
  "documents",
  "team",
] as const;

export type SystemModule = (typeof systemModules)[number];
