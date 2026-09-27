import { renderStatsCard } from "@/lib/generators/stats";
import { getProfile, getUserStats } from "@/lib/github/bundle";
import { svgRoute } from "@/lib/server/svg-response";

export const maxDuration = 30;

export function GET(request: Request) {
  return svgRoute(request, "stats", async (username, options) => {
    const [profile, stats] = await Promise.all([getProfile(username), getUserStats(username)]);
    return renderStatsCard({ profile, stats }, options);
  });
}
