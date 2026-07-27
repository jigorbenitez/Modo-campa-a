import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ATIY",
    short_name: "ATIY",
    description: "Inteligencia para transformar el territorio.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A1D3D",
    theme_color: "#0A1D3D",
    lang: "es",
    icons: [
      {
        src: "/brand/atiy-app-icon.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/atiy-app-icon.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
