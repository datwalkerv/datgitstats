import { describe, expect, it } from "vitest";
import { computeTopLanguages, type LanguageOptions } from "@/lib/utils/languages";
import { bundle } from "./fixtures";

const base: LanguageOptions = {
  method: "bytes", sizeWeight: 1, countWeight: 0, includeForks: false, includeArchived: true,
  excludeRepos: [], hide: [], count: 10, showOther: false,
};

describe("computeTopLanguages", () => {
  const { repos } = bundle();

  it("aggregates bytes and skips forks by default", () => {
    const langs = computeTopLanguages(repos, base);
    expect(langs.map((l) => l.name)).toEqual(["TypeScript", "CSS", "Rust"]);
    expect(langs[0].percent).toBeCloseTo(66.67, 1);
    expect(langs.reduce((s, l) => s + l.percent, 0)).toBeCloseTo(100);
  });

  it("respects forks, archived, excluded repos and hidden languages", () => {
    expect(computeTopLanguages(repos, { ...base, includeForks: true })[0].name).toBe("Go");
    expect(computeTopLanguages(repos, { ...base, includeArchived: false }).map((l) => l.name)).toEqual(["TypeScript", "CSS"]);
    expect(computeTopLanguages(repos, { ...base, excludeRepos: ["A"] }).map((l) => l.name)).toEqual(["CSS", "Rust"]);
    expect(computeTopLanguages(repos, { ...base, hide: ["typescript"] })[0].name).toBe("CSS");
  });

  it("supports repo-count and weighted methods", () => {
    expect(computeTopLanguages(repos, { ...base, method: "repos" })[0]).toMatchObject({ name: "CSS", repos: 2 });
    const w = computeTopLanguages(repos, { ...base, method: "weighted", sizeWeight: 0, countWeight: 1 });
    expect(w[0].name).toBe("CSS");
  });

  it("groups the remainder as Other", () => {
    const langs = computeTopLanguages(repos, { ...base, count: 1, showOther: true });
    expect(langs.map((l) => l.name)).toEqual(["TypeScript", "Other"]);
    expect(langs[1].percent).toBeCloseTo(33.33, 1);
  });

  it("uses fallback colors", () => {
    const css = computeTopLanguages(repos, base).find((l) => l.name === "CSS");
    expect(css?.color).toBe("#663399");
  });
});
