import type { Metadata } from "next";
import { TerritoryOperations } from "@/components/territory/territory-operations";
import { ContextSyncPulse } from "@/components/beta/context-sync-pulse";

export const metadata: Metadata = {
  title: "Territorio",
  description: "Centro de operaciones territorial del Municipio de San Fernando.",
};

export default function TerritoryPage() {
  return <><ContextSyncPulse module="territory" /><TerritoryOperations /></>;
}
