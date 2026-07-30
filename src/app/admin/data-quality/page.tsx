import { redirect } from "next/navigation";
import { DataQualityScreen } from "@/features/identity-resolution";
import { canUser, getPlatformContext } from "@/infrastructure/supabase/platform-context";

export default async function DataQualityPage() {
  const context = await getPlatformContext();
  if (!context) redirect("/login");
  if (!canUser(context.user.role, "territory:write")) redirect("/admin");
  return <DataQualityScreen municipalityId={context.user.municipioId} />;
}

