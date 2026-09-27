/**
 * Built-in card themes. Colors are 6-digit hex strings including the leading "#".
 * `contrib` holds the 5 contribution levels (none → most) used by activity graphs.
 */
export interface CardTheme {
  bg: string;
  text: string;
  title: string;
  icon: string;
  border: string;
  accent: string;
  ring: string;
  muted: string;
  contrib: [string, string, string, string, string];
  /** Ordered series colors (e.g. languages), most prominent first. */
  palette: string[];
}

export interface ThemeDefinition extends CardTheme {
  id: string;
  label: string;
  dark: boolean;
}

const t = (
  id: string,
  label: string,
  dark: boolean,
  c: Omit<CardTheme, "contrib" | "palette"> & { contrib?: CardTheme["contrib"] },
): ThemeDefinition => ({
  id,
  label,
  dark,
  ...c,
  contrib: c.contrib ?? rampFrom(c.bg, c.accent),
  palette: PALETTES[id] ?? [c.accent, c.title, c.icon, c.ring],
});

/**
 * Hand-picked series palettes drawn from each theme's own color scheme, ordered so
 * neighbouring entries stay distinguishable.
 */
const PALETTES: Record<string, string[]> = {
  default: ["#58a6ff", "#3fb950", "#d29922", "#f778ba", "#a371f7", "#ff7b72", "#39c5cf", "#e3b341"],
  "github-dark": ["#2f81f7", "#3fb950", "#d29922", "#db61a2", "#a371f7", "#f85149", "#39c5cf", "#e3b341"],
  "github-light": ["#0969da", "#1a7f37", "#9a6700", "#bf3989", "#8250df", "#cf222e", "#1b7c83", "#bc4c00"],
  dracula: ["#bd93f9", "#ff79c6", "#8be9fd", "#50fa7b", "#ffb86c", "#f1fa8c", "#ff5555", "#6272a4"],
  nord: ["#88c0d0", "#81a1c1", "#a3be8c", "#ebcb8b", "#d08770", "#b48ead", "#5e81ac", "#bf616a"],
  "tokyo-night": ["#7aa2f7", "#bb9af7", "#7dcfff", "#9ece6a", "#e0af68", "#f7768e", "#73daca", "#ff9e64"],
  "one-dark": ["#61afef", "#c678dd", "#98c379", "#e5c07b", "#e06c75", "#56b6c2", "#d19a66", "#abb2bf"],
  monokai: ["#a6e22e", "#f92672", "#66d9ef", "#fd971f", "#ae81ff", "#e6db74", "#f8f8f2", "#75715e"],
  "catppuccin-mocha": ["#cba6f7", "#89b4fa", "#a6e3a1", "#f9e2af", "#fab387", "#f38ba8", "#94e2d5", "#f5c2e7"],
  "catppuccin-latte": ["#8839ef", "#1e66f5", "#40a02b", "#df8e1d", "#fe640b", "#d20f39", "#179299", "#ea76cb"],
  gruvbox: ["#fabd2f", "#fe8019", "#b8bb26", "#83a598", "#d3869b", "#8ec07c", "#fb4934", "#a89984"],
  "gruvbox-light": ["#b57614", "#af3a03", "#79740e", "#076678", "#8f3f71", "#427b58", "#9d0006", "#7c6f64"],
  "solarized-dark": ["#268bd2", "#2aa198", "#859900", "#b58900", "#cb4b16", "#d33682", "#6c71c4", "#dc322f"],
  "solarized-light": ["#268bd2", "#2aa198", "#859900", "#b58900", "#cb4b16", "#d33682", "#6c71c4", "#dc322f"],
  // IBM + Okabe–Ito colorblind-safe colors.
  "vision-friendly-dark": ["#648fff", "#ffb000", "#dc267f", "#785ef0", "#fe6100", "#56b4e9", "#009e73", "#f0e442"],
  midnight: ["#8aa4ff", "#b18aff", "#6fd3ff", "#7ee0b5", "#ffd27a", "#ff8fa3", "#9aa5ce", "#c8d3f5"],
  amoled: ["#ffffff", "#a3a3a3", "#d4d4d4", "#6b6b6b", "#e8e8e8", "#8a8a8a", "#bdbdbd", "#525252"],
  minimal: ["#171717", "#737373", "#404040", "#a3a3a3", "#262626", "#8a8a8a", "#525252", "#bdbdbd"],
  "minimal-dark": ["#fafafa", "#a3a3a3", "#d4d4d4", "#737373", "#e5e5e5", "#8a8a8a", "#bdbdbd", "#5a5a5a"],
  ocean: ["#5ec8f2", "#2dd4bf", "#818cf8", "#34a0d8", "#a5f3fc", "#38bdf8", "#67e8f9", "#6b8aa8"],
  forest: ["#8fd694", "#d4c26a", "#5fa86b", "#c5e1a5", "#88c9a1", "#a3b18a", "#6fcf7a", "#e0d8a8"],
  sunset: ["#ff9a62", "#ff6f91", "#ffc75f", "#c34a8f", "#f9f871", "#d65db1", "#ff8066", "#845ec2"],
  "rose-pine": ["#ebbcba", "#c4a7e7", "#9ccfd8", "#f6c177", "#eb6f92", "#31748f", "#e0def4", "#908caa"],
  synthwave: ["#ff7edb", "#72f1b8", "#fede5d", "#f97e72", "#36f9f6", "#fe4450", "#b893ce", "#03edf9"],
  everforest: ["#a7c080", "#83c092", "#7fbbb3", "#dbbc7f", "#e69875", "#d699b6", "#e67e80", "#9da9a0"],
  "ayu-light": ["#fa8d3e", "#399ee6", "#86b300", "#a37acc", "#4cbf99", "#f2ae49", "#f07171", "#55b4d4"],
};

/** Series color i: the palette, then shades of it (mixed toward the background) for longer lists. */
export function seriesColor(theme: CardTheme, i: number): string {
  const { palette } = theme;
  const base = palette[i % palette.length];
  const round = Math.floor(i / palette.length);
  if (round === 0) return base;
  return mixHex(base, theme.bg, Math.min(0.6, 0.3 * round));
}

export function mixHex(a: string, b: string, w: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const ch = (i: number) => Math.round(pa[i] + (pb[i] - pa[i]) * w);
  return rgbToHex(ch(0), ch(1), ch(2));
}

/** Builds a 5-step contribution ramp between the background and the accent. */
function rampFrom(bg: string, accent: string): CardTheme["contrib"] {
  const mix = mixHex;
  return [mix(bg, accent, 0.12), mix(bg, accent, 0.35), mix(bg, accent, 0.55), mix(bg, accent, 0.78), accent];
}

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

const GITHUB_GREEN_DARK: CardTheme["contrib"] = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];
const GITHUB_GREEN_LIGHT: CardTheme["contrib"] = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

export const THEMES: ThemeDefinition[] = [
  t("default", "Default", true, {
    bg: "#0d1117", text: "#c9d1d9", title: "#f0f6fc", icon: "#8b949e", border: "#30363d",
    accent: "#58a6ff", ring: "#58a6ff", muted: "#8b949e", contrib: GITHUB_GREEN_DARK,
  }),
  t("github-dark", "GitHub Dark", true, {
    bg: "#0d1117", text: "#c9d1d9", title: "#58a6ff", icon: "#1f6feb", border: "#30363d",
    accent: "#2f81f7", ring: "#2f81f7", muted: "#8b949e", contrib: GITHUB_GREEN_DARK,
  }),
  t("github-light", "GitHub Light", false, {
    bg: "#ffffff", text: "#1f2328", title: "#0969da", icon: "#0969da", border: "#d0d7de",
    accent: "#0969da", ring: "#0969da", muted: "#656d76", contrib: GITHUB_GREEN_LIGHT,
  }),
  t("dracula", "Dracula", true, {
    bg: "#282a36", text: "#f8f8f2", title: "#ff79c6", icon: "#bd93f9", border: "#44475a",
    accent: "#bd93f9", ring: "#ff79c6", muted: "#6272a4",
  }),
  t("nord", "Nord", true, {
    bg: "#2e3440", text: "#d8dee9", title: "#88c0d0", icon: "#81a1c1", border: "#3b4252",
    accent: "#88c0d0", ring: "#88c0d0", muted: "#7b88a1",
  }),
  t("tokyo-night", "Tokyo Night", true, {
    bg: "#1a1b27", text: "#a9b1d6", title: "#70a5fd", icon: "#bf91f3", border: "#292e42",
    accent: "#7aa2f7", ring: "#bb9af7", muted: "#565f89",
  }),
  t("one-dark", "One Dark", true, {
    bg: "#282c34", text: "#abb2bf", title: "#e5c07b", icon: "#61afef", border: "#3e4451",
    accent: "#98c379", ring: "#e5c07b", muted: "#7f848e",
  }),
  t("monokai", "Monokai", true, {
    bg: "#272822", text: "#f8f8f2", title: "#f92672", icon: "#a6e22e", border: "#3e3d32",
    accent: "#a6e22e", ring: "#f92672", muted: "#908f7f",
  }),
  t("catppuccin-mocha", "Catppuccin Mocha", true, {
    bg: "#1e1e2e", text: "#cdd6f4", title: "#cba6f7", icon: "#89b4fa", border: "#313244",
    accent: "#a6e3a1", ring: "#cba6f7", muted: "#7f849c",
  }),
  t("catppuccin-latte", "Catppuccin Latte", false, {
    bg: "#eff1f5", text: "#4c4f69", title: "#8839ef", icon: "#1e66f5", border: "#ccd0da",
    accent: "#40a02b", ring: "#8839ef", muted: "#6c6f85",
  }),
  t("gruvbox", "Gruvbox", true, {
    bg: "#282828", text: "#ebdbb2", title: "#fabd2f", icon: "#fe8019", border: "#3c3836",
    accent: "#b8bb26", ring: "#fabd2f", muted: "#a89984",
  }),
  t("gruvbox-light", "Gruvbox Light", false, {
    bg: "#fbf1c7", text: "#3c3836", title: "#b57614", icon: "#af3a03", border: "#d5c4a1",
    accent: "#79740e", ring: "#b57614", muted: "#7c6f64",
  }),
  t("solarized-dark", "Solarized Dark", true, {
    bg: "#002b36", text: "#93a1a1", title: "#268bd2", icon: "#b58900", border: "#073642",
    accent: "#2aa198", ring: "#268bd2", muted: "#657b83",
  }),
  t("solarized-light", "Solarized Light", false, {
    bg: "#fdf6e3", text: "#586e75", title: "#268bd2", icon: "#b58900", border: "#eee8d5",
    accent: "#2aa198", ring: "#268bd2", muted: "#839496",
  }),
  t("vision-friendly-dark", "Vision Friendly Dark", true, {
    bg: "#000000", text: "#ffffff", title: "#ffb000", icon: "#785ef0", border: "#3a3a3a",
    accent: "#ffb000", ring: "#785ef0", muted: "#bfbfbf",
    contrib: ["#1a1a1a", "#3d2f73", "#785ef0", "#dc6b28", "#ffb000"],
  }),
  t("midnight", "Midnight", true, {
    bg: "#0b1020", text: "#c8d3f5", title: "#e2e8ff", icon: "#8aa4ff", border: "#1c2440",
    accent: "#8aa4ff", ring: "#8aa4ff", muted: "#6c7aa6",
  }),
  t("amoled", "AMOLED", true, {
    bg: "#000000", text: "#e6e6e6", title: "#ffffff", icon: "#a3a3a3", border: "#1f1f1f",
    accent: "#ffffff", ring: "#ffffff", muted: "#8a8a8a",
    contrib: ["#111111", "#3a3a3a", "#6b6b6b", "#a8a8a8", "#ffffff"],
  }),
  t("minimal", "Minimal", false, {
    bg: "#ffffff", text: "#404040", title: "#0a0a0a", icon: "#737373", border: "#e5e5e5",
    accent: "#171717", ring: "#171717", muted: "#737373",
    contrib: ["#f0f0f0", "#cfcfcf", "#9e9e9e", "#5e5e5e", "#171717"],
  }),
  t("minimal-dark", "Minimal Dark", true, {
    bg: "#0a0a0a", text: "#a3a3a3", title: "#fafafa", icon: "#737373", border: "#262626",
    accent: "#fafafa", ring: "#fafafa", muted: "#737373",
    contrib: ["#171717", "#3f3f3f", "#6f6f6f", "#b0b0b0", "#fafafa"],
  }),
  t("ocean", "Ocean", true, {
    bg: "#0a1929", text: "#b2cde6", title: "#5ec8f2", icon: "#34a0d8", border: "#13304d",
    accent: "#2dd4bf", ring: "#5ec8f2", muted: "#6b8aa8",
  }),
  t("forest", "Forest", true, {
    bg: "#0f1a14", text: "#c5d6c9", title: "#8fd694", icon: "#5fa86b", border: "#1f3326",
    accent: "#6fcf7a", ring: "#8fd694", muted: "#77917e",
  }),
  t("sunset", "Sunset", true, {
    bg: "#1f1225", text: "#f1d8e4", title: "#ff9a62", icon: "#ff6f91", border: "#3a2440",
    accent: "#ff6f91", ring: "#ff9a62", muted: "#a8869a",
  }),
  t("rose-pine", "Rosé Pine", true, {
    bg: "#191724", text: "#e0def4", title: "#ebbcba", icon: "#c4a7e7", border: "#26233a",
    accent: "#9ccfd8", ring: "#ebbcba", muted: "#6e6a86",
  }),
  t("synthwave", "Synthwave", true, {
    bg: "#2b213a", text: "#e5e5e5", title: "#f97e72", icon: "#72f1b8", border: "#3d2f52",
    accent: "#ff7edb", ring: "#fede5d", muted: "#8f86a3",
  }),
  t("everforest", "Everforest", true, {
    bg: "#2d353b", text: "#d3c6aa", title: "#a7c080", icon: "#83c092", border: "#3d484d",
    accent: "#a7c080", ring: "#dbbc7f", muted: "#859289",
  }),
  t("ayu-light", "Ayu Light", false, {
    bg: "#fcfcfc", text: "#5c6166", title: "#fa8d3e", icon: "#399ee6", border: "#e7e8e9",
    accent: "#86b300", ring: "#fa8d3e", muted: "#8a9199",
  }),
];

export const THEME_IDS = THEMES.map((th) => th.id);
export const DEFAULT_THEME_ID = "default";

const byId = new Map(THEMES.map((th) => [th.id, th]));

export function getTheme(id: string | undefined): ThemeDefinition {
  return (id && byId.get(id)) || byId.get(DEFAULT_THEME_ID)!;
}
