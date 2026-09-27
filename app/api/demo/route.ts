import { CARD_TYPES, parseCardOptions, type CardType } from "@/lib/config";
import { demoBundle } from "@/lib/demo-data";
import { renderCard } from "@/lib/generators";

/** Sample cards (no GitHub requests) used by the theme gallery and docs. */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const raw = params.get("card") ?? "stats";
  const type: CardType = (CARD_TYPES as readonly string[]).includes(raw) ? (raw as CardType) : "stats";
  const svg = renderCard(type, demoBundle(), parseCardOptions(type, params) as never);
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
