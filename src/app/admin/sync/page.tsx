import { redirect } from "next/navigation";

export default function LegacyAdminSyncPage() {
  redirect("/admin/data-sync");
}
