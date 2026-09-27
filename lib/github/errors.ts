export type GitHubErrorCode = "not_found" | "rate_limited" | "unavailable" | "bad_request" | "unauthorized";

export class GitHubError extends Error {
  constructor(
    readonly code: GitHubErrorCode,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

export const notFound = (login: string) => new GitHubError("not_found", `GitHub user "${login}" was not found`, 404);
export const rateLimited = (resetAt?: number) =>
  new GitHubError(
    "rate_limited",
    resetAt ? `GitHub rate limit exceeded (resets ${new Date(resetAt * 1000).toISOString()})` : "GitHub rate limit exceeded",
    429,
  );
export const unavailable = (detail: string, status?: number) =>
  new GitHubError("unavailable", `GitHub API unavailable: ${detail}`, status);

export function isGitHubError(e: unknown): e is GitHubError {
  return e instanceof GitHubError;
}

/** Human-friendly copy for error cards. */
export function describeError(e: unknown): { title: string; message: string } {
  if (isGitHubError(e)) {
    switch (e.code) {
      case "not_found":
        return { title: "User not found", message: "Check the username and try again." };
      case "rate_limited":
        return { title: "Rate limited", message: "GitHub API limit reached. Please try again later." };
      case "bad_request":
        return { title: "Invalid request", message: e.message };
      case "unauthorized":
      case "unavailable":
        return { title: "Unable to load GitHub data", message: "Please try again later." };
    }
  }
  return { title: "Unable to load GitHub data", message: "Please try again later." };
}
