import type {
  TerritorialImporter,
  TerritorialImportFormat,
  TerritorialImportRegistry,
} from "../application";

export class DefaultTerritorialImportRegistry implements TerritorialImportRegistry {
  private readonly importers = new Map<TerritorialImportFormat, TerritorialImporter>();

  register(importer: TerritorialImporter): void {
    this.importers.set(importer.format, importer);
  }

  get(format: TerritorialImportFormat): TerritorialImporter | null {
    return this.importers.get(format) ?? null;
  }
}
