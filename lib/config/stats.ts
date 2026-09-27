import { bool, enumOf, list } from "./fields";
import { commonFields } from "./common";

/** Rows in display order. `default` rows show unless hidden; the rest are opt-in via `show`. */
export const STAT_ROWS = [
  { id: "stars", label: "Total stars", default: true },
  { id: "commits", label: "Commits", default: true },
  { id: "prs", label: "Pull requests", default: true },
  { id: "issues", label: "Issues", default: true },
  { id: "contribs", label: "Contributed to", default: true },
  { id: "contributions", label: "Contributions (last year)", default: false },
  { id: "reviews", label: "Reviews", default: false },
  { id: "repos", label: "Public repos", default: false },
  { id: "followers", label: "Followers", default: false },
  { id: "following", label: "Following", default: false },
  { id: "age", label: "Account age", default: false },
] as const;

export type StatRowId = (typeof STAT_ROWS)[number]["id"];

export const statsFields = {
  ...commonFields,
  hide: list("Comma-separated default rows to hide: stars,commits,prs,issues,contribs."),
  show: list("Comma-separated optional rows to show: contributions,reviews,repos,followers,following,age."),
  hide_rank: bool(false, "Hide the rank ring."),
  include_all_commits: bool(true, "Count all-time commits instead of the current year."),
  show_avatar: bool(false, "Show the user's avatar in the title."),
  number_format: enumOf(["short", "long"] as const, "short", "Number format: 1.2k (short) or 1,234 (long)."),
};

export function visibleStatRows(hide: string[], show: string[]): StatRowId[] {
  return STAT_ROWS.filter((r) => (r.default ? !hide.includes(r.id) : show.includes(r.id))).map((r) => r.id);
}

/** Inverse of visibleStatRows: returns the minimal hide/show lists for a set of rows. */
export function rowsToHideShow(visible: StatRowId[]): { hide: string[]; show: string[] } {
  const set = new Set(visible);
  return {
    hide: STAT_ROWS.filter((r) => r.default && !set.has(r.id)).map((r) => r.id),
    show: STAT_ROWS.filter((r) => !r.default && set.has(r.id)).map((r) => r.id),
  };
}
