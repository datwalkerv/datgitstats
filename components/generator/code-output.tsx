"use client";

import { ExternalLinkIcon, LinkIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CARD_LABELS, type CardType } from "@/lib/config";
import { cardImageUrl, generatorQuery, type GeneratorState } from "@/lib/generator-state";
import { htmlSnippet, markdownSnippet, readmeMarkdown, readmeSection } from "@/lib/snippets";
import { CodeBlock } from "./code-block";
import { CopyButton } from "./copy-button";

export function CodeOutput({ state, origin }: { state: GeneratorState & { username: string }; origin: string }) {
  const { type, username, options } = state;
  const url = cardImageUrl(origin, type, username, options[type] as never);
  const [combined, setCombined] = useState<"html" | "md">("html");

  const snippets = useMemo(
    () => ({
      md: markdownSnippet(type, url, username),
      html: htmlSnippet(type, url, username),
      url,
    }),
    [type, url, username],
  );
  const shareUrl = `${origin}/generate?${generatorQuery(state)}`;
  const section =
    combined === "html" ? readmeSection(origin, username, options) : readmeMarkdown(origin, username, options);

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 [&>section]:min-w-0">
      <section aria-labelledby="snippet-heading" className="grid grid-cols-1 gap-3">
        <div className="flex items-center justify-between">
          <h2 id="snippet-heading" className="text-[13px] font-medium">
            {CARD_LABELS[type as CardType]}
          </h2>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Open SVG <ExternalLinkIcon className="size-3" />
          </a>
        </div>
        <Tabs defaultValue="md" className="min-w-0">
          <TabsList className="h-7">
            <TabsTrigger value="md" className="text-xs">Markdown</TabsTrigger>
            <TabsTrigger value="html" className="text-xs">HTML</TabsTrigger>
            <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
          </TabsList>
          <TabsContent value="md" className="mt-2">
            <CodeBlock code={snippets.md} label="Markdown snippet" />
          </TabsContent>
          <TabsContent value="html" className="mt-2">
            <CodeBlock code={snippets.html} label="HTML snippet" />
          </TabsContent>
          <TabsContent value="url" className="mt-2">
            <CodeBlock code={snippets.url} label="Image URL" />
          </TabsContent>
        </Tabs>
      </section>

      <section aria-labelledby="readme-heading" className="grid grid-cols-1 gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 id="readme-heading" className="text-[13px] font-medium">README section</h2>
            <p className="text-[11px] text-muted-foreground">All three cards, each with its own settings.</p>
          </div>
          <div className="flex rounded-md border border-border p-0.5 text-[11px]" role="radiogroup" aria-label="Snippet format">
            {(["html", "md"] as const).map((f) => (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={combined === f}
                onClick={() => setCombined(f)}
                className={
                  "rounded px-2 py-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none " +
                  (combined === f ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")
                }
              >
                {f === "html" ? "HTML" : "Markdown"}
              </button>
            ))}
          </div>
        </div>
        <CodeBlock code={section} label="README section" />
      </section>

      <section aria-labelledby="share-heading" className="grid grid-cols-1 gap-2">
        <h2 id="share-heading" className="text-[13px] font-medium">Share this configuration</h2>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-black/30 py-1 pr-1 pl-3">
          <LinkIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">{shareUrl}</span>
          <CopyButton value={shareUrl} label="Copy link" toastMessage="Share link copied" variant="secondary" showLabel />
        </div>
      </section>
    </div>
  );
}
