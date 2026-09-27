export const DEFAULT_CACHE_SECONDS = 4 * 60 * 60; // 4h at the CDN
const BROWSER_SECONDS = 30 * 60;
const MIN_SECONDS = 30 * 60;
const MAX_SECONDS = 24 * 60 * 60;

export function cacheHeaders(cacheSeconds?: number): Record<string, string> {
  const s = cacheSeconds ? Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, cacheSeconds)) : DEFAULT_CACHE_SECONDS;
  const browser = Math.min(BROWSER_SECONDS, s);
  return {
    "Cache-Control": `public, max-age=${browser}, s-maxage=${s}, stale-while-revalidate=86400, stale-if-error=86400`,
  };
}

export const ERROR_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
};
