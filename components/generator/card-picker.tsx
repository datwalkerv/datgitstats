"use client";

import { ChartColumnIcon, CodeXmlIcon, FlameIcon } from "lucide-react";
import { CARD_TYPES, type CardType } from "@/lib/config";
import { cn } from "@/lib/utils";

const ICONS: Record<CardType, React.ComponentType<{ className?: string }>> = {
  stats: ChartColumnIcon,
  "top-langs": CodeXmlIcon,
  streak: FlameIcon,
};

const SHORT: Record<CardType, string> = { stats: "Stats", "top-langs": "Languages", streak: "Streak" };

export function CardPicker({ value, onChange }: { value: CardType; onChange: (t: CardType) => void }) {
  return (
    <div role="tablist" aria-label="Card" className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-muted/30 p-1">
      {CARD_TYPES.map((t) => {
        const Icon = ICONS[t];
        const active = value === t;
        return (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              e.preventDefault();
              const i = CARD_TYPES.indexOf(t);
              const next = CARD_TYPES[(i + (e.key === "ArrowRight" ? 1 : CARD_TYPES.length - 1)) % CARD_TYPES.length];
              onChange(next);
              (e.currentTarget.parentElement?.querySelector(`[data-card="${next}"]`) as HTMLElement | null)?.focus();
            }}
            tabIndex={active ? 0 : -1}
            data-card={t}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              active ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span className="leading-none">{SHORT[t]}</span>
          </button>
        );
      })}
    </div>
  );
}
