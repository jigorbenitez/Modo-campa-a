import type { Metadata } from "next";
import { createTerritorialEntityRepository } from "@/features/territorial-engine/infrastructure/repository-factory.server";
import { TerritorialDirectory } from "@/features/territorial-engine";
import { getPlatformContext } from "@/infrastructure/supabase/platform-context";

export const metadata: Metadata = {
  title: "Territorio",
  description: "Gestión territorial de lugares, servicios e instituciones de ATIY.",
};

export default async function TerritorialDirectoryPage() {
  const context = await getPlatformContext();
  const repository = await createTerritorialEntityRepository();
  const result = await repository.search(
    context?.user.municipioId ?? "municipio-san-fernando",
    { pageSize: 5000 },
  );
  return <TerritorialDirectory entities={result.items} filters={[]} />;
}
