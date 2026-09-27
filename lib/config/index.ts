import { defaultsOf, encodeFields, parseFields, type ValuesOf } from "./fields";
import { statsFields } from "./stats";
import { topLangsFields } from "./top-langs";
import { streakFields } from "./streak";
import { commonFields } from "./common";

export const CARD_TYPES = ["stats", "top-langs", "streak"] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const CARD_FIELDS = {
  stats: statsFields,
  "top-langs": topLangsFields,
  streak: streakFields,
} as const;

export type StatsOptions = ValuesOf<typeof statsFields>;
export type TopLangsOptions = ValuesOf<typeof topLangsFields>;
export type StreakOptions = ValuesOf<typeof streakFields>;
export interface CardOptionsMap {
  stats: StatsOptions;
  "top-langs": TopLangsOptions;
  streak: StreakOptions;
}
export type CommonOptions = ValuesOf<typeof commonFields>;

export const CARD_LABELS: Record<CardType, string> = {
  stats: "GitHub Stats",
  "top-langs": "Top Languages",
  streak: "GitHub Streak",
};

export const API_PATHS: Record<CardType, string> = {
  stats: "/api/stats",
  "top-langs": "/api/top-langs",
  streak: "/api/streak",
};

const USERNAME = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export function isValidUsername(u: string | null | undefined): u is string {
  return !!u && USERNAME.test(u);
}

export function parseCardOptions<T extends CardType>(
  type: T,
  source: URLSearchParams | Record<string, string | string[] | undefined>,
): CardOptionsMap[T] {
  return parseFields(CARD_FIELDS[type], source) as CardOptionsMap[T];
}

export function defaultCardOptions<T extends CardType>(type: T): CardOptionsMap[T] {
  return defaultsOf(CARD_FIELDS[type]) as CardOptionsMap[T];
}

export function cardQuery<T extends CardType>(type: T, username: string, options: Partial<CardOptionsMap[T]>) {
  const params = new URLSearchParams({ username });
  encodeFields(CARD_FIELDS[type], options as never, params);
  return params.toString();
}

export function cardUrl<T extends CardType>(
  origin: string,
  type: T,
  username: string,
  options: Partial<CardOptionsMap[T]>,
) {
  return `${origin}${API_PATHS[type]}?${cardQuery(type, username, options)}`;
}

export { encodeFields, parseFields };
