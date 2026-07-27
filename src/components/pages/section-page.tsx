import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";

export type ExampleCard = { eyebrow: string; title: string; description: string; status?: string };

export function SectionPage({ eyebrow, title, description, cards }: { eyebrow: string; title: string; description: string; cards: ExampleCard[] }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header className="max-w-3xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-base leading-7 text-[var(--muted)]">{description}</p>
      </header>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => (
          <Card key={card.title} className="group transition hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-[var(--accent-soft)] text-sm font-black text-[var(--accent-strong)]">{String(index + 1).padStart(2, "0")}</span>
              {card.status && <StatusPill tone={index === 0 ? "green" : "neutral"}>{card.status}</StatusPill>}
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">{card.eyebrow}</p>
            <h2 className="mt-2 text-lg font-extrabold">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{card.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
