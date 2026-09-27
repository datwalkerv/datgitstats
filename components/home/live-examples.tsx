/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { DEMO_USERNAME } from "@/lib/site";

const CARDS = [
  { path: "/api/stats", q: "", alt: "GitHub Stats card", className: "sm:col-span-2 lg:col-span-1" },
  { path: "/api/top-langs", q: "&layout=donut", alt: "Top Languages card", className: "" },
  { path: "/api/streak", q: "", alt: "GitHub Streak card", className: "" },
];

/** Real cards served by this deployment's own API. */
export function LiveExamples() {
  return (
    <section aria-labelledby="live-heading" className="mx-auto max-w-6xl px-4 sm:px-6">
      <h2 id="live-heading" className="sr-only">
        Live example
      </h2>
      <div className="relative rounded-2xl border border-border bg-[#0d1117] bg-dots p-4 shadow-2xl shadow-black/40 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-white/10" />
            <span className="size-2.5 rounded-full bg-white/10" />
            <span className="size-2.5 rounded-full bg-white/10" />
          </div>
          <p className="truncate font-mono text-[11px] text-white/40">github.com/{DEMO_USERNAME} · README.md</p>
          <Link
            href={`/generate?username=${DEMO_USERNAME}`}
            className="inline-flex shrink-0 items-center gap-1 text-[11px] text-white/50 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Customize <ArrowUpRightIcon className="size-3" />
          </Link>
        </div>
        <div className="flex flex-wrap items-start justify-center gap-4">
          {CARDS.map((c) => (
            <img
              key={c.path}
              src={`${c.path}?username=${DEMO_USERNAME}${c.q}`}
              alt={`${c.alt} for ${DEMO_USERNAME}`}
              loading="lazy"
              className="h-auto max-w-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
