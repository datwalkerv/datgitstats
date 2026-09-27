import { unstable_cache } from "next/cache";
import { LRU } from "./lru";

const memory = new LRU<unknown>(500);
const negative = new LRU<unknown>(500);
const inflight = new Map<string, Promise<unknown>>();

export interface CacheOptions {
  /** Seconds before the value is refreshed. */
  ttl: number;
  tags?: string[];
  /** Seconds to remember a thrown error for (avoids hammering GitHub for bad usernames). */
  negativeTtl?: number;
  shouldCacheError?: (e: unknown) => boolean;
}

/**
 * Layered cache: in-flight dedup → in-memory LRU → Next.js data cache (shared across
 * serverless instances on Vercel) → loader. If a refresh fails, the last known value
 * is returned instead of the error.
 */
export async function cached<T>(key: string, loader: () => Promise<T>, opts: CacheOptions): Promise<T> {
  const hit = memory.get(key) as { value: T; fresh: boolean } | undefined;
  if (hit?.fresh) return hit.value;

  const neg = negative.get(key);
  if (neg?.fresh) throw neg.value;

  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const run = (async () => {
    try {
      const value = await persistent(key, loader, opts);
      memory.set(key, value, opts.ttl);
      return value;
    } catch (e) {
      if (hit) return hit.value;
      if (opts.negativeTtl && (opts.shouldCacheError?.(e) ?? true)) negative.set(key, e, opts.negativeTtl);
      throw e;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, run);
  return run;
}

async function persistent<T>(key: string, loader: () => Promise<T>, opts: CacheOptions): Promise<T> {
  let loaderCalled = false;
  const wrapped = () => {
    loaderCalled = true;
    return loader();
  };
  try {
    return await unstable_cache(wrapped, ["gh", key], { revalidate: opts.ttl, tags: opts.tags })();
  } catch (e) {
    // Outside a Next.js request (tests, scripts) the data cache is unavailable.
    if (!loaderCalled) return loader();
    throw e;
  }
}
