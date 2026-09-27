"use client";

import { Loader2Icon, MoonIcon, PlayIcon, SunIcon } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { CardImage, svgSize } from "@/components/cards/card-image";
import { CARD_LABELS, type CardOptionsMap, type CardType } from "@/lib/config";
import { renderCard, renderErrorCard, svgDataUri } from "@/lib/generators";
import { cn } from "@/lib/utils";
import type { BundleState } from "@/hooks/use-bundle";

interface Props {
  type: CardType;
  options: CardOptionsMap[CardType];
  data: BundleState;
}

export function Preview({ type, options, data }: Props) {
  const [canvas, setCanvas] = useState<"dark" | "light">("dark");
  // Defer type and options together so they can never be out of sync during a card switch.
  const input = useMemo(() => ({ type, options }), [type, options]);
  const deferredInput = useDeferredValue(input);
  const deferred = deferredInput.options;
  const deferredType = deferredInput.type;
  // Animations play once per card/replay rather than on every keystroke.
  const [replay, setReplay] = useState(0);
  const animKey = `${type}|${data.status}|${replay}`;
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const playing = settledKey !== animKey;
  useEffect(() => {
    const t = setTimeout(() => setSettledKey(animKey), 1800);
    return () => clearTimeout(t);
  }, [animKey]);

  const svg = useMemo(() => {
    const opts = { ...deferred, animate: deferred.animate && playing };
    if (data.status === "error")
      return renderErrorCard({ card: CARD_LABELS[deferredType], title: data.title, message: data.message, options: deferred });
    if (data.status !== "ready") return null;
    try {
      return renderCard(deferredType, data.bundle, opts as never);
    } catch (e) {
      console.error("[preview] render failed", e);
      return renderErrorCard({ card: CARD_LABELS[deferredType], title: "Preview failed", message: "Try different settings." });
    }
  }, [data, deferredType, deferred, playing]);

  const size = svg ? svgSize(svg) : null;
  const src = svg ? svgDataUri(svg) : null;

  return (
    <div className="flex h-full min-h-[340px] flex-col">
      <div className="flex items-center justify-between gap-3 px-1 pb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex size-1.5">
            <span
              className={cn(
                "absolute inline-flex size-full rounded-full",
                data.status === "ready" ? "bg-emerald-400" : data.status === "error" ? "bg-red-400" : "bg-muted-foreground",
              )}
            />
          </span>
          <span aria-live="polite">
            {data.status === "loading"
              ? `Fetching @${data.username}…`
              : data.status === "ready"
                ? `@${data.bundle.profile.login} · ${size?.width}×${size?.height}`
                : data.status === "error"
                  ? data.title
                  : "Enter a username to begin"}
          </span>
        </div>
        <div className="flex items-center gap-2">
        {options.animate && data.status === "ready" ? (
          <button
            type="button"
            onClick={() => setReplay((n) => n + 1)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <PlayIcon className="size-3" /> Replay
          </button>
        ) : null}
        <div className="flex rounded-md border border-border p-0.5" role="radiogroup" aria-label="Preview background">
          {(["dark", "light"] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={canvas === c}
              aria-label={c === "dark" ? "Dark README background" : "Light README background"}
              onClick={() => setCanvas(c)}
              className={cn(
                "rounded p-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                canvas === c ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {c === "dark" ? <MoonIcon className="size-3.5" /> : <SunIcon className="size-3.5" />}
            </button>
          ))}
        </div>
        </div>
      </div>
      <div
        className={cn(
          "relative flex flex-1 items-center justify-center overflow-auto rounded-xl border border-border p-6 transition-colors duration-300 sm:p-10",
          canvas === "dark" ? "bg-[#0d1117] bg-dots" : "bg-white bg-dots-light",
        )}
      >
        {data.status === "loading" ? (
          <div className="flex w-full max-w-[460px] animate-pulse flex-col gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-6">
            <div className="h-4 w-1/2 rounded bg-white/10" />
            <div className="h-3 w-3/4 rounded bg-white/5" />
            <div className="h-3 w-2/3 rounded bg-white/5" />
            <div className="h-3 w-4/5 rounded bg-white/5" />
            <Loader2Icon className="mx-auto mt-2 size-4 animate-spin text-white/30" aria-hidden />
          </div>
        ) : src && size ? (
          <CardImage
            src={src}
            alt={`${CARD_LABELS[deferredType]} preview`}
            width={size.width}
            height={size.height}
            className="drop-shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
          />
        ) : (
          <p className={cn("text-sm", canvas === "dark" ? "text-white/40" : "text-black/40")}>
            Your card will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
