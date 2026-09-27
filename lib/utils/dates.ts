export const DAY_MS = 86_400_000;

export function todayUTC(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function addDays(date: string, n: number): string {
  return new Date(Date.parse(date + "T00:00:00Z") + n * DAY_MS).toISOString().slice(0, 10);
}

export function diffDays(a: string, b: string): number {
  return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / DAY_MS);
}

/** Monday-based ISO week start for a YYYY-MM-DD date. */
export function weekStart(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  const dow = (d.getUTCDay() + 6) % 7;
  return addDays(date, -dow);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(date: string, format: "short" | "iso", withYear = true): string {
  if (format === "iso") return date;
  const [y, m, d] = date.split("-").map(Number);
  return withYear ? `${MONTHS[m - 1]} ${d}, ${y}` : `${MONTHS[m - 1]} ${d}`;
}

export function accountAge(createdAt: string, now = new Date()): { years: number; days: number; label: string } {
  const days = Math.max(0, Math.floor((now.getTime() - Date.parse(createdAt)) / DAY_MS));
  const years = days / 365.25;
  const label = years >= 1 ? `${Math.floor(years)} yr${Math.floor(years) === 1 ? "" : "s"}` : `${days} days`;
  return { years, days, label };
}
