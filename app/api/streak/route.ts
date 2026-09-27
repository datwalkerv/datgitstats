import { renderStreakCard } from "@/lib/generators/streak";
import { getContributionData, getProfile } from "@/lib/github/bundle";
import { svgRoute } from "@/lib/server/svg-response";

export const maxDuration = 30;

export function GET(request: Request) {
  return svgRoute(request, "streak", async (username, options) => {
    const [profile, contributions] = await Promise.all([getProfile(username), getContributionData(username)]);
    return renderStreakCard({ login: profile.login, name: profile.name, contributions }, options);
  });
}
