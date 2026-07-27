import type { Metadata } from "next";
import { IntelligenceCenter } from "@/components/intelligence/intelligence-center";
import { ContextSyncPulse } from "@/components/beta/context-sync-pulse";

export const metadata: Metadata = {
  title: "Centro de Inteligencia",
  description: "Contexto estratégico derivado de la información territorial y operativa.",
};

export default function IntelligencePage() {
  return <><ContextSyncPulse module="intelligence" /><IntelligenceCenter /></>;
}
