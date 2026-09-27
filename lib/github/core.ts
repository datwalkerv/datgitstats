import "server-only";
import { cached } from "@/lib/cache/cached";
import { graphql, hasToken } from "./client";
import { isGitHubError, notFound } from "./errors";
import { CORE_QUERY, REPOS_PAGE_QUERY, type GqlCore, type GqlRepoConnection, type GqlRepoNode } from "./queries";

export const CORE_TTL = 2 * 60 * 60;
const MAX_REPO_PAGES = 10;

export interface CoreData {
  user: NonNullable<GqlCore["user"]>;
  repos: GqlRepoNode[];
}

export const cacheOpts = (login: string, ttl = CORE_TTL) => ({
  ttl,
  tags: [`gh:${login}`],
  negativeTtl: 120,
  shouldCacheError: (e: unknown) => isGitHubError(e) && e.code === "not_found",
});

/** Profile, counters and all owned repositories in as few GraphQL round-trips as possible. */
export function getGraphQLCore(login: string): Promise<CoreData> {
  return cached(`core:${login.toLowerCase()}`, () => loadCore(login), cacheOpts(login.toLowerCase()));
}

async function loadCore(login: string): Promise<CoreData> {
  const yearStart = `${new Date().getUTCFullYear()}-01-01T00:00:00Z`;
  const data = await graphql<GqlCore>(CORE_QUERY, { login, yearStart }, login);
  if (!data.user) throw notFound(login);
  const repos = [...data.user.repositories.nodes];
  let page = data.user.repositories.pageInfo;
  for (let i = 1; i < MAX_REPO_PAGES && page.hasNextPage; i++) {
    const next = await graphql<{ user: { repositories: GqlRepoConnection } | null }>(
      REPOS_PAGE_QUERY,
      { login, after: page.endCursor },
      login,
    );
    if (!next.user) break;
    repos.push(...next.user.repositories.nodes);
    page = next.user.repositories.pageInfo;
  }
  return { user: data.user, repos };
}

export const canUseGraphQL = hasToken;
