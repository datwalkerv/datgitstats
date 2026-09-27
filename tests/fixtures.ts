import type { ContributionDay, UserBundle } from "@/types/github";
import { addDays, todayUTC } from "@/lib/utils/dates";

export function days(start: string, counts: number[]): ContributionDay[] {
  return counts.map((count, i) => ({ date: addDays(start, i), count, level: count ? 2 : 0 }));
}

export function bundle(): UserBundle {
  const today = todayUTC();
  return {
    profile: {
      login: "octocat", name: "The <Octocat> & Co", bio: null, avatarUrl: "https://example.com/a.png",
      avatarDataUri: null, createdAt: "2015-01-01T00:00:00Z", followers: 1234, following: 5, publicRepos: 8,
    },
    stats: {
      totalStars: 4200, totalCommits: 1500, commitsThisYear: 300, totalPRs: 120, totalIssues: 40,
      totalReviews: 10, contributedTo: 12, contributionsLastYear: 900,
    },
    repos: [
      { name: "a", isFork: false, isArchived: false, isPrivate: false, stars: 10, size: 100,
        languages: [{ name: "TypeScript", color: "#3178c6", bytes: 8000 }, { name: "CSS", color: null, bytes: 2000 }] },
      { name: "b", isFork: true, isArchived: false, isPrivate: false, stars: 0, size: 10,
        languages: [{ name: "Go", color: null, bytes: 50000 }] },
      { name: "c", isFork: false, isArchived: true, isPrivate: false, stars: 1, size: 10,
        languages: [{ name: "Rust", color: null, bytes: 1000 }, { name: "CSS", color: null, bytes: 1000 }] },
    ],
    languagesApproximate: false,
    contributions: { days: days(addDays(today, -9), [1, 2, 0, 3, 3, 3, 0, 1, 1, 0]), total: 14, totalCommits: 10 },
    source: "graphql",
    fetchedAt: new Date().toISOString(),
  };
}
