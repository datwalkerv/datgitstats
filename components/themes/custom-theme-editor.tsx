"use client";

import { RotateCcwIcon, SaveIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { CommonOptions } from "@/lib/config";
import { COLOR_KEYS, type ColorKey } from "@/lib/generator-state";
import { resolveTheme } from "@/lib/generators/primitives";
import type { CustomTheme } from "@/hooks/use-custom-themes";
import { ColorField } from "./color-field";

const LABELS: Record<ColorKey, string> = {
  bg_color: "Background",
  text_color: "Text",
  title_color: "Title",
  icon_color: "Icon",
  border_color: "Border",
  accent_color: "Accent",
  ring_color: "Progress / ring",
  muted_color: "Secondary text",
};

const THEME_KEY: Record<ColorKey, keyof ReturnType<typeof resolveTheme>> = {
  bg_color: "bg",
  text_color: "text",
  title_color: "title",
  icon_color: "icon",
  border_color: "border",
  accent_color: "accent",
  ring_color: "ring",
  muted_color: "muted",
};

interface Props {
  options: CommonOptions;
  onChange: (patch: Partial<CommonOptions>) => void;
  onSave: (t: Omit<CustomTheme, "id">) => void;
}

export function CustomThemeEditor({ options, onChange, onSave }: Props) {
  const [name, setName] = useState("");
  // Fallbacks come from the base theme without overrides, so "inherit" shows the true theme value.
  const base = resolveTheme({ ...options, ...Object.fromEntries(COLOR_KEYS.map((k) => [k, undefined])), contrib_colors: undefined });
  const hasOverrides = COLOR_KEYS.some((k) => options[k]) || !!options.contrib_colors;
  const contrib = options.contrib_colors ?? base.contrib;

  function save() {
    const trimmed = name.trim() || `Custom ${new Date().toLocaleDateString()}`;
    const colors: Partial<Record<ColorKey, string>> = {};
    const resolved = resolveTheme(options);
    for (const k of COLOR_KEYS) colors[k] = options[k] ?? (resolved[THEME_KEY[k]] as string);
    onSave({ name: trimmed, base: options.theme, colors, contrib: [...contrib] });
    setName("");
    toast.success(`Saved “${trimmed}”`, { description: "Stored in this browser." });
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        {COLOR_KEYS.map((k) => (
          <ColorField
            key={k}
            label={LABELS[k]}
            value={options[k]}
            fallback={base[THEME_KEY[k]] as string}
            onChange={(v) => onChange({ [k]: v } as Partial<CommonOptions>)}
          />
        ))}
      </div>

      <div className="grid gap-2">
        <p className="text-[11px] text-muted-foreground">Contribution colors</p>
        <div className="flex items-center gap-1.5">
          {contrib.map((c, i) => (
            <ColorField
              key={i}
              compact
              label={`Level ${i}`}
              value={options.contrib_colors?.[i]}
              fallback={c}
              onChange={(v) => {
                const next = [...contrib];
                next[i] = v ?? base.contrib[i];
                onChange({ contrib_colors: next });
              }}
            />
          ))}
          {options.contrib_colors ? (
            <button
              type="button"
              onClick={() => onChange({ contrib_colors: undefined })}
              className="ml-1 text-[11px] text-muted-foreground/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2 border-t border-border pt-4">
        <label htmlFor="custom-theme-name" className="text-[11px] text-muted-foreground">
          Save current colors as a theme
        </label>
        <div className="flex gap-2">
          <input
            id="custom-theme-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="My theme"
            maxLength={40}
            className="h-8 min-w-0 flex-1 rounded-md border border-input bg-input/30 px-2.5 text-sm outline-none placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          <Button type="button" size="sm" variant="secondary" onClick={save} className="h-8">
            <SaveIcon /> Save
          </Button>
        </div>
        {hasOverrides ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="justify-start px-1.5 text-muted-foreground"
            onClick={() =>
              onChange({ ...Object.fromEntries(COLOR_KEYS.map((k) => [k, undefined])), contrib_colors: undefined })
            }
          >
            <RotateCcwIcon /> Reset all colors to theme
          </Button>
        ) : null}
      </div>
    </div>
  );
}
