import type { RepoInfo } from "@/types/github";
import type { LangMethod } from "@/lib/config/top-langs";
import { FALLBACK_LANGUAGE_COLOR, LANGUAGE_COLORS } from "./language-colors";

export interface LanguageOptions {
  method: LangMethod;
  sizeWeight: number;
  countWeight: number;
  includeForks: boolean;
  includeArchived: boolean;
  excludeRepos: string[];
  hide: string[];
  count: number;
  showOther: boolean;
}

export interface LanguageStat {
  name: string;
  color: string;
  bytes: number;
  repos: number;
  score: number;
  percent: number;
}

export function computeTopLanguages(repos: RepoInfo[], o: LanguageOptions): LanguageStat[] {
  const exclude = new Set(o.excludeRepos.map((r) => r.toLowerCase()));
  const hide = new Set(o.hide.map((h) => h.toLowerCase()));
  const agg = new Map<string, { name: string; color: string; bytes: number; repos: number }>();

  for (const repo of repos) {
    if (!o.includeForks && repo.isFork) continue;
    if (!o.includeArchived && repo.isArchived) continue;
    if (exclude.has(repo.name.toLowerCase())) continue;
    for (const lang of repo.languages) {
      if (hide.has(lang.name.toLowerCase()) || lang.bytes <= 0) continue;
      const cur = agg.get(lang.name) ?? {
        name: lang.name,
        color: lang.color ?? LANGUAGE_COLORS[lang.name] ?? FALLBACK_LANGUAGE_COLOR,
        bytes: 0,
        repos: 0,
      };
      cur.bytes += lang.bytes;
      cur.repos += 1;
      agg.set(lang.name, cur);
    }
  }

  const scored = [...agg.values()].map((l) => ({
    ...l,
    score:
      o.method === "bytes"
        ? l.bytes
        : o.method === "repos"
          ? l.repos
          : Math.pow(l.bytes, o.sizeWeight) * Math.pow(l.repos, o.countWeight),
  }));
  scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const total = scored.reduce((s, l) => s + l.score, 0) || 1;
  const withPct = scored.map((l) => ({ ...l, percent: (l.score / total) * 100 }));

  const top = withPct.slice(0, o.count);
  if (o.showOther && withPct.length > o.count) {
    const rest = withPct.slice(o.count);
    top.push({
      name: "Other",
      color: FALLBACK_LANGUAGE_COLOR,
      bytes: rest.reduce((s, l) => s + l.bytes, 0),
      repos: rest.reduce((s, l) => s + l.repos, 0),
      score: rest.reduce((s, l) => s + l.score, 0),
      percent: rest.reduce((s, l) => s + l.percent, 0),
    });
  } else if (top.length) {
    // Re-normalise so the visible languages sum to 100%.
    const shown = top.reduce((s, l) => s + l.score, 0) || 1;
    for (const l of top) l.percent = (l.score / shown) * 100;
  }
  return top;
}
