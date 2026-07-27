import type { NavItem } from "@/types/navigation";

export const navigation: NavItem[] = [
  { href: "/", label: "Resumen", shortLabel: "Inicio", icon: "⌂" },
  { href: "/recorrido", label: "Modo Recorrida", shortLabel: "Recorrida", icon: "◎" },
  { href: "/territorio", label: "Territorio", shortLabel: "Mapa", icon: "◉" },
  { href: "/diario", label: "Diario de Campaña", shortLabel: "Diario", icon: "◫" },
  { href: "/relaciones", label: "Relaciones", shortLabel: "Memoria", icon: "⎔" },
  { href: "/inteligencia", label: "Centro de Inteligencia", shortLabel: "Contexto", icon: "◎" },
  { href: "/presupuesto", label: "Presupuesto", shortLabel: "Fondos", icon: "$" },
  { href: "/barrios", label: "Barrios", shortLabel: "Barrios", icon: "◇" },
  { href: "/propuestas", label: "Propuestas", shortLabel: "Ideas", icon: "✦" },
  { href: "/marketing", label: "Marketing", shortLabel: "Difusión", icon: "↗" },
  { href: "/agenda", label: "Agenda", shortLabel: "Agenda", icon: "□" },
  { href: "/vecinos", label: "Vecinos", shortLabel: "Vecinos", icon: "○" },
  { href: "/demo", label: "Demo guiada", shortLabel: "Demo", icon: "▷" },
  { href: "/presentacion", label: "Presentación", shortLabel: "Presentar", icon: "▣" },
  { href: "/admin", label: "Administración", shortLabel: "Admin", icon: "⌘" },
  { href: "/mi-cuenta", label: "Mi cuenta", shortLabel: "Cuenta", icon: "◉" },
  { href: "/configuracion", label: "Configuración", shortLabel: "Ajustes", icon: "⚙" },
];
