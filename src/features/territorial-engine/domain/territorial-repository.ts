import type {
  TerritorialEntity,
  TerritorialEntityStatus,
  TerritorialEntityType,
} from "./territorial-entity";

export interface TerritorialEntityQuery {
  search?: string;
  types?: TerritorialEntityType[];
  categories?: string[];
  localityIds?: string[];
  neighborhoodIds?: string[];
  statuses?: TerritorialEntityStatus[];
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  page?: number;
  pageSize?: number;
}

export interface TerritorialEntityPage {
  items: TerritorialEntity[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TerritorialEntityReader {
  findById(municipalityId: string, id: string): Promise<TerritorialEntity | null>;
  search(municipalityId: string, query: TerritorialEntityQuery): Promise<TerritorialEntityPage>;
  listCategories(municipalityId: string): Promise<string[]>;
  listLocalities(municipalityId: string): Promise<Array<{ id: string; name: string }>>;
  listNeighborhoods(municipalityId: string): Promise<Array<{ id: string; name: string }>>;
}

export interface TerritorialEntityWriter {
  save(entity: TerritorialEntity): Promise<TerritorialEntity>;
  saveMany(entities: TerritorialEntity[]): Promise<{ saved: number; rejected: number }>;
  delete(municipalityId: string, id: string): Promise<void>;
}

export type TerritorialEntityRepository = TerritorialEntityReader & TerritorialEntityWriter;
