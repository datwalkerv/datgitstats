import "server-only";
import { canUseGraphQL } from "./core";
import { isGitHubError } from "./errors";

/**
 * Prefer the GraphQL implementation when a token is configured; fall back to the
 * public REST/HTML implementation if the token is missing, rejected or exhausted.
 */
export async function withFallback<T>(gql: () => Promise<T>, pub: () => Promise<T>): Promise<T> {
  if (!canUseGraphQL()) return pub();
  try {
    return await gql();
  } catch (e) {
    if (isGitHubError(e) && (e.code === "unauthorized" || e.code === "rate_limited")) return pub();
    throw e;
  }
}
