const REPO_FIELDS = `
  pageInfo { hasNextPage endCursor }
  nodes {
    name isFork isArchived isPrivate stargazerCount diskUsage
    languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
      edges { size node { name color } }
    }
  }`;

export const CORE_QUERY = `
query Core($login: String!, $yearStart: DateTime!) {
  user(login: $login) {
    login name bio avatarUrl createdAt
    followers { totalCount }
    following { totalCount }
    publicRepos: repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
    pullRequests { totalCount }
    issues { totalCount }
    repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) { totalCount }
    lastYear: contributionsCollection {
      totalPullRequestReviewContributions
      contributionCalendar { totalContributions }
    }
    thisYear: contributionsCollection(from: $yearStart) { totalCommitContributions }
    repositories(first: 100, ownerAffiliations: OWNER, orderBy: { field: STARGAZERS, direction: DESC }) {
      ${REPO_FIELDS}
    }
  }
}`;

export const REPOS_PAGE_QUERY = `
query Repos($login: String!, $after: String) {
  user(login: $login) {
    repositories(first: 100, after: $after, ownerAffiliations: OWNER, orderBy: { field: STARGAZERS, direction: DESC }) {
      ${REPO_FIELDS}
    }
  }
}`;

/** One aliased contributionsCollection per year, e.g. `y2024: contributionsCollection(...)`. */
export function contributionsQuery(years: number[]): string {
  const parts = years.map(
    (y) => `
    y${y}: contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") {
      totalCommitContributions
      contributionCalendar { weeks { contributionDays { date contributionCount contributionLevel } } }
    }`,
  );
  return `query Contributions($login: String!) { user(login: $login) { ${parts.join("\n")} } }`;
}

export interface GqlRepoNode {
  name: string;
  isFork: boolean;
  isArchived: boolean;
  isPrivate: boolean;
  stargazerCount: number;
  diskUsage: number | null;
  languages: { edges: { size: number; node: { name: string; color: string | null } }[] };
}

export interface GqlRepoConnection {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: GqlRepoNode[];
}

export interface GqlCore {
  user: {
    login: string;
    name: string | null;
    bio: string | null;
    avatarUrl: string;
    createdAt: string;
    followers: { totalCount: number };
    following: { totalCount: number };
    publicRepos: { totalCount: number };
    pullRequests: { totalCount: number };
    issues: { totalCount: number };
    repositoriesContributedTo: { totalCount: number };
    lastYear: { totalPullRequestReviewContributions: number; contributionCalendar: { totalContributions: number } };
    thisYear: { totalCommitContributions: number };
    repositories: GqlRepoConnection;
  } | null;
}

export type ContributionLevel = "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";

export interface GqlYear {
  totalCommitContributions: number;
  contributionCalendar: {
    weeks: { contributionDays: { date: string; contributionCount: number; contributionLevel: ContributionLevel }[] }[];
  };
}
