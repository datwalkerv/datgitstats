import { renderTopLangsCard } from "@/lib/generators/top-langs";
import { getRepositories } from "@/lib/github/bundle";
import { svgRoute } from "@/lib/server/svg-response";

export const maxDuration = 30;

export function GET(request: Request) {
  return svgRoute(request, "top-langs", async (username, options) => {
    const { repos, approximate } = await getRepositories(username);
    return renderTopLangsCard({ repos, approximate }, options);
  });
}
