import { SectionPage } from "@/components/pages/section-page";

export default function ConfiguracionPage() {
  return <SectionPage eyebrow="Sistema" title="Configuración" description="Prepará el espacio de trabajo y dejá definidos los criterios generales de la campaña." cards={[
    { eyebrow: "Campaña", title: "Datos generales", description: "Nombre, municipio y período de planificación.", status: "Configurado" },
    { eyebrow: "Preferencias", title: "Apariencia", description: "Usá el selector superior para alternar entre modo claro y oscuro.", status: "Disponible" },
    { eyebrow: "Próximamente", title: "Equipo y acceso", description: "La autenticación y los permisos se incorporarán en una etapa futura.", status: "Preparado" },
  ]} />;
}
