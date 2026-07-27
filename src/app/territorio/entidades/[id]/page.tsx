import type { Metadata } from "next";
import {
  EmptyTerritorialEntityRepository,
  TerritorialEntityDetail,
} from "@/features/territorial-engine";

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
  const repository = new EmptyTerritorialEntityRepository();
  const entity = await repository.findById("municipio-villa-del-encuentro", id);
  return <TerritorialEntityDetail entity={entity} />;
}
