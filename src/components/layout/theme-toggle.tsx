"use client";

import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme} className="grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-lg transition hover:bg-[var(--surface-muted)]" aria-label="Alternar modo claro y oscuro" title="Alternar tema">
      ◐
    </button>
  );
}
