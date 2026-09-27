import type { StatsOptions } from "@/lib/config";
import { visibleStatRows, type StatRowId } from "@/lib/config/stats";
import type { Profile, UserStats } from "@/types/github";
import { accountAge } from "@/lib/utils/dates";
import { formatNumber } from "@/lib/utils/format";
import { calculateRank } from "@/lib/utils/rank";
import type { IconName } from "./icons";
import { delay, escapeXml, frame, icon, makeCtx, r, titleHeight, truncate } from "./primitives";

export interface StatsCardData {
  profile: Profile;
  stats: UserStats;
}

interface Row {
  id: StatRowId;
  icon: IconName;
  label: string;
  value: string;
}

function buildRows(d: StatsCardData, o: StatsOptions): Row[] {
  const { stats, profile } = d;
  const fmt = (n: number | null) => formatNumber(n, o.number_format);
  const year = new Date().getUTCFullYear();
  const all: Record<StatRowId, Omit<Row, "id">> = {
    stars: { icon: "star", label: "Total stars earned", value: fmt(stats.totalStars) },
    commits: o.include_all_commits
      ? { icon: "commits", label: "Total commits", value: fmt(stats.totalCommits) }
      : { icon: "commits", label: `Commits (${year})`, value: fmt(stats.commitsThisYear) },
    prs: { icon: "prs", label: "Total PRs", value: fmt(stats.totalPRs) },
    issues: { icon: "issues", label: "Total issues", value: fmt(stats.totalIssues) },
    contribs: { icon: "contribs", label: "Contributed to (last year)", value: fmt(stats.contributedTo) },
    contributions: { icon: "contributions", label: "Contributions (last year)", value: fmt(stats.contributionsLastYear) },
    reviews: { icon: "reviews", label: "PR reviews", value: fmt(stats.totalReviews) },
    repos: { icon: "repos", label: "Public repositories", value: fmt(profile.publicRepos) },
    followers: { icon: "followers", label: "Followers", value: fmt(profile.followers) },
    following: { icon: "following", label: "Following", value: fmt(profile.following) },
    age: { icon: "age", label: "Account age", value: accountAge(profile.createdAt).label },
  };
  // Some counters are unavailable without a token; drop them instead of showing "—".
  const unknown = new Set<StatRowId>();
  if (stats.contributedTo === null) unknown.add("contribs");
  if (stats.totalReviews === null) unknown.add("reviews");
  return visibleStatRows(o.hide, o.show)
    .filter((id) => !unknown.has(id))
    .map((id) => ({ id, ...all[id] }));
}

export function renderStatsCard(d: StatsCardData, o: StatsOptions): string {
  const ctx = makeCtx(o);
  const { theme, fs, pad } = ctx;
  const rows = buildRows(d, o);
  const rank = calculateRank({
    allCommits: o.include_all_commits,
    commits: o.include_all_commits ? d.stats.totalCommits : d.stats.commitsThisYear,
    prs: d.stats.totalPRs,
    issues: d.stats.totalIssues,
    reviews: d.stats.totalReviews ?? 0,
    stars: d.stats.totalStars,
    followers: d.profile.followers,
  });

  const rowH = Math.round(fs * 1.85);
  const iconSize = Math.round(fs * 1.1);
  const ringR = Math.round(fs * 2.9);
  const showRank = !o.hide_rank;
  const titleH = titleHeight(ctx);
  const listH = rows.length * rowH;
  const ringBox = showRank ? ringR * 2 + 16 : 0;

  const labelCol = o.show_icons ? iconSize + 10 : 0;
  const longestLabel = o.hide_labels ? 0 : Math.max(0, ...rows.map((row) => row.label.length));
  const autoWidth =
    pad * 2 + labelCol + longestLabel * fs * ctx.charW + 70 + (showRank ? ringR * 2 + 36 : 0);
  const width = o.width || Math.max(o.hide_labels ? 260 : 360, Math.round(autoWidth));
  const contentH = Math.max(listH, ringBox);
  const height = o.height || Math.round(pad + titleH + contentH + pad - 4);

  const listTop = pad + titleH;
  const valueX = width - pad - (showRank ? ringR * 2 + 36 : 0);

  const rowsSvg = rows
    .map((row, i) => {
      const y = listTop + i * rowH + rowH / 2;
      const ic = o.show_icons ? icon(row.icon, pad, y - iconSize / 2, iconSize, theme.icon) : "";
      const label = o.hide_labels
        ? ""
        : `<text class="label" x="${pad + labelCol}" y="${r(y + fs * 0.35)}">${escapeXml(
            truncate(ctx, row.label + ":", valueX - pad - labelCol - 60),
          )}</text>`;
      const valueX2 = o.hide_labels ? pad + labelCol : valueX;
      const anchor = o.hide_labels ? "start" : "end";
      return `<g class="fade"${delay(ctx, i)}>${ic}${label}<text class="value" x="${r(valueX2)}" y="${r(
        y + fs * 0.35,
      )}" text-anchor="${anchor}">${escapeXml(row.value)}</text></g>`;
    })
    .join("\n");

  let ring = "";
  let css = "";
  if (showRank) {
    const cx = width - pad - ringR - 8;
    const cy = listTop + contentH / 2 - 2;
    const circ = 2 * Math.PI * ringR;
    const progress = Math.max(0, Math.min(100, 100 - rank.percentile));
    const offset = circ * (1 - progress / 100);
    css = o.animate
      ? `@media (prefers-reduced-motion: no-preference) {
    .ring-progress { stroke-dashoffset: ${r(circ)}; animation: ringFill 1.2s cubic-bezier(.2,.8,.2,1) .3s forwards; }
    @keyframes ringFill { to { stroke-dashoffset: ${r(offset)}; } }
  }`
      : "";
    ring = `<g class="pop"${delay(ctx, 0, 0, 200)}>
  <circle cx="${r(cx)}" cy="${r(cy)}" r="${ringR}" stroke="${theme.ring}" stroke-opacity="0.18" stroke-width="6"/>
  <circle class="ring-progress" cx="${r(cx)}" cy="${r(cy)}" r="${ringR}" stroke="${theme.ring}" stroke-width="6" stroke-linecap="round"
    stroke-dasharray="${r(circ)}" stroke-dashoffset="${r(offset)}" transform="rotate(-90 ${r(cx)} ${r(cy)})"/>
  <text x="${r(cx)}" y="${r(cy + fs * 0.1)}" text-anchor="middle" dominant-baseline="middle" style="font-size:${r(
    fs * 1.7,
  )}px;font-weight:700;fill:${theme.title}">${escapeXml(rank.level)}</text>
  <text class="muted" x="${r(cx)}" y="${r(cy + ringR + 16)}" text-anchor="middle">Top ${rank.percentile < 1 ? "1" : Math.round(rank.percentile)}%</text>
</g>`;
  }

  const name = d.profile.name || d.profile.login;
  const title = `${name}'${name.toLowerCase().endsWith("s") ? "" : "s"} GitHub Stats`;
  let titleMarkup: string | undefined;
  if (o.show_avatar && d.profile.avatarDataUri && !o.hide_title) {
    const size = Math.round(fs * 1.9);
    const ty = pad + fs * 1.3 * 0.8;
    const shown = o.custom_title ?? title;
    titleMarkup = `<g class="fade">
  <clipPath id="avatar-clip"><circle cx="${pad + size / 2}" cy="${r(ty - fs * 0.45)}" r="${size / 2}"/></clipPath>
  <image href="${d.profile.avatarDataUri}" x="${pad}" y="${r(ty - fs * 0.45 - size / 2)}" width="${size}" height="${size}" clip-path="url(#avatar-clip)"/>
  <circle cx="${pad + size / 2}" cy="${r(ty - fs * 0.45)}" r="${size / 2 - 0.5}" stroke="${theme.border}"/>
  <text class="title" x="${pad + size + 10}" y="${r(ty)}">${escapeXml(truncate(ctx, shown, width - pad * 2 - size - 10, fs * 1.3, true))}</text>
</g>`;
  }

  const desc = rows.map((row) => `${row.label}: ${row.value}`).join(", ") + (showRank ? `. Rank ${rank.level}` : "");
  return frame({ ctx, width, height, title, desc, body: rowsSvg + "\n" + ring, titleMarkup, css });
}
