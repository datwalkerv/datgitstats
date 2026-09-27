import type { CommonOptions } from "@/lib/config";
import type { FontId } from "@/lib/config/common";
import { getTheme, type CardTheme } from "@/lib/themes";
import { ICONS, type IconName } from "./icons";

export function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);
}

const FONT_STACKS: Record<FontId, string> = {
  system: "'Segoe UI', Ubuntu, 'Helvetica Neue', -apple-system, BlinkMacSystemFont, Arial, sans-serif",
  mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
  serif: "Georgia, Cambria, 'Times New Roman', Times, serif",
  rounded: "ui-rounded, 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Quicksand, Nunito, 'Segoe UI', sans-serif",
};

/** Theme with per-color URL overrides applied. */
export function resolveTheme(o: CommonOptions): CardTheme {
  const base = getTheme(o.theme);
  return {
    bg: o.bg_color ?? base.bg,
    text: o.text_color ?? base.text,
    title: o.title_color ?? base.title,
    icon: o.icon_color ?? base.icon,
    border: o.border_color ?? base.border,
    accent: o.accent_color ?? base.accent,
    ring: o.ring_color ?? o.accent_color ?? base.ring,
    muted: o.muted_color ?? base.muted,
    contrib: (o.contrib_colors as CardTheme["contrib"] | undefined) ?? base.contrib,
    // A custom accent leads the series palette so charts follow the user's colors.
    palette: o.accent_color
      ? [o.accent_color, ...base.palette.filter((c) => c.toLowerCase() !== o.accent_color)]
      : base.palette,
  };
}

export interface Ctx {
  o: CommonOptions;
  theme: CardTheme;
  font: string;
  fs: number; // base font size
  pad: number;
  /** Rough average glyph width factor for layout estimates. */
  charW: number;
}

export function makeCtx(o: CommonOptions): Ctx {
  return {
    o,
    theme: resolveTheme(o),
    font: FONT_STACKS[o.font],
    fs: o.font_size,
    pad: o.padding,
    charW: o.font === "mono" ? 0.62 : 0.56,
  };
}

export function textWidth(ctx: Ctx, s: string, size = ctx.fs, bold = false): number {
  return s.length * size * ctx.charW * (bold ? 1.06 : 1);
}

export function truncate(ctx: Ctx, s: string, maxWidth: number, size = ctx.fs, bold = false): string {
  if (textWidth(ctx, s, size, bold) <= maxWidth) return s;
  const max = Math.max(1, Math.floor(maxWidth / (size * ctx.charW * (bold ? 1.06 : 1))) - 1);
  return s.slice(0, max) + "…";
}

export function icon(name: IconName, x: number, y: number, size: number, fill: string, extra = ""): string {
  const scale = size / 16;
  return `<path transform="translate(${r(x)} ${r(y)}) scale(${r(scale, 3)})" d="${ICONS[name]}" fill="${fill}" ${extra}/>`;
}

export const r = (n: number, digits = 2) => {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
};

/** Stagger helper: returns a style attribute with an animation delay when animations are enabled. */
export function delay(ctx: Ctx, index: number, step = 90, base = 120): string {
  return ctx.o.animate ? ` style="animation-delay:${base + index * step}ms"` : "";
}

export interface FrameInput {
  ctx: Ctx;
  width: number;
  height: number;
  title?: string;
  /** Short accessible description of the card content. */
  desc: string;
  body: string;
  /** Extra CSS rules appended to the card stylesheet. */
  css?: string;
  /** Replace the default title row (e.g. to add an avatar). */
  titleMarkup?: string;
  /**
   * Natural size of the laid-out content (padding included). When the card is larger,
   * the content is centered inside it; when smaller, it stays anchored top-left.
   */
  contentWidth?: number;
  contentHeight?: number;
}

export function titleHeight(ctx: Ctx): number {
  return ctx.o.hide_title ? 0 : Math.round(ctx.fs * 1.3 + ctx.fs * 1.3);
}

export function frame({
  ctx, width, height, title, desc, body, css = "", titleMarkup, contentWidth, contentHeight,
}: FrameInput): string {
  const { theme, o, font, fs, pad } = ctx;
  const w = Math.round(width);
  const h = Math.round(height);
  const cw = Math.min(w, contentWidth ?? w);
  const dx = Math.max(0, (w - cw) / 2);
  const dy = Math.max(0, (h - (contentHeight ?? h)) / 2);
  const radius = Math.min(o.border_radius, h / 2, w / 2);
  const shownTitle = o.custom_title ?? title ?? "";
  const titleText = o.hide_title
    ? ""
    : titleMarkup ??
      `<text class="title fade" x="${pad}" y="${pad + fs * 1.3 * 0.8}">${escapeXml(truncate(ctx, shownTitle, cw - pad * 2, fs * 1.3, true))}</text>`;

  const anim = o.animate
    ? `@media (prefers-reduced-motion: no-preference) {
    .fade { opacity: 0; animation: fadeIn .6s ease-out forwards; }
    .grow { transform-box: fill-box; transform-origin: left center; transform: scaleX(0); animation: grow .8s cubic-bezier(.2,.8,.2,1) forwards; }
    .pop { transform-box: fill-box; transform-origin: center; opacity: 0; animation: pop .5s cubic-bezier(.2,.8,.2,1) forwards; }
    @keyframes fadeIn { to { opacity: 1; } }
    @keyframes grow { to { transform: scaleX(1); } }
    @keyframes pop { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }
  }`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-labelledby="card-title card-desc">
<title id="card-title">${escapeXml(shownTitle || "GitHub card")}</title>
<desc id="card-desc">${escapeXml(desc)}</desc>
<style>
  text { font-family: ${font}; }
  .title { font-size: ${r(fs * 1.3)}px; font-weight: 600; fill: ${theme.title}; }
  .label { font-size: ${fs}px; font-weight: 400; fill: ${theme.text}; }
  .value { font-size: ${fs}px; font-weight: 600; fill: ${theme.text}; }
  .muted { font-size: ${r(fs * 0.86)}px; font-weight: 400; fill: ${theme.muted}; }
  ${anim}
  ${css}
</style>
<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${r(radius)}" fill="${theme.bg}" fill-opacity="${r(o.bg_opacity / 100)}"${
    o.hide_border ? "" : ` stroke="${theme.border}"`
  }/>
${dx || dy ? `<g transform="translate(${r(dx)} ${r(dy)})">` : "<g>"}
${titleText}
${body}
</g>
</svg>`;
}
