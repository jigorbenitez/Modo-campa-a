import { redirect } from "next/navigation";
import { EnrichmentAdminScreen } from "@/features/territorial-enrichment";
import { createTerritorialEntityRepository } from "@/features/territorial-engine/infrastructure/repository-factory.server";
import { canUser, getPlatformContext } from "@/infrastructure/supabase/platform-context";

export default async function EnrichmentPage() {
  const context = await getPlatformContext();
  if (!context) redirect("/login");
  if (!canUser(context.user.role, "territory:write")) redirect("/admin");
  const repository = await createTerritorialEntityRepository();
  const entities = (await repository.search(context.user.municipioId, { pageSize: 5000 })).items;
  return <EnrichmentAdminScreen municipalityId={context.user.municipioId} municipalityName={context.municipalityName} entities={entities} />;
}
