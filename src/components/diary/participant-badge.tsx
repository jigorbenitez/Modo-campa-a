export function ParticipantBadge({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1.5 text-xs font-bold">
      <span className="grid size-5 place-items-center rounded-full bg-[var(--accent-soft)] text-[9px] text-[var(--accent-strong)]">
        {initials}
      </span>
      {name}
    </span>
  );
}
