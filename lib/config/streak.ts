import { bool, enumOf, int } from "./fields";
import { commonFields } from "./common";

export const streakFields = {
  ...commonFields,
  hide_total_contributions: bool(false, "Hide the total contributions section."),
  hide_current_streak: bool(false, "Hide the current streak section."),
  hide_longest_streak: bool(false, "Hide the longest streak section."),
  mode: enumOf(["daily", "weekly"] as const, "daily", "Count streaks in days or weeks."),
  show_graph: bool(false, "Show a contribution heat strip under the stats."),
  graph_weeks: int(26, 4, 53, "Weeks shown in the heat strip."),
  date_format: enumOf(["short", "iso"] as const, "short", "Date format for ranges: Jan 5, 2025 or 2025-01-05."),
};
