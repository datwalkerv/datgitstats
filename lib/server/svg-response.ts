import "server-only";
import { API_PATHS, CARD_LABELS, isValidUsername, parseCardOptions, type CardOptionsMap, type CardType } from "@/lib/config";
import { cacheHeaders, ERROR_CACHE_HEADERS } from "@/lib/cache/headers";
import { renderErrorCard } from "@/lib/generators/error";
import { describeError } from "@/lib/github/errors";

const SVG_HEADERS = {
  "Content-Type": "image/svg+xml; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  // SVGs are images: forbid scripts and external loads if opened directly.
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:",
};

/**
 * Shared GET handler for the card endpoints: parse → load → render. Any failure is
 * returned as a valid error-card SVG (HTTP 200) so README images never break.
 */
export async function svgRoute<T extends CardType>(
  request: Request,
  type: T,
  render: (username: string, options: CardOptionsMap[T]) => Promise<string>,
): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const options = parseCardOptions(type, params);
  const username = params.get("username")?.trim() ?? params.get("user")?.trim();

  if (!isValidUsername(username)) {
    return svg(
      renderErrorCard({
        card: CARD_LABELS[type],
        title: username ? "Invalid username" : "Missing username",
        message: `Usage: ${API_PATHS[type]}?username=octocat`,
        options,
      }),
      ERROR_CACHE_HEADERS,
    );
  }

  try {
    const body = await render(username, options);
    return svg(body, cacheHeaders(options.cache_seconds));
  } catch (e) {
    console.error(`[${type}] ${username}:`, e instanceof Error ? e.message : e);
    const { title, message } = describeError(e);
    return svg(renderErrorCard({ card: CARD_LABELS[type], title, message, options }), ERROR_CACHE_HEADERS);
  }
}

function svg(body: string, cache: Record<string, string>): Response {
  return new Response(body, { status: 200, headers: { ...SVG_HEADERS, ...cache } });
}
