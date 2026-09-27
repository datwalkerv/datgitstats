import type { CardOptionsMap, CardType } from "@/lib/config";
import type { UserBundle } from "@/types/github";
import { renderStatsCard } from "./stats";
import { renderStreakCard } from "./streak";
import { renderTopLangsCard } from "./top-langs";

export { renderStatsCard, renderStreakCard, renderTopLangsCard };
export { renderErrorCard } from "./error";

/** Renders any card from a full data bundle. Used by the client preview and theme gallery. */
export function renderCard<T extends CardType>(type: T, bundle: UserBundle, options: CardOptionsMap[T]): string {
  switch (type) {
    case "stats":
      return renderStatsCard({ profile: bundle.profile, stats: bundle.stats }, options as CardOptionsMap["stats"]);
    case "top-langs":
      return renderTopLangsCard(
        { repos: bundle.repos, approximate: bundle.languagesApproximate },
        options as CardOptionsMap["top-langs"],
      );
    default:
      return renderStreakCard(
        { login: bundle.profile.login, name: bundle.profile.name, contributions: bundle.contributions },
        options as CardOptionsMap["streak"],
      );
  }
}

export function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
