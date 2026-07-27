import type { Metadata } from "next";
import {
  buildTerritorialFilterDefinitions,
  EmptyTerritorialEntityRepository,
  TerritorialDirectory,
  TerritorialSearchService,
} from "@/features/territorial-engine";

export const metadata: Metadata = {
  title: "Territorio",
  description: "Base territorial de lugares, servicios e instituciones de ATIY.",
};

const municipalityId = "municipio-san-fernando";

export default async function TerritorialDirectoryPage() {
  const repository = new EmptyTerritorialEntityRepository();
  const service = new TerritorialSearchService(repository);
  const [result, categories, localities, neighborhoods] = await Promise.all([
    service.execute(municipalityId, {}),
    repository.listCategories(municipalityId),
    repository.listLocalities(municipalityId),
    repository.listNeighborhoods(municipalityId),
  ]);

  return (
    <TerritorialDirectory
      entities={result.items}
      filters={buildTerritorialFilterDefinitions({ categories, localities, neighborhoods })}
    />
  );
}
