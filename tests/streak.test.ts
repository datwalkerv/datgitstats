import { describe, expect, it } from "vitest";
import { computeStreaks } from "@/lib/utils/streak-calc";
import { days } from "./fixtures";

describe("computeStreaks", () => {
  it("handles an empty calendar", () => {
    const s = computeStreaks([], "daily", "2025-01-10");
    expect(s.total).toBe(0);
    expect(s.current.length).toBe(0);
    expect(s.longest.length).toBe(0);
  });

  it("finds current and longest streaks", () => {
    const s = computeStreaks(days("2025-01-01", [1, 1, 0, 1, 1, 1, 0, 2, 2]), "daily", "2025-01-09");
    expect(s.total).toBe(9);
    expect(s.longest).toEqual({ length: 3, start: "2025-01-04", end: "2025-01-06" });
    expect(s.current).toEqual({ length: 2, start: "2025-01-08", end: "2025-01-09" });
  });

  it("does not break the current streak when today has no contributions yet", () => {
    const s = computeStreaks(days("2025-01-01", [1, 1, 1, 0]), "daily", "2025-01-04");
    expect(s.current.length).toBe(3);
  });

  it("breaks the streak after a full missed day", () => {
    const s = computeStreaks(days("2025-01-01", [1, 1, 0, 0]), "daily", "2025-01-04");
    expect(s.current.length).toBe(0);
    expect(s.longest.length).toBe(2);
  });

  it("fills gaps in sparse input and crosses leap days", () => {
    const input = [
      { date: "2024-02-28", count: 1, level: 1 as const },
      { date: "2024-02-29", count: 1, level: 1 as const },
      { date: "2024-03-01", count: 1, level: 1 as const },
      { date: "2024-03-05", count: 1, level: 1 as const },
    ];
    const s = computeStreaks(input, "daily", "2024-03-05");
    expect(s.longest).toEqual({ length: 3, start: "2024-02-28", end: "2024-03-01" });
    expect(s.current.length).toBe(1);
  });

  it("counts weekly streaks", () => {
    // 2025-01-06 is a Monday.
    const input = [
      { date: "2025-01-06", count: 1, level: 1 as const },
      { date: "2025-01-15", count: 1, level: 1 as const },
      { date: "2025-01-20", count: 1, level: 1 as const },
    ];
    const s = computeStreaks(input, "weekly", "2025-01-22");
    expect(s.current.length).toBe(3);
    expect(s.current.start).toBe("2025-01-06");
  });
});
