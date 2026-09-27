import type { ContributionDay, UserBundle } from "@/types/github";
import { addDays, todayUTC } from "@/lib/utils/dates";

/** Deterministic sample data for theme previews and docs (no GitHub requests). */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function demoDays(): ContributionDay[] {
  const rand = seeded(7);
  const today = todayUTC();
  const out: ContributionDay[] = [];
  for (let i = 400; i >= 0; i--) {
    const r = rand();
    const recent = i < 24;
    const count = recent ? 1 + Math.floor(r * 9) : r < 0.3 ? 0 : Math.floor(r * 12);
    const level = (count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 9 ? 3 : 4) as ContributionDay["level"];
    out.push({ date: addDays(today, -i), count, level });
  }
  return out;
}

const lang = (name: string, color: string, bytes: number) => ({ name, color, bytes });

export function demoBundle(): UserBundle {
  const days = demoDays();
  return {
    profile: {
      login: "octocat",
      name: "Octocat",
      bio: null,
      avatarUrl: "",
      avatarDataUri: null,
      createdAt: "2016-03-14T00:00:00Z",
      followers: 1840,
      following: 12,
      publicRepos: 64,
    },
    stats: {
      totalStars: 12400,
      totalCommits: 4821,
      commitsThisYear: 912,
      totalPRs: 486,
      totalIssues: 173,
      totalReviews: 214,
      contributedTo: 38,
      contributionsLastYear: 2210,
    },
    repos: [
      { name: "app", isFork: false, isArchived: false, isPrivate: false, stars: 1, size: 1,
        languages: [lang("TypeScript", "#3178c6", 520000), lang("CSS", "#663399", 60000), lang("HTML", "#e34c26", 20000)] },
      { name: "engine", isFork: false, isArchived: false, isPrivate: false, stars: 1, size: 1,
        languages: [lang("Rust", "#dea584", 310000), lang("Python", "#3572A5", 40000)] },
      { name: "api", isFork: false, isArchived: false, isPrivate: false, stars: 1, size: 1,
        languages: [lang("Go", "#00ADD8", 180000), lang("Shell", "#89e051", 12000)] },
    ],
    languagesApproximate: false,
    contributions: { days, total: days.reduce((s, d) => s + d.count, 0), totalCommits: null },
    source: "graphql",
    fetchedAt: "2026-01-01T00:00:00Z",
  };
}
