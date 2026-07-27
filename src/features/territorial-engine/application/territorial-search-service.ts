import type {
  TerritorialEntityPage,
  TerritorialEntityQuery,
  TerritorialEntityReader,
  TerritorialEntityType,
} from "../domain";

export interface TerritorialSearchInput {
  text?: string;
  type?: string;
  category?: string;
  localityId?: string;
  neighborhoodId?: string;
  page?: number;
  pageSize?: number;
}

export class TerritorialSearchService {
  constructor(private readonly reader: TerritorialEntityReader) {}

  async execute(
    municipalityId: string,
    input: TerritorialSearchInput,
  ): Promise<TerritorialEntityPage> {
    const query: TerritorialEntityQuery = {
      search: input.text?.trim() || undefined,
      types: input.type ? [input.type as TerritorialEntityType] : undefined,
      categories: input.category ? [input.category] : undefined,
      localityIds: input.localityId ? [input.localityId] : undefined,
      neighborhoodIds: input.neighborhoodId ? [input.neighborhoodId] : undefined,
      page: input.page ?? 1,
      pageSize: Math.min(input.pageSize ?? 24, 100),
    };

    return this.reader.search(municipalityId, query);
  }
}
