import "server-only";
import type { RepoInfo } from "@/types/github";
import { cached } from "@/lib/cache/cached";
import { LANGUAGE_COLORS } from "@/lib/utils/language-colors";
import { rest } from "./client";
import { cacheOpts, getGraphQLCore } from "./core";
import { withFallback } from "./fallback";
import type { RestRepo } from "./rest-types";

const MAX_REST_PAGES = 5;

export interface RepositoryData {
  repos: RepoInfo[];
  /** True when per-language byte counts are estimated from each repo's primary language. */
  approximate: boolean;
}

export function getRepositories(login: string): Promise<RepositoryData> {
  return withFallback(
    async () => {
      const { repos } = await getGraphQLCore(login);
      return {
        approximate: false,
        repos: repos.map((r) => ({
          name: r.name,
          isFork: r.isFork,
          isArchived: r.isArchived,
          isPrivate: r.isPrivate,
          stars: r.stargazerCount,
          size: r.diskUsage ?? 0,
          languages: r.languages.edges.map((e) => ({ name: e.node.name, color: e.node.color, bytes: e.size })),
        })),
      };
    },
    () => cached(`rest-repos:${login.toLowerCase()}`, () => loadRestRepos(login), cacheOpts(login.toLowerCase())),
  );
}

async function loadRestRepos(login: string): Promise<RepositoryData> {
  const all: RestRepo[] = [];
  for (let page = 1; page <= MAX_REST_PAGES; page++) {
    const batch = await rest<RestRepo[]>(
      `/users/${encodeURIComponent(login)}/repos?type=owner&per_page=100&page=${page}`,
      login,
    );
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return {
    approximate: true,
    repos: all.map((r) => ({
      name: r.name,
      isFork: r.fork,
      isArchived: r.archived,
      isPrivate: r.private,
      stars: r.stargazers_count,
      size: r.size,
      // REST only exposes the primary language; weight it by repository size (KB → bytes).
      languages: r.language
        ? [{ name: r.language, color: LANGUAGE_COLORS[r.language] ?? null, bytes: Math.max(1, r.size) * 1024 }]
        : [],
    })),
  };
}
