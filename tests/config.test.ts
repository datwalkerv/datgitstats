import { describe, expect, it } from "vitest";
import { cardQuery, defaultCardOptions, isValidUsername, parseCardOptions } from "@/lib/config";
import { rowsToHideShow, visibleStatRows } from "@/lib/config/stats";

describe("config parsing", () => {
  it("falls back to defaults on invalid values", () => {
    const o = parseCardOptions("stats", new URLSearchParams("theme=nope&width=abc&hide_border=maybe&bg_color=zzz"));
    const d = defaultCardOptions("stats");
    expect(o.theme).toBe(d.theme);
    expect(o.width).toBe(d.width);
    expect(o.hide_border).toBe(false);
    expect(o.bg_color).toBeUndefined();
  });

  it("parses and clamps values", () => {
    const o = parseCardOptions("top-langs", new URLSearchParams("langs_count=99&layout=DONUT&hide=Go, HTML ,go&bg_color=%23FF0000"));
    expect(o.langs_count).toBe(20);
    expect(o.layout).toBe("donut");
    expect(o.hide).toEqual(["go", "html"]);
    expect(o.bg_color).toBe("#ff0000");
  });

  it("round-trips through the URL and omits defaults", () => {
    const o = { ...defaultCardOptions("streak"), theme: "dracula", hide_current_streak: true, contrib_colors: ["#111111", "#222222", "#333333", "#444444", "#555555"] };
    const q = cardQuery("streak", "octocat", o);
    expect(q).toBe("username=octocat&theme=dracula&contrib_colors=111111%2C222222%2C333333%2C444444%2C555555&hide_current_streak=true");
    expect(parseCardOptions("streak", new URLSearchParams(q))).toEqual(o);
    expect(cardQuery("stats", "octocat", defaultCardOptions("stats"))).toBe("username=octocat");
  });

  it("maps visible stat rows to hide/show", () => {
    const rows = visibleStatRows(["prs"], ["followers"]);
    expect(rows).toContain("followers");
    expect(rows).not.toContain("prs");
    expect(rowsToHideShow(rows)).toEqual({ hide: ["prs"], show: ["followers"] });
  });

  it("validates usernames", () => {
    expect(isValidUsername("datwalkerv")).toBe(true);
    expect(isValidUsername("a-b")).toBe(true);
    expect(isValidUsername("-bad")).toBe(false);
    expect(isValidUsername("bad--name")).toBe(false);
    expect(isValidUsername("x".repeat(40))).toBe(false);
    expect(isValidUsername("<script>")).toBe(false);
  });
});
