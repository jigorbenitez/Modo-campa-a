import { cn } from "@/lib/utils";

export function TrendCard({
  direction,
  label,
  favorable,
}: {
  direction: "up" | "down" | "stable";
  label: string;
  favorable: boolean;
}) {
  const symbol = direction === "up" ? "↗" : direction === "down" ? "↘" : "→";
  return (
    <div
      className={cn(
        "mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold",
        favorable
          ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
          : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300",
      )}
    >
      <span className="text-base" aria-hidden="true">{symbol}</span>
      {label}
    </div>
  );
}
