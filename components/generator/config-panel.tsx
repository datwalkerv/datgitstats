"use client";

import { useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CustomThemeEditor } from "@/components/themes/custom-theme-editor";
import { ThemeGallery } from "@/components/themes/theme-gallery";
import type { CardOptionsMap, CardType, CommonOptions, StatsOptions, StreakOptions, TopLangsOptions } from "@/lib/config";
import { FONTS } from "@/lib/config/common";
import { rowsToHideShow, STAT_ROWS, visibleStatRows, type StatRowId } from "@/lib/config/stats";
import { LANG_LAYOUTS, type LangLayout } from "@/lib/config/top-langs";
import { COLOR_KEYS } from "@/lib/generator-state";
import { computeTopLanguages } from "@/lib/utils/languages";
import type { CustomTheme } from "@/hooks/use-custom-themes";
import type { UserBundle } from "@/types/github";
import { ChipGroup, Segmented, SelectRow, SliderRow, SwitchRow, TextRow } from "./controls";

export interface ConfigPanelProps {
  type: CardType;
  options: CardOptionsMap[CardType];
  defaults: CardOptionsMap[CardType];
  bundle: UserBundle | null;
  onChange: (patch: Record<string, unknown>) => void;
  customThemes: CustomTheme[];
  activeCustomId: string | null;
  onSelectCustom: (t: CustomTheme) => void;
  onSaveCustom: (t: Omit<CustomTheme, "id">) => void;
  onDeleteCustom: (id: string) => void;
  syncAppearance: boolean;
  onSyncAppearanceChange: (v: boolean) => void;
}

const FONT_LABELS: Record<(typeof FONTS)[number], string> = {
  system: "System sans",
  mono: "Monospace",
  serif: "Serif",
  rounded: "Rounded",
};

const LAYOUT_LABELS: Record<LangLayout, string> = {
  bars: "Bars",
  compact: "Compact",
  donut: "Donut",
  pie: "Pie",
  percent: "Percent",
};

function LayoutGlyph({ layout }: { layout: LangLayout }) {
  const common = { className: "size-4", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.5, "aria-hidden": true };
  switch (layout) {
    case "bars":
      return (
        <svg {...common}>
          <path d="M2 4h12M2 8h8M2 12h5" strokeLinecap="round" />
        </svg>
      );
    case "compact":
      return (
        <svg {...common}>
          <rect x="2" y="3" width="12" height="3" rx="1.5" />
          <path d="M3 10h3M9 10h3M3 13h3" strokeLinecap="round" />
        </svg>
      );
    case "donut":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="5.5" />
          <circle cx="8" cy="8" r="2.5" />
        </svg>
      );
    case "pie":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="5.5" />
          <path d="M8 2.5V8l4.5 3" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M2 4h3M7 4h7M2 8h3M7 8h4M2 12h3M7 12h6" strokeLinecap="round" />
        </svg>
      );
  }
}

function Section({ value, title, children }: { value: string; title: string; children: React.ReactNode }) {
  return (
    <AccordionItem value={value} className="border-border/70">
      <AccordionTrigger className="px-4 py-3.5 text-[13px] font-medium hover:no-underline">{title}</AccordionTrigger>
      <AccordionContent>
        <div className="grid gap-5 px-4 pt-1 pb-5">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

function StatsContent({ o, onChange }: { o: StatsOptions; onChange: ConfigPanelProps["onChange"] }) {
  const visible = visibleStatRows(o.hide, o.show);
  return (
    <>
      <ChipGroup
        label="Statistics"
        options={STAT_ROWS.map((r) => ({ value: r.id, label: r.label }))}
        selected={visible}
        onToggle={(id: StatRowId) => {
          const next = visible.includes(id) ? visible.filter((v) => v !== id) : [...visible, id];
          onChange(rowsToHideShow(next));
        }}
      />
      <div className="grid gap-1">
        <SwitchRow label="Show rank" checked={!o.hide_rank} onCheckedChange={(v) => onChange({ hide_rank: !v })} />
        <SwitchRow
          label="All-time commits"
          description="Off counts only this year's commits."
          checked={o.include_all_commits}
          onCheckedChange={(v) => onChange({ include_all_commits: v })}
        />
        <SwitchRow label="Show avatar" checked={o.show_avatar} onCheckedChange={(v) => onChange({ show_avatar: v })} />
      </div>
      <Segmented
        label="Number format"
        value={o.number_format}
        options={[
          { value: "short", label: "1.2k" },
          { value: "long", label: "1,234" },
        ]}
        onValueChange={(v) => onChange({ number_format: v })}
      />
    </>
  );
}

function TopLangsContent({
  o,
  onChange,
  bundle,
}: {
  o: TopLangsOptions;
  onChange: ConfigPanelProps["onChange"];
  bundle: UserBundle | null;
}) {
  // Every language the user has (ignoring the hide list) so they can be toggled off.
  const allLanguages = useMemo(() => {
    if (!bundle) return [];
    return computeTopLanguages(bundle.repos, {
      method: "bytes", sizeWeight: 1, countWeight: 0, includeForks: o.include_forks, includeArchived: o.include_archived,
      excludeRepos: o.exclude_repo, hide: [], count: 40, showOther: false,
    }).map((l) => l.name);
  }, [bundle, o.include_forks, o.include_archived, o.exclude_repo]);
  const hidden = new Set(o.hide);

  return (
    <>
      <fieldset>
        <legend className="mb-2 text-xs font-medium text-muted-foreground">Layout</legend>
        <div role="radiogroup" aria-label="Layout" className="grid grid-cols-5 gap-1.5">
          {LANG_LAYOUTS.map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={o.layout === l}
              onClick={() => onChange({ layout: l })}
              className={
                "flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10px] transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none " +
                (o.layout === l
                  ? "border-foreground/40 bg-foreground/[0.06] text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground")
              }
            >
              <LayoutGlyph layout={l} />
              {LAYOUT_LABELS[l]}
            </button>
          ))}
        </div>
      </fieldset>
      <SliderRow
        label="Languages"
        unit=""
        value={o.langs_count}
        min={1}
        max={20}
        defaultValue={6}
        onValueChange={(v) => onChange({ langs_count: v })}
      />
      <SelectRow
        label="Calculation"
        value={o.method}
        options={[
          { value: "bytes", label: "Code size (bytes)" },
          { value: "repos", label: "Repository count" },
          { value: "weighted", label: "Weighted (size × count)" },
        ]}
        onValueChange={(v) => onChange({ method: v })}
      />
      {o.method === "weighted" ? (
        <div className="grid grid-cols-2 gap-3">
          <SliderRow label="Size weight" unit="" step={0.1} value={o.size_weight} min={0} max={2} onValueChange={(v) => onChange({ size_weight: v })} />
          <SliderRow label="Count weight" unit="" step={0.1} value={o.count_weight} min={0} max={2} onValueChange={(v) => onChange({ count_weight: v })} />
        </div>
      ) : null}
      {bundle?.languagesApproximate ? (
        <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          Byte counts are estimated from each repository&apos;s primary language. Configure <code className="font-mono">GITHUB_TOKEN</code>{" "}
          on the server for exact per-language sizes.
        </p>
      ) : null}
      <div className="grid gap-1">
        <SwitchRow label="Show percentages" checked={o.show_percent} onCheckedChange={(v) => onChange({ show_percent: v })} />
        <SwitchRow label="Group rest as “Other”" checked={o.show_other} onCheckedChange={(v) => onChange({ show_other: v })} />
        <SwitchRow label="Include forks" checked={o.include_forks} onCheckedChange={(v) => onChange({ include_forks: v })} />
        <SwitchRow label="Include archived" checked={o.include_archived} onCheckedChange={(v) => onChange({ include_archived: v })} />
      </div>
      {allLanguages.length ? (
        <ChipGroup
          label="Visible languages"
          options={allLanguages.map((l) => ({ value: l, label: l }))}
          selected={allLanguages.filter((l) => !hidden.has(l.toLowerCase()))}
          onToggle={(l) => {
            const key = l.toLowerCase();
            onChange({ hide: hidden.has(key) ? o.hide.filter((h) => h !== key) : [...o.hide, key] });
          }}
        />
      ) : null}
      <TextRow
        label="Exclude repositories"
        value={o.exclude_repo.join(", ")}
        placeholder="dotfiles, playground"
        hint="Comma-separated repository names."
        onValueChange={(v) =>
          onChange({ exclude_repo: v.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean) })
        }
      />
    </>
  );
}

function StreakContent({ o, onChange }: { o: StreakOptions; onChange: ConfigPanelProps["onChange"] }) {
  return (
    <>
      <div className="grid gap-1">
        <SwitchRow
          label="Total contributions"
          checked={!o.hide_total_contributions}
          onCheckedChange={(v) => onChange({ hide_total_contributions: !v })}
        />
        <SwitchRow label="Current streak" checked={!o.hide_current_streak} onCheckedChange={(v) => onChange({ hide_current_streak: !v })} />
        <SwitchRow label="Longest streak" checked={!o.hide_longest_streak} onCheckedChange={(v) => onChange({ hide_longest_streak: !v })} />
      </div>
      <Segmented
        label="Streak unit"
        value={o.mode}
        options={[
          { value: "daily", label: "Days" },
          { value: "weekly", label: "Weeks" },
        ]}
        onValueChange={(v) => onChange({ mode: v })}
      />
      <SwitchRow
        label="Contribution graph"
        description="Heat strip of recent activity."
        checked={o.show_graph}
        onCheckedChange={(v) => onChange({ show_graph: v })}
      />
      {o.show_graph ? (
        <SliderRow label="Graph weeks" unit="wk" value={o.graph_weeks} min={4} max={53} defaultValue={26} onValueChange={(v) => onChange({ graph_weeks: v })} />
      ) : null}
      <Segmented
        label="Date format"
        value={o.date_format}
        options={[
          { value: "short", label: "Jan 5, 2025" },
          { value: "iso", label: "2025-01-05" },
        ]}
        onValueChange={(v) => onChange({ date_format: v })}
      />
    </>
  );
}

export function ConfigPanel(p: ConfigPanelProps) {
  const o = p.options as CommonOptions;
  const d = p.defaults as CommonOptions;
  const hasOverrides = COLOR_KEYS.some((k) => o[k]) || !!o.contrib_colors;

  return (
    <Accordion multiple defaultValue={["theme", "content"]} className="w-full">
      <Section value="theme" title="Theme">
        <SwitchRow
          label="Same appearance on all cards"
          description="Theme, colors and style apply to every card."
          checked={p.syncAppearance}
          onCheckedChange={p.onSyncAppearanceChange}
        />
        <ThemeGallery
          type={p.type}
          bundle={p.bundle}
          options={p.options}
          activeTheme={o.theme}
          hasOverrides={hasOverrides}
          customThemes={p.customThemes}
          activeCustomId={p.activeCustomId}
          onSelect={(id) =>
            p.onChange({ theme: id, ...Object.fromEntries(COLOR_KEYS.map((k) => [k, undefined])), contrib_colors: undefined })
          }
          onSelectCustom={p.onSelectCustom}
          onDeleteCustom={p.onDeleteCustom}
        />
      </Section>

      <Section value="content" title="Content">
        {p.type === "stats" ? (
          <StatsContent o={p.options as StatsOptions} onChange={p.onChange} />
        ) : p.type === "top-langs" ? (
          <TopLangsContent o={p.options as TopLangsOptions} onChange={p.onChange} bundle={p.bundle} />
        ) : (
          <StreakContent o={p.options as StreakOptions} onChange={p.onChange} />
        )}
      </Section>

      <Section value="text" title="Title & labels">
        <SwitchRow label="Show title" checked={!o.hide_title} onCheckedChange={(v) => p.onChange({ hide_title: !v })} />
        <TextRow
          label="Custom title"
          value={o.custom_title ?? ""}
          placeholder={p.type === "streak" ? "No title by default" : "Default title"}
          maxLength={60}
          onValueChange={(v) => p.onChange({ custom_title: v.trim() ? v : undefined })}
        />
        {p.type !== "top-langs" ? (
          <>
            <SwitchRow label="Show icons" checked={o.show_icons} onCheckedChange={(v) => p.onChange({ show_icons: v })} />
            <SwitchRow label="Show labels" checked={!o.hide_labels} onCheckedChange={(v) => p.onChange({ hide_labels: !v })} />
          </>
        ) : null}
      </Section>

      <Section value="layout" title="Size & typography">
        <div className="grid grid-cols-2 gap-3">
          <SliderRow label="Width" value={o.width} min={200} max={1000} autoLabel="auto" defaultValue={d.width} onValueChange={(v) => p.onChange({ width: v })} />
          <SliderRow label="Height" value={o.height} min={80} max={1000} autoLabel="auto" defaultValue={d.height} onValueChange={(v) => p.onChange({ height: v })} />
        </div>
        <SliderRow label="Padding" value={o.padding} min={8} max={48} defaultValue={d.padding} onValueChange={(v) => p.onChange({ padding: v })} />
        <SelectRow
          label="Font"
          value={o.font}
          options={FONTS.map((f) => ({ value: f, label: FONT_LABELS[f] }))}
          onValueChange={(v) => p.onChange({ font: v })}
        />
        <SliderRow label="Font size" value={o.font_size} min={10} max={20} defaultValue={d.font_size} onValueChange={(v) => p.onChange({ font_size: v })} />
      </Section>

      <Section value="style" title="Border & background">
        <SwitchRow label="Show border" checked={!o.hide_border} onCheckedChange={(v) => p.onChange({ hide_border: !v })} />
        <SliderRow label="Border radius" value={o.border_radius} min={0} max={40} step={0.5} defaultValue={d.border_radius} onValueChange={(v) => p.onChange({ border_radius: v })} />
        <SliderRow label="Background opacity" unit="%" value={o.bg_opacity} min={0} max={100} defaultValue={d.bg_opacity} onValueChange={(v) => p.onChange({ bg_opacity: v })} />
        <SwitchRow
          label="Animations"
          description="Subtle fade-in; disabled for reduced-motion users."
          checked={o.animate}
          onCheckedChange={(v) => p.onChange({ animate: v })}
        />
      </Section>

      <Section value="colors" title="Custom colors">
        <CustomThemeEditor options={o} onChange={p.onChange} onSave={p.onSaveCustom} />
      </Section>

      <Section value="advanced" title="Advanced">
        <div className="grid gap-2">
          <SelectRow
            label="Cache duration"
            value={String(o.cache_seconds)}
            options={[
              { value: "0", label: "Default (4 hours)" },
              { value: "1800", label: "30 minutes" },
              { value: "3600", label: "1 hour" },
              { value: "43200", label: "12 hours" },
              { value: "86400", label: "24 hours" },
            ]}
            onValueChange={(v) => p.onChange({ cache_seconds: Number(v) })}
          />
          <p className="text-[11px] leading-relaxed text-muted-foreground/70">
            How long GitHub&apos;s image proxy and CDNs may cache the card.
          </p>
        </div>
      </Section>
    </Accordion>
  );
}
