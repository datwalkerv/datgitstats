"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/site/logo";
import { UsernameForm } from "@/components/site/username-form";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CARD_LABELS, CARD_TYPES, defaultCardOptions, type CardType } from "@/lib/config";
import {
  APPEARANCE_KEYS,
  COLOR_KEYS,
  generatorQuery,
  parseGeneratorState,
  type AllOptions,
  type GeneratorState,
} from "@/lib/generator-state";
import { useBundle } from "@/hooks/use-bundle";
import { useCustomThemes, type CustomTheme } from "@/hooks/use-custom-themes";
import { useOrigin } from "@/hooks/use-origin";
import { CardPicker } from "./card-picker";
import { CodeOutput } from "./code-output";
import { ConfigPanel } from "./config-panel";
import { Preview } from "./preview";

const APPEARANCE = new Set<string>(APPEARANCE_KEYS);

export function Generator({ initialQuery }: { initialQuery: string }) {
  const [state, setState] = useState<GeneratorState>(() => parseGeneratorState(new URLSearchParams(initialQuery)));
  const [sync, setSync] = useState(true);
  const [activeCustomId, setActiveCustomId] = useState<string | null>(null);
  const data = useBundle(state.username);
  const origin = useOrigin();
  const custom = useCustomThemes();

  // Keep the address bar shareable without triggering navigations.
  useEffect(() => {
    const t = setTimeout(() => {
      window.history.replaceState(window.history.state, "", `/generate?${generatorQuery(state)}`);
    }, 250);
    return () => clearTimeout(t);
  }, [state]);

  const onChange = useCallback(
    (patch: Record<string, unknown>) => {
      setState((s) => {
        const options = { ...s.options } as Record<CardType, Record<string, unknown>>;
        const shared: Record<string, unknown> = {};
        const local: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(patch)) (sync && APPEARANCE.has(k) ? shared : local)[k] = v;
        for (const t of CARD_TYPES) {
          options[t] = { ...options[t], ...shared, ...(t === s.type ? local : {}) };
        }
        return { ...s, options: options as unknown as AllOptions };
      });
      if ("theme" in patch) setActiveCustomId(null);
    },
    [sync],
  );

  const applyCustom = useCallback(
    (t: CustomTheme) => {
      onChange({ theme: t.base, ...t.colors, contrib_colors: t.contrib });
      setActiveCustomId(t.id);
    },
    [onChange],
  );

  const setType = useCallback((type: CardType) => setState((s) => ({ ...s, type })), []);
  const setUsername = useCallback((username: string) => setState((s) => ({ ...s, username })), []);
  const reset = useCallback(() => {
    setState((s) => ({ ...s, options: { ...s.options, [s.type]: defaultCardOptions(s.type) } }));
    setActiveCustomId(null);
  }, []);

  const bundle = data.status === "ready" ? data.bundle : null;
  const options = state.options[state.type];
  const defaults = useMemo(() => defaultCardOptions(state.type), [state.type]);

  const panel = (
    <ConfigPanel
      type={state.type}
      options={options}
      defaults={defaults}
      bundle={bundle}
      onChange={onChange}
      customThemes={custom.themes}
      activeCustomId={activeCustomId}
      onSelectCustom={applyCustom}
      onSaveCustom={(t) => setActiveCustomId(custom.save(t))}
      onDeleteCustom={(id) => {
        custom.remove(id);
        if (activeCustomId === id) setActiveCustomId(null);
      }}
      syncAppearance={sync}
      onSyncAppearanceChange={setSync}
    />
  );

  const hasColorEdits = COLOR_KEYS.some((k) => (options as Record<string, unknown>)[k]);

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <header className="z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl">
        <Logo className="shrink-0" compact />
        <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
        <div className="min-w-0 flex-1 sm:max-w-md sm:flex-none sm:basis-md">
          <UsernameForm
            key={state.username ?? ""}
            size="sm"
            defaultValue={state.username ?? ""}
            onSubmit={setUsername}
            loading={data.status === "loading"}
            autoFocus={!state.username}
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Configuration sidebar (desktop) */}
        <aside
          aria-label="Card configuration"
          className="hidden w-[320px] shrink-0 flex-col border-r border-border/70 bg-sidebar/40 lg:flex"
        >
          <div className="grid gap-3 border-b border-border/70 p-4">
            <CardPicker value={state.type} onChange={setType} />
          </div>
          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">{panel}</div>
          <div className="flex items-center justify-between border-t border-border/70 px-4 py-2.5 text-[11px] text-muted-foreground">
            <span>{hasColorEdits ? "Custom colors applied" : "Settings save to the URL"}</span>
            <button
              type="button"
              onClick={reset}
              className="rounded px-1 transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Reset card
            </button>
          </div>
        </aside>

        <main id="main" className="flex min-h-0 min-w-0 flex-1 flex-col xl:flex-row">
          <section aria-label="Preview" className="flex min-h-0 min-w-0 flex-1 flex-col p-4 sm:p-6">
            <div className="mb-4 lg:hidden">
              <CardPicker value={state.type} onChange={setType} />
            </div>
            <h1 className="sr-only">{CARD_LABELS[state.type]} generator</h1>
            <Preview type={state.type} options={options} data={data} />
            <div className="mt-4 lg:hidden">
              <Sheet>
                <SheetTrigger render={<Button variant="outline" className="h-10 w-full" />}>
                  <SlidersHorizontalIcon /> Customize {CARD_LABELS[state.type]}
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85dvh] gap-0 rounded-t-2xl p-0">
                  <SheetHeader className="border-b border-border/70 px-4 py-3">
                    <SheetTitle className="text-sm">Customize</SheetTitle>
                    <SheetDescription className="text-xs">Changes apply to the preview instantly.</SheetDescription>
                  </SheetHeader>
                  <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pb-6">{panel}</div>
                </SheetContent>
              </Sheet>
            </div>
          </section>

          <aside
            aria-label="README code"
            className="scrollbar-thin min-w-0 shrink-0 border-t border-border/70 p-4 sm:p-6 xl:w-[380px] xl:overflow-y-auto xl:border-t-0 xl:border-l"
          >
            {state.username ? (
              <CodeOutput state={{ ...state, username: state.username }} origin={origin} />
            ) : (
              <div className="grid gap-2 text-sm text-muted-foreground">
                <h2 className="text-[13px] font-medium text-foreground">README code</h2>
                <p>Enter a GitHub username to get Markdown and HTML snippets.</p>
              </div>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}
