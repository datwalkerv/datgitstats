import type { ContributionDay } from "@/types/github";
import { addDays, todayUTC, weekStart } from "./dates";

export interface Streak {
  length: number;
  start: string | null;
  end: string | null;
}

export interface StreakSummary {
  total: number;
  firstDate: string | null;
  current: Streak;
  longest: Streak;
  mode: "daily" | "weekly";
}

interface Bucket {
  date: string;
  count: number;
}

/** Dense list of buckets (days or weeks) from the first entry through `end`, gaps filled with zero. */
function densify(days: ContributionDay[], mode: "daily" | "weekly", end: string): Bucket[] {
  const key = (d: string) => (mode === "daily" ? d : weekStart(d));
  const step = mode === "daily" ? 1 : 7;
  const counts = new Map<string, number>();
  for (const d of days) counts.set(key(d.date), (counts.get(key(d.date)) ?? 0) + d.count);
  const out: Bucket[] = [];
  const last = key(end);
  for (let cur = key(days[0].date); cur <= last; cur = addDays(cur, step)) {
    out.push({ date: cur, count: counts.get(cur) ?? 0 });
  }
  return out;
}

export function computeStreaks(
  days: ContributionDay[],
  mode: "daily" | "weekly" = "daily",
  today: string = todayUTC(),
): StreakSummary {
  const total = days.reduce((s, d) => s + d.count, 0);
  const empty: Streak = { length: 0, start: null, end: null };
  if (!days.length) return { total, firstDate: null, current: empty, longest: empty, mode };

  const lastDate = days[days.length - 1].date;
  const end = lastDate > today ? lastDate : today;
  const buckets = densify(days, mode, end);
  const bucketEnd = (b: Bucket) => (mode === "daily" ? b.date : addDays(b.date, 6));

  let longest: Streak = empty;
  let runStart = -1;
  for (let i = 0; i < buckets.length; i++) {
    if (buckets[i].count > 0) {
      if (runStart === -1) runStart = i;
      const len = i - runStart + 1;
      if (len > longest.length) longest = { length: len, start: buckets[runStart].date, end: bucketEnd(buckets[i]) };
    } else runStart = -1;
  }

  // The current bucket may still be in progress: an empty "today" (or this week) doesn't break the streak.
  let i = buckets.length - 1;
  if (buckets[i].count === 0) i--;
  let current: Streak = { length: 0, start: end, end };
  if (i >= 0 && buckets[i].count > 0) {
    let j = i;
    while (j > 0 && buckets[j - 1].count > 0) j--;
    current = { length: i - j + 1, start: buckets[j].date, end: bucketEnd(buckets[i]) };
    if (mode === "weekly" && current.end! > end) current.end = end;
  }
  if (mode === "weekly" && longest.end && longest.end > end) longest = { ...longest, end };

  return { total, firstDate: days[0].date, current, longest, mode };
}

