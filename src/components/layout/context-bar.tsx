"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { mockTerritorySnapshot } from "@/mock";

const moduleLabels: Record<string, string> = {
  territorio: "Centro Operativo",
  recorrido: "Recorridas",
  inteligencia: "Inteligencia",
  relaciones: "Relaciones",
  agenda: "Agenda",
  admin: "Administración",
};

export function ContextBar() {
  const pathname = usePathname();
  const params = useSearchParams();
  const segment = pathname.split("/").filter(Boolean)[0];
  const area = mockTerritorySnapshot.neighborhoods.find((item) => item.id === params.get("area"));
  const circuit = mockTerritorySnapshot.circuits.find((item) => item.id === params.get("circuit"));
  const entity = mockTerritorySnapshot.features.find((item) => item.id === params.get("entity"));
  const crumbs = [
    { label: "San Fernando", href: "/territorio" },
    segment && segment !== "territorio" ? { label: moduleLabels[segment] ?? segment, href: pathname } : null,
    area ? { label: area.name, href: `/territorio?area=${area.id}` } : null,
    circuit ? { label: circuit.name, href: `/territorio?circuit=${circuit.id}` } : null,
    entity ? { label: entity.title, href: `/territorio?entity=${entity.id}` } : null,
  ].filter((item): item is { label: string; href: string } => Boolean(item));

  return <nav aria-label="Contexto actual" className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap text-xs text-[var(--muted)]">{crumbs.map((crumb, index) => <span key={crumb.href} className="flex items-center gap-2">{index > 0 && <span aria-hidden>›</span>}<Link href={crumb.href} className={index === crumbs.length - 1 ? "font-extrabold text-[var(--foreground)]" : "hover:text-[var(--foreground)]"}>{crumb.label}</Link></span>)}</nav>;
}
