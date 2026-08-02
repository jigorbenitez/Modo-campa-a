import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin/admin-panel";
import {
  canUser,
  getAdminOverview,
  getPlatformContext,
} from "@/infrastructure/supabase/platform-context";

export default async function AdminPage() {
  const context = await getPlatformContext();
  if (!context) redirect("/login");
  if (!canUser(context.user.role, "users:read")) redirect("/mi-cuenta");

  const overview = await getAdminOverview(context);
  return <AdminPanel context={context} overview={overview} />;
}
