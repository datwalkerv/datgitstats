import { GaugeIcon, LinkIcon, PaletteIcon, ServerIcon, ShieldCheckIcon, SlidersHorizontalIcon } from "lucide-react";
import { SectionHeading } from "./section-heading";

const FEATURES = [
  {
    icon: SlidersHorizontalIcon,
    title: "Every detail is configurable",
    body: "Toggle individual stats, pick from five language layouts, show or hide each streak section, and set size, padding, radius, font and opacity.",
  },
  {
    icon: PaletteIcon,
    title: "Themes and custom palettes",
    body: "Start from a built-in theme, override any of nine colors, including the contribution scale, and save palettes locally.",
  },
  {
    icon: LinkIcon,
    title: "One permanent URL",
    body: "All settings live in the query string. Paste the Markdown into your README and it keeps working.",
  },
  {
    icon: GaugeIcon,
    title: "Built for README traffic",
    body: "In-flight deduplication, a persistent data cache, CDN-friendly headers and stale-on-error fallbacks keep cards fast.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Never a broken image",
    body: "Invalid usernames, rate limits and GitHub downtime return a clean, themed error card instead of a broken image.",
  },
  {
    icon: ServerIcon,
    title: "Self-hostable",
    body: "Deploy to Vercel in a minute. It works without a token and uses an optional GITHUB_TOKEN for exact data and higher limits.",
  },
];

export function Features() {
  return (
    <section aria-labelledby="features-heading" className="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHeading
        id="features-heading"
        eyebrow="Customization"
        title="Three generators. One consistent system."
        description="Stats, top languages and streaks share the same themes, options and URL format, so your README looks consistent."
      />
      <div className="grid overflow-hidden rounded-2xl border border-border sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="-mt-px -ml-px border-t border-l border-border p-6 transition-colors hover:bg-card/40">
            <f.icon className="mb-4 size-4 text-muted-foreground" aria-hidden />
            <h3 className="text-sm font-medium">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
