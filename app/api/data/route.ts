import { isValidUsername } from "@/lib/config";
import { getUserBundle } from "@/lib/github/bundle";
import { describeError, isGitHubError } from "@/lib/github/errors";

export const maxDuration = 30;

/** JSON bundle for the generator UI: lets the browser render every card locally. */
export async function GET(request: Request) {
  const username = new URL(request.url).searchParams.get("username")?.trim();
  if (!isValidUsername(username)) {
    return Response.json({ error: { code: "bad_request", message: "Invalid GitHub username" } }, { status: 400 });
  }
  try {
    const bundle = await getUserBundle(username);
    return Response.json(bundle, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=1800, stale-while-revalidate=3600" },
    });
  } catch (e) {
    const status = isGitHubError(e) ? (e.code === "not_found" ? 404 : e.code === "rate_limited" ? 429 : 502) : 500;
    const { title, message } = describeError(e);
    return Response.json(
      { error: { code: isGitHubError(e) ? e.code : "internal", title, message } },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
