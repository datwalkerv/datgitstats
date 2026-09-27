import "server-only";
import type { Profile } from "@/types/github";
import { cached } from "@/lib/cache/cached";
import { imageDataUri, rest } from "./client";
import { cacheOpts, getGraphQLCore } from "./core";
import { withFallback } from "./fallback";
import type { RestUser } from "./rest-types";

export function getRestUser(login: string): Promise<RestUser> {
  return cached(`rest-user:${login.toLowerCase()}`, () => rest<RestUser>(`/users/${encodeURIComponent(login)}`, login), cacheOpts(login.toLowerCase()));
}

function avatarUri(url: string): Promise<string | null> {
  const sized = `${url}${url.includes("?") ? "&" : "?"}s=80`;
  return cached(`avatar:${url}`, () => imageDataUri(sized), { ttl: 24 * 60 * 60 });
}

export async function getProfile(login: string): Promise<Profile> {
  const base = await withFallback<Omit<Profile, "avatarDataUri">>(
    async () => {
      const { user } = await getGraphQLCore(login);
      return {
        login: user.login,
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        followers: user.followers.totalCount,
        following: user.following.totalCount,
        publicRepos: user.publicRepos.totalCount,
      };
    },
    async () => {
      const u = await getRestUser(login);
      return {
        login: u.login,
        name: u.name,
        bio: u.bio,
        avatarUrl: u.avatar_url,
        createdAt: u.created_at,
        followers: u.followers,
        following: u.following,
        publicRepos: u.public_repos,
      };
    },
  );
  return { ...base, avatarDataUri: await avatarUri(base.avatarUrl) };
}
