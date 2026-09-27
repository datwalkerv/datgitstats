/** Normalised, serializable GitHub data shared by the API, the SVG generators and the client preview. */

export type DataSource = "graphql" | "rest";

export interface Profile {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  /** Small inlined avatar (data URI) so it renders inside README-embedded SVGs. */
  avatarDataUri: string | null;
  createdAt: string;
  followers: number;
  following: number;
  publicRepos: number;
}

export interface UserStats {
  totalStars: number;
  totalCommits: number;
  commitsThisYear: number;
  totalPRs: number;
  totalIssues: number;
  totalReviews: number | null;
  contributedTo: number | null;
  contributionsLastYear: number;
}

export interface RepoLanguage {
  name: string;
  color: string | null;
  bytes: number;
}

export interface RepoInfo {
  name: string;
  isFork: boolean;
  isArchived: boolean;
  isPrivate: boolean;
  stars: number;
  /** Disk usage in KB. */
  size: number;
  languages: RepoLanguage[];
}

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionData {
  /** Every day from the first tracked year until today, ascending. */
  days: ContributionDay[];
  total: number;
  totalCommits: number | null;
}

export interface UserBundle {
  profile: Profile;
  stats: UserStats;
  repos: RepoInfo[];
  /** True when language data is estimated from primary languages (no token). */
  languagesApproximate: boolean;
  contributions: ContributionData;
  source: DataSource;
  fetchedAt: string;
}
