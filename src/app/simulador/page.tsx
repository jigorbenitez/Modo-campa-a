import type { Metadata } from "next";
import { ImpactSimulator } from "@/components/intelligence/impact-simulator";

export const metadata: Metadata = {
  title: "Simulador de Impacto Territorial",
  description: "Comparación determinística de escenarios territoriales sin modificar los datos reales.",
};

export default function SimulatorPage() {
  return <ImpactSimulator />;
}
