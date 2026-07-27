import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Modo Campaña",
    short_name: "Modo Campaña",
    description: "Planificación, gestión y estrategia de campañas políticas municipales.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6f2",
    theme_color: "#13251b",
    lang: "es",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
