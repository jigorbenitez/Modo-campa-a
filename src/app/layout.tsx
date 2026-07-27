import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const description = "Inteligencia para transformar el territorio.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
