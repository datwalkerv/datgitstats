import "server-only";
import { GitHubError, notFound, rateLimited, unavailable } from "./errors";

const API = "https://api.github.com";
const TIMEOUT_MS = 10_000;
const USER_AGENT = "datgitstats (+https://github.com)";

/**
 * Tokens are read server-side only. `GITHUB_TOKEN` may hold several comma-separated
 * tokens; requests rotate through them and skip exhausted ones.
 */
function tokens(): string[] {
  return (process.env.GITHUB_TOKEN ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

const exhausted = new Map<string, number>(); // token -> reset epoch seconds
let cursor = 0;

function pickToken(): string | undefined {
  const all = tokens();
  const now = Date.now() / 1000;
  for (let i = 0; i < all.length; i++) {
    const tok = all[(cursor + i) % all.length];
    const reset = exhausted.get(tok);
    if (!reset || reset < now) {
      cursor = (cursor + i + 1) % all.length;
      return tok;
    }
  }
  return undefined;
}

export function hasToken(): boolean {
  return tokens().length > 0;
}

async function request(url: string, init: RequestInit, token: string | undefined): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("User-Agent", USER_AGENT);
  if (token) headers.set("Authorization", `bearer ${token}`);
  try {
    return await fetch(url, { ...init, headers, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (e) {
    throw unavailable(e instanceof Error ? e.message : "network error");
  }
}

function isRateLimit(res: Response): boolean {
  if (res.status === 429) return true;
  return res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0";
}

/** Runs a request with token rotation. Rate-limited tokens are parked until reset. */
async function withTokens(url: string, init: RequestInit, opts: { requireToken?: boolean } = {}) {
  const attempts = Math.max(1, tokens().length);
  let lastReset: number | undefined;
  for (let i = 0; i < attempts; i++) {
    const token = pickToken();
    if (!token && opts.requireToken) throw new GitHubError("unauthorized", "A GitHub token is required", 401);
    const res = await request(url, init, token);
    if (isRateLimit(res)) {
      lastReset = Number(res.headers.get("x-ratelimit-reset")) || undefined;
      if (token) {
        exhausted.set(token, lastReset ?? Date.now() / 1000 + 60);
        continue;
      }
      throw rateLimited(lastReset);
    }
    if (res.status === 401 && token) {
      // Invalid token: park it for an hour and retry with the next one (or anonymously).
      exhausted.set(token, Date.now() / 1000 + 3600);
      console.warn("[github] a configured GITHUB_TOKEN was rejected (401)");
      if (i === attempts - 1 && !opts.requireToken) return request(url, init, undefined);
      continue;
    }
    return res;
  }
  throw rateLimited(lastReset);
}

export async function rest<T>(path: string, login?: string): Promise<T> {
  const res = await withTokens(`${API}${path}`, {
    headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
  });
  if (res.status === 404) throw login ? notFound(login) : new GitHubError("not_found", "Not found", 404);
  if (res.status === 422) throw new GitHubError("bad_request", "GitHub rejected the query", 422);
  if (res.status === 403) throw rateLimited(Number(res.headers.get("x-ratelimit-reset")) || undefined);
  if (!res.ok) throw unavailable(`REST ${res.status}`, res.status);
  return (await res.json()) as T;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { type?: string; message: string }[];
}

export async function graphql<T>(query: string, variables: Record<string, unknown>, login?: string): Promise<T> {
  const res = await withTokens(
    `${API}/graphql`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, variables }) },
    { requireToken: true },
  );
  if (res.status === 401) throw new GitHubError("unauthorized", "GitHub token rejected", 401);
  if (!res.ok) throw unavailable(`GraphQL ${res.status}`, res.status);
  const body = (await res.json()) as GraphQLResponse<T>;
  if (body.errors?.length) {
    const err = body.errors[0];
    if (err.type === "NOT_FOUND") throw login ? notFound(login) : new GitHubError("not_found", err.message, 404);
    if (err.type === "RATE_LIMITED") throw rateLimited();
    if (!body.data) throw unavailable(err.message);
  }
  if (!body.data) throw unavailable("empty GraphQL response");
  return body.data;
}

/** Fetches a public github.com HTML page (used for the contribution calendar without a token). */
export async function githubHtml(url: string, login: string): Promise<string> {
  const res = await request(url, { headers: { Accept: "text/html" } }, undefined);
  if (res.status === 404) throw notFound(login);
  if (res.status === 429) throw rateLimited();
  if (!res.ok) throw unavailable(`HTML ${res.status}`, res.status);
  return res.text();
}

/** Downloads a small image and returns it as a data URI (null on any failure). */
export async function imageDataUri(url: string): Promise<string | null> {
  try {
    const res = await request(url, {}, undefined);
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "image/png";
    if (!type.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > 64_000) return null;
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
