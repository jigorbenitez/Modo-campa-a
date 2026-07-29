import type { Metadata } from "next";
import { TerritorialManager } from "@/features/territorial-engine";

export const metadata: Metadata = {
  title: "Territorio",
  description: "Gestión territorial de lugares, servicios e instituciones de ATIY.",
};

export default function TerritorialDirectoryPage() {
  return <TerritorialManager />;
}
