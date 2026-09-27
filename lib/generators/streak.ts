import type { StreakOptions } from "@/lib/config";
import type { ContributionData } from "@/types/github";
import { addDays, formatDate, todayUTC, weekStart } from "@/lib/utils/dates";
import { formatNumber } from "@/lib/utils/format";
import { computeStreaks, type Streak } from "@/lib/utils/streak-calc";
import { delay, escapeXml, frame, icon, makeCtx, r, titleHeight, type Ctx } from "./primitives";

export interface StreakCardData {
  login: string;
  name?: string | null;
  contributions: ContributionData;
}

function range(o: StreakOptions, s: Streak, today: string): string {
  if (!s.start || !s.end) return "—";
  const sameYear = s.start.slice(0, 4) === s.end.slice(0, 4) && s.end.slice(0, 4) === today.slice(0, 4);
  const fmt = (d: string) => formatDate(d, o.date_format, !sameYear || o.date_format === "iso");
  if (s.start === s.end) return fmt(s.start);
  return `${fmt(s.start)} – ${s.end >= today ? "Present" : fmt(s.end)}`;
}

function heatStrip(ctx: Ctx, o: StreakOptions, data: ContributionData, top: number, width: number, today: string) {
  const { pad, theme } = ctx;
  const weeks = o.graph_weeks;
  const gap = 3;
  const avail = width - pad * 2;
  const cell = Math.min(11, (avail - gap * (weeks - 1)) / weeks);
  const stripW = weeks * cell + (weeks - 1) * gap;
  const x0 = pad + (avail - stripW) / 2;
  const levels = new Map(data.days.map((d) => [d.date, d.level]));
  const start = addDays(weekStart(today), -(weeks - 1) * 7);
  const cells: string[] = [];
  for (let w = 0; w < weeks; w++) {
    for (let dow = 0; dow < 7; dow++) {
      const date = addDays(start, w * 7 + dow);
      if (date > today) continue;
      const lvl = levels.get(date) ?? 0;
      cells.push(
        `<rect x="${r(x0 + w * (cell + gap))}" y="${r(top + dow * (cell + gap))}" width="${r(cell)}" height="${r(cell)}" rx="${r(
          Math.min(2.5, cell / 4),
        )}" fill="${theme.contrib[lvl]}"/>`,
      );
    }
  }
  return { svg: `<g class="fade"${delay(ctx, 4)}>${cells.join("")}</g>`, height: 7 * cell + 6 * gap };
}

export function renderStreakCard(d: StreakCardData, o: StreakOptions): string {
  const ctx = makeCtx(o);
  const { fs, pad, theme } = ctx;
  const today = todayUTC();
  const s = computeStreaks(d.contributions.days, o.mode, today);
  const unit = o.mode === "weekly" ? "Week" : "";

  type Section = { key: string; value: string; label: string; sub: string; highlight?: boolean };
  const sections: Section[] = [];
  if (!o.hide_total_contributions)
    sections.push({
      key: "total",
      value: formatNumber(s.total, "long"),
      label: "Total Contributions",
      sub: s.firstDate ? `${formatDate(s.firstDate, o.date_format)} – Present` : "—",
    });
  if (!o.hide_current_streak)
    sections.push({
      key: "current",
      value: String(s.current.length),
      label: `Current ${unit ? unit + " " : ""}Streak`,
      sub: range(o, s.current, today),
      highlight: true,
    });
  if (!o.hide_longest_streak)
    sections.push({
      key: "longest",
      value: String(s.longest.length),
      label: `Longest ${unit ? unit + " " : ""}Streak`,
      sub: range(o, s.longest, today),
    });

  const width = o.width || Math.max(300, sections.length * 165);
  const hasTitle = !o.hide_title && !!o.custom_title;
  // The streak card has no default title (like streak-stats); a custom title adds one.
  const top = pad + (hasTitle ? titleHeight(ctx) : 0);
  const ringR = Math.round(fs * 2.9);
  const bodyH = ringR * 2 + fs * 4.6;
  const colW = (width - pad * 2) / Math.max(1, sections.length);

  const cols = sections
    .map((sec, i) => {
      const cx = pad + colW * i + colW / 2;
      const divider =
        i > 0
          ? `<line x1="${r(pad + colW * i)}" y1="${top + 12}" x2="${r(pad + colW * i)}" y2="${r(top + bodyH - 8)}" stroke="${theme.border}"/>`
          : "";
      if (sec.highlight) {
        const cy = top + ringR + 8;
        const flame = o.show_icons
          ? `<rect x="${r(cx - 11)}" y="${r(cy - ringR - 12)}" width="22" height="24" fill="${theme.bg}"/>${icon(
              "flame",
              cx - 9,
              cy - ringR - 10,
              18,
              theme.accent,
            )}`
          : "";
        return `${divider}<g class="pop"${delay(ctx, i)}>
  <circle cx="${r(cx)}" cy="${r(cy)}" r="${ringR}" stroke="${theme.ring}" stroke-width="5"/>
  ${flame}
  <text x="${r(cx)}" y="${r(cy + fs * 0.1)}" text-anchor="middle" dominant-baseline="middle" style="font-size:${r(
    fs * 2,
  )}px;font-weight:700;fill:${theme.title}">${escapeXml(sec.value)}</text>
</g>
<g class="fade"${delay(ctx, i, 90, 250)}>
  ${o.hide_labels ? "" : `<text x="${r(cx)}" y="${r(cy + ringR + fs * 1.9)}" text-anchor="middle" style="font-size:${fs}px;font-weight:600;fill:${theme.accent}">${escapeXml(sec.label)}</text>`}
  <text class="muted" x="${r(cx)}" y="${r(cy + ringR + fs * 3.4)}" text-anchor="middle">${escapeXml(sec.sub)}</text>
</g>`;
      }
      const cy = top + ringR + 8;
      return `${divider}<g class="fade"${delay(ctx, i)}>
  <text x="${r(cx)}" y="${r(cy + fs * 0.1)}" text-anchor="middle" dominant-baseline="middle" style="font-size:${r(
    fs * 2,
  )}px;font-weight:700;fill:${theme.text}">${escapeXml(sec.value)}</text>
  ${o.hide_labels ? "" : `<text x="${r(cx)}" y="${r(cy + ringR + fs * 1.9)}" text-anchor="middle" style="font-size:${fs}px;font-weight:400;fill:${theme.text}">${escapeXml(sec.label)}</text>`}
  <text class="muted" x="${r(cx)}" y="${r(cy + ringR + fs * 3.4)}" text-anchor="middle">${escapeXml(sec.sub)}</text>
</g>`;
    })
    .join("\n");

  let graph = "";
  let graphH = 0;
  if (o.show_graph) {
    const g = heatStrip(ctx, o, d.contributions, top + bodyH + 10, width, today);
    graph = g.svg;
    graphH = g.height + 14;
  }

  const empty = !sections.length
    ? `<text class="muted" x="${pad}" y="${top + fs * 2}">All sections hidden.</text>`
    : "";
  const naturalHeight = Math.round(top + bodyH + graphH + pad - 6);
  const height = o.height || naturalHeight;
  const name = d.name || d.login;
  const desc = sections.map((sec) => `${sec.label}: ${sec.value} (${sec.sub})`).join(", ");
  return frame({
    ctx: hasTitle ? ctx : { ...ctx, o: { ...o, hide_title: true } },
    width,
    height,
    title: `${name}'s GitHub Streak`,
    desc: desc || "GitHub streak",
    body: cols + graph + empty,
    contentHeight: naturalHeight,
  });
}
