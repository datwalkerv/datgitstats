import "server-only";
import type { ContributionData, ContributionDay } from "@/types/github";
import { cached } from "@/lib/cache/cached";
import { addDays, todayUTC } from "@/lib/utils/dates";
import { githubHtml, graphql } from "./client";
import { cacheOpts, canUseGraphQL } from "./core";
import { withFallback } from "./fallback";
import { contributionsQuery, type ContributionLevel, type GqlYear } from "./queries";
import { getProfile } from "./user";

const CONTRIB_TTL = 60 * 60;
const YEARS_PER_QUERY = 4;
const SCRAPE_CONCURRENCY = 4;

const LEVELS: Record<ContributionLevel, ContributionDay["level"]> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

/**
 * The single entry point for contribution-calendar data. With a token it uses one
 * aliased GraphQL query per few years; without one it reads the public calendar HTML.
 */
export function getContributionData(login: string): Promise<ContributionData> {
  const key = login.toLowerCase();
  // Token and public modes produce different data, so they are cached separately.
  const mode = canUseGraphQL() ? "gql" : "pub";
  return cached(`contrib:${mode}:${key}`, () => load(login), cacheOpts(key, CONTRIB_TTL));
}

async function load(login: string): Promise<ContributionData> {
  const profile = await getProfile(login);
  const first = new Date(profile.createdAt).getUTCFullYear();
  const current = new Date().getUTCFullYear();
  const years: number[] = [];
  for (let y = first; y <= current; y++) years.push(y);

  const { days, totalCommits } = await withFallback<{ days: ContributionDay[]; totalCommits: number | null }>(
    () => viaGraphQL(login, years),
    async () => ({ days: await viaHtml(login, years), totalCommits: null }),
  );
  return finalize(days, totalCommits);
}

export function finalize(input: ContributionDay[], totalCommits: number | null): ContributionData {
  // Future days are placeholders, except "tomorrow" with real activity (users ahead of UTC).
  const today = todayUTC();
  const tomorrow = addDays(today, 1);
  const byDate = new Map<string, ContributionDay>();
  for (const d of input) if (d.date <= today || (d.date === tomorrow && d.count > 0)) byDate.set(d.date, d);
  const days = [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
  // Trim the empty prefix so ranges start at the first contribution.
  const firstActive = days.findIndex((d) => d.count > 0);
  const trimmed = firstActive === -1 ? [] : days.slice(firstActive);
  return {
    days: trimmed,
    total: trimmed.reduce((s, d) => s + d.count, 0),
    totalCommits,
  };
}

async function viaGraphQL(login: string, years: number[]) {
  const chunks: number[][] = [];
  for (let i = 0; i < years.length; i += YEARS_PER_QUERY) chunks.push(years.slice(i, i + YEARS_PER_QUERY));
  const results = await Promise.all(
    chunks.map((chunk) => graphql<{ user: Record<string, GqlYear> | null }>(contributionsQuery(chunk), { login }, login)),
  );
  const days: ContributionDay[] = [];
  let totalCommits = 0;
  for (const r of results) {
    for (const year of Object.values(r.user ?? {})) {
      totalCommits += year.totalCommitContributions;
      for (const w of year.contributionCalendar.weeks)
        for (const d of w.contributionDays)
          days.push({ date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] ?? 0 });
    }
  }
  return { days, totalCommits };
}

async function viaHtml(login: string, years: number[]): Promise<ContributionDay[]> {
  const out: ContributionDay[] = [];
  const queue = [...years];
  const worker = async () => {
    for (let y = queue.shift(); y !== undefined; y = queue.shift()) {
      const html = await githubHtml(
        `https://github.com/users/${encodeURIComponent(login)}/contributions?from=${y}-01-01&to=${y}-12-31`,
        login,
      );
      out.push(...parseContributionHtml(html));
    }
  };
  await Promise.all(Array.from({ length: Math.min(SCRAPE_CONCURRENCY, years.length) }, worker));
  return out;
}

/**
 * Parses GitHub's contribution calendar markup:
 *   <td data-date="2025-01-05" id="contribution-day-component-0-1" data-level="0" ...>
 *   <tool-tip for="contribution-day-component-0-1" ...>5 contributions on January 5th.</tool-tip>
 */
export function parseContributionHtml(html: string): ContributionDay[] {
  const cells = new Map<string, { date: string; level: ContributionDay["level"] }>();
  const cellRe = /<td\b[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*>/g;
  for (const m of html.matchAll(cellRe)) {
    const tag = m[0];
    const id = /\bid="([^"]+)"/.exec(tag)?.[1];
    const level = Number(/\bdata-level="(\d)"/.exec(tag)?.[1] ?? 0);
    if (id) cells.set(id, { date: m[1], level: Math.min(4, Math.max(0, level)) as ContributionDay["level"] });
  }
  const counts = new Map<string, number>();
  const tipRe = /<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g;
  for (const m of html.matchAll(tipRe)) {
    const n = /^\s*([\d,]+)\s+contributions?/i.exec(m[2]);
    counts.set(m[1], n ? Number(n[1].replace(/,/g, "")) : 0);
  }
  return [...cells.entries()].map(([id, c]) => ({ date: c.date, level: c.level, count: counts.get(id) ?? 0 }));
}
