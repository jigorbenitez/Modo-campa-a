export type FilterValue = string | string[] | undefined;

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterDefinition {
  id: string;
  label: string;
  kind: "single" | "multiple";
  options: FilterOption[];
  placeholder?: string;
}

export type FilterState = Record<string, FilterValue>;
