export interface RankInput {
  allCommits: boolean;
  commits: number;
  prs: number;
  issues: number;
  reviews: number;
  stars: number;
  followers: number;
}

export interface Rank {
  level: string;
  /** Lower is better: top N percent. */
  percentile: number;
}

const expCdf = (x: number) => 1 - 2 ** -x;
const logNormalCdf = (x: number) => x / (1 + x);

/** Same weighting as github-readme-stats so ranks stay familiar. */
export function calculateRank(i: RankInput): Rank {
  const W = { commits: 2, prs: 3, issues: 1, reviews: 1, stars: 4, followers: 1 };
  const total = W.commits + W.prs + W.issues + W.reviews + W.stars + W.followers;
  const score =
    W.commits * expCdf(i.commits / (i.allCommits ? 1000 : 250)) +
    W.prs * expCdf(i.prs / 50) +
    W.issues * expCdf(i.issues / 25) +
    W.reviews * expCdf(i.reviews / 2) +
    W.stars * logNormalCdf(i.stars / 50) +
    W.followers * logNormalCdf(i.followers / 10);
  const rank = 1 - score / total;
  const thresholds = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
  const levels = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"];
  const idx = thresholds.findIndex((t) => rank * 100 <= t);
  return { level: levels[idx === -1 ? levels.length - 1 : idx], percentile: rank * 100 };
}
