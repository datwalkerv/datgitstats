import { THEME_IDS, DEFAULT_THEME_ID } from "@/lib/themes";
import { bool, color, colors, enumOf, float, int, text } from "./fields";

export const FONTS = ["system", "mono", "serif", "rounded"] as const;
export type FontId = (typeof FONTS)[number];

export const commonFields = {
  theme: enumOf(THEME_IDS as unknown as [string, ...string[]], DEFAULT_THEME_ID, "Built-in theme id."),
  hide_border: bool(false, "Hide the card border."),
  border_radius: float(6, 0, 40, "Corner radius in px."),
  width: int(0, 0, 1000, "Card width in px (0 = automatic)."),
  height: int(0, 0, 1000, "Card height in px (0 = automatic)."),
  padding: int(24, 8, 48, "Inner padding in px."),
  bg_opacity: int(100, 0, 100, "Background opacity in percent."),
  font: enumOf(FONTS, "system", "Font stack. Web fonts can't load inside README images, so these are system stacks."),
  font_size: int(14, 10, 20, "Base font size in px."),
  animate: bool(true, "Fade-in animations (respects prefers-reduced-motion)."),
  hide_title: bool(false, "Hide the card title."),
  custom_title: text(60, "Replace the card title."),
  show_icons: bool(true, "Show icons next to labels."),
  hide_labels: bool(false, "Hide text labels (values only)."),
  bg_color: color("Background color override (hex)."),
  text_color: color("Text color override (hex)."),
  title_color: color("Title color override (hex)."),
  icon_color: color("Icon color override (hex)."),
  border_color: color("Border color override (hex)."),
  accent_color: color("Accent color override (hex)."),
  ring_color: color("Ring / progress color override (hex)."),
  muted_color: color("Secondary text color override (hex)."),
  contrib_colors: colors(5, "Five comma-separated hex colors for contribution levels."),
  cache_seconds: int(0, 0, 86400, "Browser/CDN cache duration (clamped to 1800–86400, 0 = default)."),
};
