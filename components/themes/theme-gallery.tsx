"use client";

import { CheckIcon, Trash2Icon } from "lucide-react";
import { memo, useMemo } from "react";
import type { CardOptionsMap, CardType } from "@/lib/config";
import { renderCard, svgDataUri } from "@/lib/generators";
import { THEMES } from "@/lib/themes";
import type { CustomTheme } from "@/hooks/use-custom-themes";
import { cn } from "@/lib/utils";
import type { UserBundle } from "@/types/github";

interface Props {
  type: CardType;
  bundle: UserBundle | null;
  options: CardOptionsMap[CardType];
  activeTheme: string;
  hasOverrides: boolean;
  customThemes: CustomTheme[];
  activeCustomId: string | null;
  onSelect: (id: string) => void;
  onSelectCustom: (t: CustomTheme) => void;
  onDeleteCustom: (id: string) => void;
}

const COLOR_OVERRIDES = {
  bg_color: undefined, text_color: undefined, title_color: undefined, icon_color: undefined, border_color: undefined,
  accent_color: undefined, ring_color: undefined, muted_color: undefined, contrib_colors: undefined,
};

/** Thumbnails render the real card for the current user, so every swatch is an honest preview. */
const Thumb = memo(function Thumb({ src, fallback }: { src: string | null; fallback: (typeof THEMES)[number] }) {
  if (src)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className="h-full w-full object-contain object-center" draggable={false} />
    );
  return (
    <div className="flex h-full w-full flex-col justify-center gap-1.5 rounded-md p-2.5" style={{ background: fallback.bg }}>
      <div className="h-1.5 w-1/2 rounded-full" style={{ background: fallback.title }} />
      <div className="h-1 w-3/4 rounded-full opacity-70" style={{ background: fallback.text }} />
      <div className="h-1 w-2/3 rounded-full" style={{ background: fallback.accent }} />
    </div>
  );
});

export function ThemeGallery({
  type, bundle, options, activeTheme, hasOverrides, customThemes, activeCustomId, onSelect, onSelectCustom, onDeleteCustom,
}: Props) {
  const thumbs = useMemo(() => {
    if (!bundle) return new Map<string, string>();
    const base = { ...options, ...COLOR_OVERRIDES, animate: false, width: 0, height: 0 } as CardOptionsMap[CardType];
    return new Map(THEMES.map((t) => [t.id, svgDataUri(renderCard(type, bundle, { ...base, theme: t.id } as never))]));
  }, [bundle, type, options]);

  return (
    <div className="grid gap-3">
      <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-2">
        {THEMES.map((t) => {
          const active = !activeCustomId && activeTheme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(t.id)}
              className={cn(
                "group relative flex flex-col gap-1.5 rounded-lg border p-1.5 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                active ? "border-foreground/40 bg-foreground/[0.04]" : "border-border hover:border-foreground/20",
              )}
            >
              <div
                className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-md p-1"
                style={{ background: t.dark ? "#0d1117" : "#ffffff" }}
              >
                <Thumb src={thumbs.get(t.id) ?? null} fallback={t} />
              </div>
              <span className="flex items-center justify-between gap-1 px-0.5 text-[11px] text-muted-foreground group-hover:text-foreground">
                <span className="truncate">{t.label}</span>
                {active ? (
                  <span className="flex items-center gap-1 text-foreground">
                    {hasOverrides ? <span className="text-[10px] text-muted-foreground">edited</span> : null}
                    <CheckIcon className="size-3" />
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {customThemes.length ? (
        <div className="grid gap-2">
          <p className="text-xs font-medium text-muted-foreground">Your themes</p>
          <ul className="grid gap-1.5">
            {customThemes.map((t) => (
              <li key={t.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSelectCustom(t)}
                  aria-pressed={activeCustomId === t.id}
                  className={cn(
                    "flex flex-1 items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    activeCustomId === t.id ? "border-foreground/40" : "border-border hover:border-foreground/20",
                  )}
                >
                  <span className="flex -space-x-1">
                    {[t.colors.bg_color, t.colors.title_color, t.colors.accent_color, t.colors.text_color]
                      .filter(Boolean)
                      .map((c, i) => (
                        <span key={i} className="size-3.5 rounded-full ring-1 ring-background" style={{ background: c }} />
                      ))}
                  </span>
                  <span className="truncate">{t.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCustom(t.id)}
                  aria-label={`Delete theme ${t.name}`}
                  className="rounded-md p-1.5 text-muted-foreground/60 transition-colors hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <Trash2Icon className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
