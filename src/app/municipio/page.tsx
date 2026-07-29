import type { Metadata } from "next";
import { MunicipalityPanel } from "@/components/municipality/municipality-panel";

export const metadata: Metadata = {
  title: "Municipio",
  description: "Panel institucional y territorial del Municipio de San Fernando.",
};

export default function MunicipalityPage() {
  return <MunicipalityPanel />;
}
