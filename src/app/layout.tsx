import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { createTerritorialEntityRepository } from "@/features/territorial-engine/infrastructure/repository-factory.server";
import { TerritorialRegistryProvider } from "@/features/territorial-engine";
import { getPlatformContext } from "@/infrastructure/supabase/platform-context";
import "./globals.css";

const description = "Inteligencia para transformar el territorio.";
const publicUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://atiy.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(publicUrl),
  title: { default: "ATIY", template: "%s · ATIY" },
  description,
  applicationName: "ATIY",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/brand/atiy-favicon.png", type: "image/png" }],
    shortcut: "/brand/atiy-favicon.png",
    apple: "/brand/atiy-app-icon.png",
  },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "ATIY" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "ATIY",
    title: "ATIY",
    description,
    images: [{ url: "/brand/atiy-app-icon.png", width: 1254, height: 1254, alt: "ATIY" }],
  },
  twitter: {
    card: "summary",
    title: "ATIY",
    description,
    images: ["/brand/atiy-app-icon.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1D3D",
  colorScheme: "light dark",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const context = await getPlatformContext();
  const repository = await createTerritorialEntityRepository();
  const municipalityId = context?.user.municipioId ?? "municipio-san-fernando";
  const registry = await repository.search(municipalityId, { pageSize: 5000 });
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <TerritorialRegistryProvider entities={registry.items}>
          <AppShell>{children}</AppShell>
        </TerritorialRegistryProvider>
      </body>
    </html>
  );
}
