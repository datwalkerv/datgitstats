"use client";

import { XIcon } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

const HEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function toSix(hex: string) {
  const h = hex.replace("#", "");
  if (h.length === 3) return "#" + h.split("").map((c) => c + c).join("");
  return "#" + h.slice(0, 6);
}

/** Native color picker + hex input. `value` undefined = inherit from theme (`fallback`). */
export function ColorField({
  label,
  value,
  fallback,
  onChange,
  compact,
}: {
  label: string;
  value: string | undefined;
  fallback: string;
  onChange: (v: string | undefined) => void;
  compact?: boolean;
}) {
  const id = useId();
  const shown = value ?? fallback;
  const [draft, setDraft] = useState(shown.replace("#", ""));
  const [prevShown, setPrevShown] = useState(shown);
  if (prevShown !== shown) {
    setPrevShown(shown);
    setDraft(shown.replace("#", ""));
  }

  const commit = (raw: string) => {
    if (HEX.test(raw)) onChange("#" + raw.replace("#", "").toLowerCase());
    else setDraft(shown.replace("#", ""));
  };

  return (
    <div className={cn("flex items-center gap-2", compact && "gap-1.5")}>
      <label
        className="relative size-7 shrink-0 cursor-pointer overflow-hidden rounded-md ring-1 ring-border transition-shadow ring-inset has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
        style={{ background: shown }}
      >
        <span className="sr-only">{label} color picker</span>
        <input
          type="color"
          value={toSix(shown)}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </label>
      {!compact && (
        <div className="grid min-w-0 flex-1 gap-0.5">
          <label htmlFor={id} className="truncate text-[11px] text-muted-foreground">
            {label}
          </label>
          <div className="flex items-center">
            <span className="font-mono text-xs text-muted-foreground/50">#</span>
            <input
              id={id}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={(e) => commit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commit((e.target as HTMLInputElement).value)}
              spellCheck={false}
              maxLength={8}
              className={cn(
                "w-full min-w-0 bg-transparent font-mono text-xs uppercase outline-none focus-visible:underline",
                value ? "text-foreground" : "text-muted-foreground/70",
              )}
            />
          </div>
        </div>
      )}
      {value && !compact ? (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          aria-label={`Reset ${label} to theme default`}
          className="rounded p-1 text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <XIcon className="size-3" />
        </button>
      ) : null}
    </div>
  );
}
