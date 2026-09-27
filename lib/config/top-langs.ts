import { bool, enumOf, float, int, list } from "./fields";
import { commonFields } from "./common";

export const LANG_LAYOUTS = ["bars", "compact", "donut", "pie", "percent"] as const;
export type LangLayout = (typeof LANG_LAYOUTS)[number];

export const LANG_METHODS = ["bytes", "repos", "weighted"] as const;
export type LangMethod = (typeof LANG_METHODS)[number];

export const topLangsFields = {
  ...commonFields,
  layout: enumOf(LANG_LAYOUTS, "bars", "Card layout."),
  langs_count: int(6, 1, 20, "Number of languages to show."),
  hide: list("Comma-separated languages to hide (case-insensitive)."),
  exclude_repo: list("Comma-separated repository names to exclude."),
  include_forks: bool(false, "Include forked repositories."),
  include_archived: bool(true, "Include archived repositories."),
  method: enumOf(LANG_METHODS, "bytes", "bytes = code size, repos = repository count, weighted = bytes^size_weight × repos^count_weight."),
  size_weight: float(1, 0, 2, "Byte weight for the weighted method."),
  count_weight: float(0.5, 0, 2, "Repository-count weight for the weighted method."),
  show_percent: bool(true, "Show percentages."),
  show_other: bool(false, "Group the remaining languages as \"Other\"."),
  lang_colors: enumOf(["theme", "language"] as const, "theme", "theme = colors from the card theme, language = GitHub's language colors."),
};
