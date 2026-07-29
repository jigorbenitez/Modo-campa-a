import type { Metadata } from "next";
import { CampaignDiary } from "@/components/diary/campaign-diary";
import { ContextSyncPulse } from "@/components/beta/context-sync-pulse";

export const metadata: Metadata = {
  title: "Mi Diario",
  description: "Cronología conectada de las actividades del equipo.",
};

export default function DiaryPage() {
  return <><ContextSyncPulse module="diary" /><CampaignDiary /></>;
}
