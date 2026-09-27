import { describe, expect, it } from "vitest";
import { defaultCardOptions } from "@/lib/config";
import { LANG_LAYOUTS } from "@/lib/config/top-langs";
import { renderCard, renderErrorCard } from "@/lib/generators";
import { escapeXml, resolveTheme } from "@/lib/generators/primitives";
import { getTheme, seriesColor, THEMES } from "@/lib/themes";
import { parseContributionHtml } from "@/lib/github/contributions";
import { bundle } from "./fixtures";

/** Cheap well-formedness check: balanced tags and no raw special characters in text. */
function assertWellFormed(svg: string) {
  expect(svg.startsWith("<svg")).toBe(true);
  expect(svg.trim().endsWith("</svg>")).toBe(true);
  const stack: string[] = [];
  for (const m of svg.replace(/<style>[\s\S]*?<\/style>/g, "").matchAll(/<(\/?)([a-zA-Z]+)[^>]*?(\/?)>/g)) {
    if (m[3]) continue;
    if (m[1]) expect(stack.pop()).toBe(m[2]);
    else stack.push(m[2]);
  }
  expect(stack).toEqual([]);
  expect(svg).not.toMatch(/>[^<]*<(?![a-zA-Z/!])/);
  expect(svg).not.toContain("NaN");
  expect(svg).not.toContain("undefined");
}

describe("generators", () => {
  const b = bundle();

  it("escapes user-controlled text", () => {
    expect(escapeXml(`<a href="x">&'`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&apos;");
    const svg = renderCard("stats", b, defaultCardOptions("stats"));
    expect(svg).toContain("The &lt;Octocat&gt; &amp; Co");
    expect(svg).not.toContain("<Octocat>");
  });

  it("renders a well-formed stats card in several themes", () => {
    for (const theme of ["default", "dracula", "github-light"]) {
      const svg = renderCard("stats", b, { ...defaultCardOptions("stats"), theme, show: ["followers", "age"] });
      assertWellFormed(svg);
      expect(svg).toContain("Followers");
    }
    const noRank = renderCard("stats", b, { ...defaultCardOptions("stats"), hide_rank: true, hide: ["stars"] });
    assertWellFormed(noRank);
    expect(noRank).not.toContain("ring-progress");
    expect(noRank).not.toContain("Total stars");
  });

  it("renders every top-languages layout", () => {
    for (const layout of LANG_LAYOUTS) {
      const svg = renderCard("top-langs", b, { ...defaultCardOptions("top-langs"), layout });
      assertWellFormed(svg);
      expect(svg).toContain("TypeScript");
    }
    const empty = renderCard("top-langs", { ...b, repos: [] }, defaultCardOptions("top-langs"));
    expect(empty).toContain("No language data");
  });

  it("renders the streak card with toggles and graph", () => {
    const svg = renderCard("streak", b, { ...defaultCardOptions("streak"), show_graph: true });
    assertWellFormed(svg);
    expect(svg).toContain("Current Streak");
    const hidden = renderCard("streak", b, { ...defaultCardOptions("streak"), hide_longest_streak: true, hide_total_contributions: true });
    expect(hidden).not.toContain("Longest Streak");
    expect(hidden).not.toContain("Total Contributions");
  });

  it("applies custom sizing and colors", () => {
    const svg = renderCard("stats", b, { ...defaultCardOptions("stats"), width: 600, height: 300, bg_color: "#123456", hide_border: true });
    expect(svg).toContain('width="600" height="300"');
    expect(svg).toContain('fill="#123456"');
    expect(svg).not.toMatch(/<rect x="0.5"[^>]*stroke=/);
  });

  it("renders error cards", () => {
    const svg = renderErrorCard({ title: "User not found", message: "Check <it>", card: "GitHub Stats" });
    assertWellFormed(svg);
    expect(svg).toContain("Check &lt;it&gt;");
  });
});

describe("parseContributionHtml", () => {
  it("reads dates, levels and tooltip counts", () => {
    const html = `
      <td tabindex="0" data-ix="0" data-date="2025-01-05" id="contribution-day-component-0-1" data-level="0" class="ContributionCalendar-day"></td>
      <td tabindex="0" data-date="2025-01-06" id="contribution-day-component-1-1" data-level="3" class="ContributionCalendar-day"></td>
      <tool-tip id="t1" for="contribution-day-component-0-1" popover="manual">No contributions on January 5th.</tool-tip>
      <tool-tip id="t2" for="contribution-day-component-1-1" popover="manual">1,204 contributions on January 6th.</tool-tip>`;
    expect(parseContributionHtml(html)).toEqual([
      { date: "2025-01-05", level: 0, count: 0 },
      { date: "2025-01-06", level: 3, count: 1204 },
    ]);
  });
});

describe("centering", () => {
  const b = bundle();

  it("centers content in cards larger than their natural size", () => {
    const natural = renderCard("stats", b, defaultCardOptions("stats"));
    const [, nw, nh] = /width="(\d+)" height="(\d+)"/.exec(natural)!.map(Number);
    expect(natural).toContain("<g>\n");
    const big = renderCard("stats", b, { ...defaultCardOptions("stats"), width: nw + 200, height: nh + 100 });
    expect(big).toContain(`<g transform="translate(100 50)">`);
    for (const type of ["top-langs", "streak"] as const) {
      const svg = renderCard(type, b, { ...defaultCardOptions(type), height: 600 } as never);
      expect(svg).toMatch(/<g transform="translate\(0 \d+(\.\d+)?\)">/);
    }
    const donut = renderCard("top-langs", b, { ...defaultCardOptions("top-langs"), layout: "donut", width: 900 });
    expect(donut).toMatch(/<g transform="translate\(\d+(\.\d+)? 0\)">/);
  });

  it("keeps content anchored when the card is smaller than natural", () => {
    const svg = renderCard("stats", b, { ...defaultCardOptions("stats"), width: 200, height: 80 });
    expect(svg).not.toContain(`<g transform="translate(`);
  });
});

describe("language colors", () => {
  const b = bundle();
  const fills = (svg: string) => [...svg.matchAll(/<circle cx="[^"]+" cy="[^"]+" r="5" fill="(#[0-9a-f]+)"/gi)].map((m) => m[1].toLowerCase());

  it("uses the theme palette by rank by default", () => {
    const o = { ...defaultCardOptions("top-langs"), layout: "percent" as const, theme: "dracula" };
    expect(fills(renderCard("top-langs", b, o))).toEqual(getTheme("dracula").palette.slice(0, 3));
  });

  it("can keep GitHub's language colors", () => {
    const o = { ...defaultCardOptions("top-langs"), layout: "percent" as const, theme: "dracula", lang_colors: "language" as const };
    expect(fills(renderCard("top-langs", b, o))[0]).toBe("#3178c6"); // TypeScript
  });

  it("leads with a custom accent and shades beyond the palette length", () => {
    const theme = resolveTheme({ ...defaultCardOptions("top-langs"), theme: "nord", accent_color: "#ff0000" });
    expect(theme.palette[0]).toBe("#ff0000");
    expect(seriesColor(theme, theme.palette.length)).not.toBe(theme.palette[0]);
    expect(seriesColor(theme, theme.palette.length)).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("gives every built-in theme a palette of valid colors", () => {
    for (const t of THEMES) {
      expect(t.palette.length, t.id).toBeGreaterThanOrEqual(6);
      for (const c of t.palette) expect(c, t.id).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
