export function formatNumber(n: number | null | undefined, style: "short" | "long" = "short"): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  if (style === "long" || Math.abs(n) < 1000) return Math.round(n).toLocaleString("en-US");
  const units = [
    { v: 1e9, s: "B" },
    { v: 1e6, s: "M" },
    { v: 1e3, s: "k" },
  ];
  for (const u of units) {
    if (Math.abs(n) >= u.v) {
      const x = n / u.v;
      return `${x >= 100 ? Math.round(x) : Math.round(x * 10) / 10}${u.s}`;
    }
  }
  return String(n);
}

export function formatPercent(p: number): string {
  if (p > 0 && p < 0.1) return "<0.1%";
  return `${p >= 10 ? p.toFixed(1) : p.toFixed(2)}%`;
}
