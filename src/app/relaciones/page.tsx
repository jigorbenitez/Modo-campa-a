import type { Metadata } from "next";
import { RelationshipExplorer } from "@/components/relationships/relationship-explorer";
import { ContextSyncPulse } from "@/components/beta/context-sync-pulse";

export const metadata: Metadata = {
  title: "Relaciones",
  description: "Explorador de memoria institucional y contexto conectado.",
};

export default async function RelationshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  const { entity } = await searchParams;
  return <><ContextSyncPulse module="relationships" /><RelationshipExplorer initialEntityId={entity} /></>;
}
