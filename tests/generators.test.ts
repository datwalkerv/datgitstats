import { describe, expect, it } from "vitest";
import { defaultCardOptions } from "@/lib/config";
import { LANG_LAYOUTS } from "@/lib/config/top-langs";
import { renderCard, renderErrorCard } from "@/lib/generators";
import { escapeXml } from "@/lib/generators/primitives";
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
