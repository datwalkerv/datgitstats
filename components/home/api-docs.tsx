import { CodeBlock } from "@/components/generator/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_PATHS, CARD_FIELDS, CARD_LABELS, CARD_TYPES } from "@/lib/config";
import { commonFields } from "@/lib/config/common";
import type { Field } from "@/lib/config/fields";
import { siteUrl } from "@/lib/site";
import { SectionHeading } from "./section-heading";

function typeLabel(f: Field<unknown>): string {
  switch (f.kind) {
    case "enum":
      return f.options!.length > 6 ? "enum" : f.options!.join(" | ");
    case "int":
    case "float":
      return `${f.kind === "int" ? "integer" : "number"} ${f.min}–${f.max}`;
    case "color":
      return "hex color";
    case "colors":
      return "hex, ×5";
    case "list":
      return "comma list";
    default:
      return f.kind;
  }
}

function defaultLabel(f: Field<unknown>): string {
  const d = f.default;
  if (d === undefined) return "—";
  if (Array.isArray(d)) return d.length ? d.join(",") : "—";
  if ((f.kind === "int" || f.kind === "float") && d === 0 && /auto|default/i.test(f.doc)) return "auto";
  return String(d);
}

function ParamTable({ fields }: { fields: Record<string, Field<unknown>> }) {
  return (
    <div className="scrollbar-thin overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-border bg-card/40 text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-medium">Parameter</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Type</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Default</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {Object.entries(fields).map(([key, f]) => (
            <tr key={key} className="align-top">
              <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap text-foreground">{key}</td>
              <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{typeLabel(f)}</td>
              <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{defaultLabel(f)}</td>
              <td className="px-4 py-2.5 text-xs leading-relaxed text-muted-foreground">{f.doc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Parameter reference generated from the same schemas the API uses, so it can't drift. */
export function ApiDocs() {
  const origin = siteUrl();
  const commonKeys = new Set(Object.keys(commonFields));
  return (
    <section id="api" aria-labelledby="api-heading" className="mx-auto max-w-6xl scroll-mt-20 px-4 sm:px-6">
      <SectionHeading
        id="api-heading"
        eyebrow="API"
        title="Plain URLs, returning SVG."
        description="Each endpoint takes a username plus optional parameters and returns image/svg+xml. Invalid values fall back to defaults, so a typo won't break your README."
      />
      <div className="mb-8 grid gap-3 md:grid-cols-3">
        {CARD_TYPES.map((t) => (
          <div key={t} className="rounded-lg border border-border p-4">
            <p className="text-sm font-medium">{CARD_LABELS[t]}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">GET {API_PATHS[t]}</p>
          </div>
        ))}
      </div>
      <CodeBlock
        label="API example"
        className="mb-8"
        code={`${origin}/api/stats?username=octocat&theme=dracula&hide_border=true&show=followers,age
${origin}/api/top-langs?username=octocat&layout=donut&langs_count=8&hide=html,css
${origin}/api/streak?username=octocat&theme=nord&hide_current_streak=true&show_graph=true`}
      />
      <Tabs defaultValue="stats">
        <TabsList>
          {CARD_TYPES.map((t) => (
            <TabsTrigger key={t} value={t} className="text-xs">
              {CARD_LABELS[t]}
            </TabsTrigger>
          ))}
          <TabsTrigger value="common" className="text-xs">
            Common
          </TabsTrigger>
        </TabsList>
        {CARD_TYPES.map((t) => (
          <TabsContent key={t} value={t} className="mt-4">
            <ParamTable
              fields={{
                username: { kind: "text", default: undefined, doc: "GitHub username (required)." } as Field<unknown>,
                ...Object.fromEntries(Object.entries(CARD_FIELDS[t]).filter(([k]) => !commonKeys.has(k))),
              }}
            />
            <p className="mt-3 text-xs text-muted-foreground">Plus all parameters under “Common”.</p>
          </TabsContent>
        ))}
        <TabsContent value="common" className="mt-4">
          <ParamTable fields={commonFields as unknown as Record<string, Field<unknown>>} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
