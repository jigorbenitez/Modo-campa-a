import type { Metadata } from "next";
import {
  TerritorialEntityDetail,
} from "@/features/territorial-engine";
import { createTerritorialEntityRepository } from "@/features/territorial-engine/infrastructure/repository-factory.server";
import { getPlatformContext } from "@/infrastructure/supabase/platform-context";

export const metadata: Metadata = {
  title: "Ficha territorial",
  description: "Contexto completo de una entidad territorial de ATIY.",
};

export default async function TerritorialEntityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const context = await getPlatformContext();
  const repository = await createTerritorialEntityRepository();
  const entity = await repository.findById(
    context?.user.municipioId ?? "municipio-san-fernando",
    id,
  );
  return <TerritorialEntityDetail entity={entity} />;
}
