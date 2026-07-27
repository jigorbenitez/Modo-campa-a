const tones = {
  green: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
  neutral: "bg-[var(--surface-muted)] text-[var(--muted)]",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: keyof typeof tones }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}
