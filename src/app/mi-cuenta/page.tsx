import { redirect } from "next/navigation";
import { AccountPanel } from "@/components/account/account-panel";
import { getPlatformContext } from "@/infrastructure/supabase/platform-context";

export default async function AccountPage() {
  const context = await getPlatformContext();
  if (!context) redirect("/login");
  return <AccountPanel context={context} />;
}
