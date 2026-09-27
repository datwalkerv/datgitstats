import type { TopLangsOptions } from "@/lib/config";
import type { RepoInfo } from "@/types/github";
import { seriesColor, type CardTheme } from "@/lib/themes";
import { formatPercent } from "@/lib/utils/format";
import { computeTopLanguages, type LanguageStat } from "@/lib/utils/languages";
import { delay, escapeXml, frame, makeCtx, r, titleHeight, truncate, type Ctx } from "./primitives";

export interface TopLangsCardData {
  repos: RepoInfo[];
  approximate?: boolean;
}

export function topLanguagesFor(d: TopLangsCardData, o: TopLangsOptions, theme?: CardTheme): LanguageStat[] {
  const langs = computeTopLanguages(d.repos, {
    method: o.method,
    sizeWeight: o.size_weight,
    countWeight: o.count_weight,
    includeForks: o.include_forks,
    includeArchived: o.include_archived,
    excludeRepos: o.exclude_repo,
    hide: o.hide,
    count: o.langs_count,
    showOther: o.show_other,
  });
  if (o.lang_colors !== "theme" || !theme) return langs;
  // Color by rank from the theme palette; the "Other" bucket stays neutral.
  return langs.map((l, i) => ({ ...l, color: l.name === "Other" && o.show_other ? theme.muted : seriesColor(theme, i) }));
}

interface Layout {
  width: number;
  height: number;
  body: string;
}

const pct = (o: TopLangsOptions, l: LanguageStat) => (o.show_percent ? escapeXml(formatPercent(l.percent)) : "");

function bars(ctx: Ctx, o: TopLangsOptions, langs: LanguageStat[], top: number): Layout {
  const { fs, pad, theme } = ctx;
  const width = o.width || 350;
  const rowH = Math.round(fs * 2.85);
  const barW = width - pad * 2;
  const body = langs
    .map((l, i) => {
      const y = top + i * rowH;
      const w = Math.max(2, (barW * l.percent) / 100);
      return `<g class="fade"${delay(ctx, i, 70)}>
  <text class="label" x="${pad}" y="${r(y + fs)}">${escapeXml(truncate(ctx, l.name, barW - 60))}</text>
  ${o.show_percent ? `<text class="muted" x="${width - pad}" y="${r(y + fs)}" text-anchor="end">${pct(o, l)}</text>` : ""}
  <rect x="${pad}" y="${r(y + fs * 1.5)}" width="${barW}" height="8" rx="4" fill="${theme.muted}" fill-opacity="0.16"/>
  <rect class="grow"${delay(ctx, i, 70, 250)} x="${pad}" y="${r(y + fs * 1.5)}" width="${r(w)}" height="8" rx="4" fill="${l.color}"/>
</g>`;
    })
    .join("\n");
  return { width, height: Math.round(top + langs.length * rowH + pad - fs * 0.4), body };
}

function percentBars(ctx: Ctx, o: TopLangsOptions, langs: LanguageStat[], top: number): Layout {
  const { fs, pad, theme } = ctx;
  const width = o.width || 400;
  const rowH = Math.round(fs * 1.9);
  const nameW = Math.min(130, Math.max(70, ...langs.map((l) => l.name.length * fs * ctx.charW + 16)));
  const pctW = o.show_percent ? 58 : 0;
  const barX = pad + nameW;
  const barW = width - pad * 2 - nameW - pctW;
  const body = langs
    .map((l, i) => {
      const y = top + i * rowH + rowH / 2;
      const w = Math.max(2, (barW * l.percent) / 100);
      return `<g class="fade"${delay(ctx, i, 60)}>
  <circle cx="${pad + 5}" cy="${r(y)}" r="5" fill="${l.color}"/>
  <text class="label" x="${pad + 16}" y="${r(y + fs * 0.35)}">${escapeXml(truncate(ctx, l.name, nameW - 12))}</text>
  <rect x="${r(barX)}" y="${r(y - 3)}" width="${r(barW)}" height="6" rx="3" fill="${theme.muted}" fill-opacity="0.14"/>
  <rect class="grow"${delay(ctx, i, 60, 250)} x="${r(barX)}" y="${r(y - 3)}" width="${r(w)}" height="6" rx="3" fill="${l.color}"/>
  ${o.show_percent ? `<text class="value" x="${width - pad}" y="${r(y + fs * 0.35)}" text-anchor="end">${pct(o, l)}</text>` : ""}
</g>`;
    })
    .join("\n");
  return { width, height: Math.round(top + langs.length * rowH + pad - 6), body };
}

function compact(ctx: Ctx, o: TopLangsOptions, langs: LanguageStat[], top: number): Layout {
  const { fs, pad } = ctx;
  const width = o.width || 350;
  const barW = width - pad * 2;
  const clipId = "compact-bar";
  let x = pad;
  const segs = langs
    .map((l) => {
      const w = (barW * l.percent) / 100;
      const seg = `<rect x="${r(x)}" y="${top}" width="${r(w + 0.5)}" height="8" fill="${l.color}"/>`;
      x += w;
      return seg;
    })
    .join("");
  const cols = 2;
  const colW = barW / cols;
  const rowH = Math.round(fs * 1.75);
  const legendTop = top + 8 + fs * 1.6;
  const legend = langs
    .map((l, i) => {
      const cx = pad + (i % cols) * colW;
      const cy = legendTop + Math.floor(i / cols) * rowH;
      const pctW = o.show_percent ? ctx.fs * 0.86 * ctx.charW * pct(o, l).length + 6 : 0;
      const text = truncate(ctx, l.name, colW - 16 - pctW - 8);
      return `<g class="fade"${delay(ctx, i, 50, 300)}>
  <circle cx="${r(cx + 5)}" cy="${r(cy - fs * 0.33)}" r="5" fill="${l.color}"/>
  <text class="label" x="${r(cx + 16)}" y="${r(cy)}">${escapeXml(text)}${
        o.show_percent ? `<tspan class="muted" dx="6">${pct(o, l)}</tspan>` : ""
      }</text>
</g>`;
    })
    .join("\n");
  const rows = Math.ceil(langs.length / cols);
  const body = `<clipPath id="${clipId}"><rect x="${pad}" y="${top}" width="${barW}" height="8" rx="4"/></clipPath>
<g class="grow" clip-path="url(#${clipId})">${segs}</g>
${legend}`;
  return { width, height: Math.round(legendTop + (rows - 1) * rowH + pad + 2), body };
}

function circular(ctx: Ctx, o: TopLangsOptions, langs: LanguageStat[], top: number, pie: boolean): Layout {
  const { fs, pad, theme } = ctx;
  const rowH = Math.round(fs * 1.75);
  const legendH = langs.length * rowH;
  const radius = Math.max(44, Math.min(70, legendH / 2 + 8));
  const longest = Math.max(...langs.map((l) => l.name.length), 6);
  const legendW = 16 + longest * fs * ctx.charW + (o.show_percent ? 64 : 8);
  // Chart layouts keep their natural width and get centered in wider cards.
  const natural = Math.round(pad * 2 + legendW + 28 + radius * 2);
  const width = o.width ? Math.min(o.width, natural) : natural;
  const contentH = Math.max(legendH, radius * 2);
  const height = Math.round(top + contentH + pad - 4);
  const cx = width - pad - radius;
  const cy = top + contentH / 2 - 2;

  // Each slice is a dashed circle stroke: pie = stroke as wide as the radius.
  const sliceR = pie ? radius / 2 : radius - 10;
  const strokeW = pie ? radius : 16;
  const circ = 2 * Math.PI * sliceR;
  let acc = 0;
  const gap = !pie && langs.length > 1 ? 1.5 : 0;
  const slices = langs
    .map((l) => {
      const len = (circ * l.percent) / 100;
      const s = `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(sliceR)}" stroke="${l.color}" stroke-width="${strokeW}" stroke-dasharray="${r(
        Math.max(0.01, len - gap),
      )} ${r(circ)}" stroke-dashoffset="${r(-acc)}" transform="rotate(-90 ${r(cx)} ${r(cy)})"/>`;
      acc += len;
      return s;
    })
    .join("");

  const legendTop = top + (contentH - legendH) / 2 + rowH / 2;
  const legend = langs
    .map((l, i) => {
      const y = legendTop + i * rowH;
      return `<g class="fade"${delay(ctx, i, 60, 250)}>
  <circle cx="${pad + 5}" cy="${r(y)}" r="5" fill="${l.color}"/>
  <text class="label" x="${pad + 16}" y="${r(y + fs * 0.35)}">${escapeXml(truncate(ctx, l.name, legendW - 70))}</text>
  ${o.show_percent ? `<text class="muted" x="${r(pad + legendW)}" y="${r(y + fs * 0.35)}" text-anchor="end">${pct(o, l)}</text>` : ""}
</g>`;
    })
    .join("\n");

  const center = pie
    ? ""
    : `<text x="${r(cx)}" y="${r(cy - 2)}" text-anchor="middle" style="font-size:${r(fs * 1.25)}px;font-weight:700;fill:${theme.title}">${langs.length}</text>
<text class="muted" x="${r(cx)}" y="${r(cy + fs)}" text-anchor="middle">${langs.length === 1 ? "language" : "languages"}</text>`;
  return { width, height, body: `${legend}\n<g class="pop"${delay(ctx, 0, 0, 150)}>${slices}${center}</g>` };
}

export function renderTopLangsCard(d: TopLangsCardData, o: TopLangsOptions): string {
  const ctx = makeCtx(o);
  const langs = topLanguagesFor(d, o, ctx.theme);
  const top = ctx.pad + titleHeight(ctx);
  const title = "Most Used Languages";

  if (!langs.length) {
    const width = o.width || 350;
    const natural = top + ctx.fs + ctx.pad + 8;
    const body = `<text class="muted fade" x="${ctx.pad}" y="${top + ctx.fs}">No language data available.</text>`;
    return frame({ ctx, width, height: o.height || natural, title, desc: "No language data", body, contentHeight: natural });
  }

  const layout =
    o.layout === "compact"
      ? compact(ctx, o, langs, top)
      : o.layout === "donut"
        ? circular(ctx, o, langs, top, false)
        : o.layout === "pie"
          ? circular(ctx, o, langs, top, true)
          : o.layout === "percent"
            ? percentBars(ctx, o, langs, top)
            : bars(ctx, o, langs, top);

  const desc = langs.map((l) => `${l.name} ${formatPercent(l.percent)}`).join(", ");
  return frame({
    ctx,
    width: o.width || layout.width,
    height: o.height || layout.height,
    title,
    desc,
    body: layout.body,
    contentWidth: layout.width,
    contentHeight: layout.height,
  });
}
