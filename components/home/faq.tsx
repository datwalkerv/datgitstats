import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeading } from "./section-heading";

const FAQ = [
  {
    q: "How is this different from github-readme-stats or streak-stats?",
    a: "It combines all three cards in one app with a shared theme system, a live generator and more layouts. It fetches and renders GitHub data itself, so it doesn't depend on those services being up.",
  },
  {
    q: "Do I need a GitHub token?",
    a: "No. Without one, the app uses GitHub's public REST API and contribution calendar. If the server has a GITHUB_TOKEN, it uses GraphQL for exact language byte counts, higher rate limits and faster requests. The token never reaches the browser.",
  },
  {
    q: "How often do cards update?",
    a: "GitHub data is cached for 1–2 hours on the server, and the image headers let GitHub's camo proxy and CDNs cache for about four hours. You can adjust this with cache_seconds.",
  },
  {
    q: "Are private repositories and contributions included?",
    a: "Private contributions show up if you enabled “Private contributions” on your GitHub profile. Private repository languages are included only when the server token can access them, such as when you self-host with your own token.",
  },
  {
    q: "How are top languages calculated?",
    a: "By default, it sums the language byte counts across your own repositories, excluding forks. You can switch to repository count or a weighted blend, and you can exclude archived repositories, specific repos or languages.",
  },
  {
    q: "Why can't I pick a Google Font?",
    a: "GitHub serves README images through a sandboxed proxy that blocks external resources, so web fonts inside the SVG would never load. The font options use carefully chosen system font stacks instead.",
  },
  {
    q: "What happens if GitHub is down or I'm rate limited?",
    a: "The server returns the last good data it has. If there isn't any, it returns a themed error card instead of a broken image.",
  },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="mx-auto w-full max-w-3xl scroll-mt-20 px-4 sm:px-6">
      <SectionHeading id="faq-heading" eyebrow="FAQ" title="Questions, answered." />
      <Accordion className="rounded-xl border border-border">
        {FAQ.map((f, i) => (
          <AccordionItem key={i} value={String(i)} className="border-border px-5">
            <AccordionTrigger className="py-4 text-sm hover:no-underline">{f.q}</AccordionTrigger>
            <AccordionContent>
              <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
