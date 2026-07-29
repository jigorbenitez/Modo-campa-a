import type { TerritorialEntity } from "../domain";

export type TerritorialImportFormat = "csv" | "xlsx" | "json" | "geojson" | "shapefile" | "geopackage";

export interface TerritorialImportSource {
  format: TerritorialImportFormat;
  fileName: string;
  municipalityId: string;
  content: string | ArrayBuffer;
  source: {
    name: string;
    url: string;
    retrievedAt: string;
    confidence: "verified" | "high" | "medium" | "low";
    license?: string;
  };
  options?: {
    delimiter?: string;
    encoding?: string;
    coordinateReferenceSystem?: string;
  };
}

export interface TerritorialImportIssue {
  row?: number;
  field?: string;
  code: string;
  message: string;
  severity: "warning" | "error";
}

export interface TerritorialImportPreview {
  source: Pick<TerritorialImportSource, "format" | "fileName" | "municipalityId">;
  entities: TerritorialEntity[];
  issues: TerritorialImportIssue[];
  totalRows: number;
  validRows: number;
}

export interface TerritorialImporter {
  readonly format: TerritorialImportFormat;
  preview(source: TerritorialImportSource): Promise<TerritorialImportPreview>;
}

export interface TerritorialImportRegistry {
  get(format: TerritorialImportFormat): TerritorialImporter | null;
}
