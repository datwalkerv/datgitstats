import "server-only";
import type { UserStats } from "@/types/github";
import { cached } from "@/lib/cache/cached";
import { rest } from "./client";
import { cacheOpts, getGraphQLCore } from "./core";
import { getContributionData } from "./contributions";
import { isGitHubError } from "./errors";
import { withFallback } from "./fallback";
import { getRepositories } from "./repositories";
import type { RestSearch } from "./rest-types";

export function getUserStats(login: string): Promise<UserStats> {
  return withFallback(() => viaGraphQL(login), () => viaRest(login));
}

async function viaGraphQL(login: string): Promise<UserStats> {
  const [{ user, repos }, contrib] = await Promise.all([getGraphQLCore(login), getContributionData(login)]);
  return {
    totalStars: repos.reduce((s, r) => s + r.stargazerCount, 0),
    totalCommits: contrib.totalCommits ?? user.thisYear.totalCommitContributions,
    commitsThisYear: user.thisYear.totalCommitContributions,
    totalPRs: user.pullRequests.totalCount,
    totalIssues: user.issues.totalCount,
    totalReviews: user.lastYear.totalPullRequestReviewContributions,
    contributedTo: user.repositoriesContributedTo.totalCount,
    contributionsLastYear: user.lastYear.contributionCalendar.totalContributions,
  };
}

/** Search API counts are optional extras: a failure yields null rather than a broken card. */
function searchCount(login: string, kind: "issues" | "commits", q: string): Promise<number | null> {
  const key = `search:${kind}:${q.toLowerCase()}`;
  return cached(key, () => rest<RestSearch>(`/search/${kind}?q=${encodeURIComponent(q)}&per_page=1`, login), cacheOpts(login.toLowerCase()))
    .then((r) => r.total_count)
    .catch((e) => {
      if (isGitHubError(e) && e.code === "not_found") throw e;
      return null;
    });
}

async function viaRest(login: string): Promise<UserStats> {
  const year = new Date().getUTCFullYear();
  const [{ repos }, contrib, prs, issues, commits, commitsYear, reviews] = await Promise.all([
    getRepositories(login),
    getContributionData(login),
    searchCount(login, "issues", `author:${login} type:pr`),
    searchCount(login, "issues", `author:${login} type:issue`),
    searchCount(login, "commits", `author:${login}`),
    searchCount(login, "commits", `author:${login} author-date:>=${year}-01-01`),
    searchCount(login, "issues", `reviewed-by:${login} type:pr`),
  ]);
  const cutoff = new Date(Date.now() - 365 * 86_400_000).toISOString().slice(0, 10);
  const lastYear = contrib.days.filter((d) => d.date > cutoff).reduce((s, d) => s + d.count, 0);
  const commitsFromCalendar = contrib.days.filter((d) => d.date >= `${year}-01-01`).reduce((s, d) => s + d.count, 0);
  return {
    totalStars: repos.reduce((s, r) => s + r.stars, 0),
    totalCommits: commits ?? 0,
    commitsThisYear: commitsYear ?? Math.min(commitsFromCalendar, commits ?? commitsFromCalendar),
    totalPRs: prs ?? 0,
    totalIssues: issues ?? 0,
    totalReviews: reviews,
    contributedTo: null,
    contributionsLastYear: lastYear,
  };
}
