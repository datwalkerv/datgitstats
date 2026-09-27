/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { THEMES } from "@/lib/themes";
import { SectionHeading } from "./section-heading";

export function ThemeShowcase() {
  const cards = THEMES.filter((t) => t.id !== "default").map((t) => ({
    theme: t,
    src: `/api/demo?card=stats&animate=false&theme=${t.id}`,
  }));

  return (
    <section id="themes" aria-labelledby="themes-heading" className="mx-auto max-w-6xl scroll-mt-20 px-4 sm:px-6">
      <SectionHeading
        id="themes-heading"
        eyebrow="Themes"
        title={`${THEMES.length} themes, plus your own.`}
        description="Every theme is previewed with a real rendered card. Pick one as a starting point, then tweak any color or save your own palette."
      />
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ theme, src }) => (
          <li key={theme.id}>
            <Link
              href={`/generate?theme=${theme.id}`}
              className="group block rounded-xl border border-border p-2 transition-all hover:border-foreground/20 hover:bg-card/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <div
                className="flex aspect-[16/8] items-center justify-center overflow-hidden rounded-lg p-4"
                style={{ background: theme.dark ? "#0d1117" : "#f6f8fa" }}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-auto max-h-full w-auto max-w-full transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex items-center justify-between px-1.5 pt-2.5 pb-1 text-sm">
                <span>{theme.label}</span>
                <span className="flex gap-1" aria-hidden>
                  {[theme.bg, theme.title, theme.accent, theme.text].map((c, i) => (
                    <span key={i} className="size-3 rounded-full ring-1 ring-white/10" style={{ background: c }} />
                  ))}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
