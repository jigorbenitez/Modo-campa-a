import { redirect } from "next/navigation";
import { DataSyncAdminScreen } from "@/features/data-sync/presentation/data-sync-admin-screen";
import {
  canUser,
  getAdminOverview,
  getPlatformContext,
} from "@/infrastructure/supabase/platform-context";

export default async function DataSyncAdminPage() {
  const context = await getPlatformContext();
  if (!context) redirect("/login");
  if (!canUser(context.user.role, "territory:write")) redirect("/admin");

  const overview = await getAdminOverview(context);
  return (
    <DataSyncAdminScreen
      initialMunicipalityId={context.user.municipioId}
      municipalities={overview.municipalities.map((municipality) => ({
        ...municipality,
        provinceName: "Buenos Aires",
      }))}
    />
  );
}
