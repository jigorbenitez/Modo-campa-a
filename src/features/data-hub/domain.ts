export type DatasetFormat = "CSV" | "GeoJSON" | "JSON" | "XLSX" | "Shapefile";
export type DatasetStatus = "verified" | "pending" | "update_available" | "rejected";

export interface PublicDataset {
  id: string;
  municipalityId: string;
  name: string;
  category: string;
  publisher: string;
  sourceUrl: string;
  license: string;
  format: DatasetFormat;
  recordCount: number;
  version: string;
  updatedAt: string;
  lastCheckedAt: string;
  status: DatasetStatus;
  validation: string;
  provenance: string;
}

export interface DatasetSync {
  id: string;
  datasetId: string;
  checkedAt: string;
  result: "unchanged" | "candidate" | "accepted" | "rejected";
  note: string;
}
