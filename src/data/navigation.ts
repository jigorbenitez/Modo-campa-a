import type { NavItem } from "@/types/navigation";

export const navigation: NavItem[] = [
  { href: "/", label: "Dashboard", shortLabel: "Inicio", icon: "⌂" },
  { href: "/territorio", label: "Centro Operativo", shortLabel: "Mapa", icon: "◎" },
  { href: "/recorrido", label: "Recorridas", shortLabel: "Recorridas", icon: "⌖" },
  { href: "/territorio/entidades", label: "Territorio", shortLabel: "Territorio", icon: "◇" },
  { href: "/inteligencia", label: "Inteligencia", shortLabel: "Contexto", icon: "◉" },
  { href: "/relaciones", label: "Relaciones", shortLabel: "Relaciones", icon: "⎔" },
  { href: "/agenda", label: "Agenda", shortLabel: "Agenda", icon: "□" },
  { href: "/admin", label: "Administración", shortLabel: "Admin", icon: "⚙" },
];
