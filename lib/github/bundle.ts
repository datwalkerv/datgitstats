import "server-only";
import type { UserBundle } from "@/types/github";
import { canUseGraphQL } from "./core";
import { getContributionData } from "./contributions";
import { getRepositories } from "./repositories";
import { getUserStats } from "./stats";
import { getProfile } from "./user";

/** Everything the generator UI needs to render all three cards client-side. */
export async function getUserBundle(login: string): Promise<UserBundle> {
  // Profile first: it validates the username before firing the heavier requests.
  const profile = await getProfile(login);
  const [stats, repoData, contributions] = await Promise.all([
    getUserStats(login),
    getRepositories(login),
    getContributionData(login),
  ]);
  return {
    profile,
    stats,
    repos: repoData.repos,
    languagesApproximate: repoData.approximate,
    contributions,
    source: canUseGraphQL() && !repoData.approximate ? "graphql" : "rest",
    fetchedAt: new Date().toISOString(),
  };
}

export { getProfile, getUserStats, getRepositories, getContributionData };
