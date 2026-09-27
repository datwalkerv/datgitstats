import {
  CARD_TYPES,
  cardQuery,
  defaultCardOptions,
  isValidUsername,
  parseCardOptions,
  type CardOptionsMap,
  type CardType,
} from "@/lib/config";
import { encodeFields } from "@/lib/config/fields";
import { commonFields } from "@/lib/config/common";
import { CARD_FIELDS } from "@/lib/config";

export type AllOptions = { [K in CardType]: CardOptionsMap[K] };

export interface GeneratorState {
  username: string | null;
  type: CardType;
  options: AllOptions;
}

/** Options that are shared across all cards when "sync appearance" is on. */
export const APPEARANCE_KEYS = [
  "theme", "hide_border", "border_radius", "bg_opacity", "font", "font_size", "padding", "animate", "show_icons",
  "bg_color", "text_color", "title_color", "icon_color", "border_color", "accent_color", "ring_color", "muted_color",
  "contrib_colors",
] as const satisfies readonly (keyof typeof commonFields)[];

export const COLOR_KEYS = [
  "bg_color", "text_color", "title_color", "icon_color", "border_color", "accent_color", "ring_color", "muted_color",
] as const;
export type ColorKey = (typeof COLOR_KEYS)[number];

export function defaultAllOptions(): AllOptions {
  return {
    stats: defaultCardOptions("stats"),
    "top-langs": defaultCardOptions("top-langs"),
    streak: defaultCardOptions("streak"),
  };
}

type Source = URLSearchParams | Record<string, string | string[] | undefined>;

function get(source: Source, key: string): string | undefined {
  if (source instanceof URLSearchParams) return source.get(key) ?? undefined;
  const v = source[key];
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Generator URLs look like `/generate?username=x&type=stats&theme=dracula&streak=hide_current_streak%3Dtrue`:
 * the active card's options are flat, other cards' non-default options are nested per card type.
 */
export function parseGeneratorState(source: Source): GeneratorState {
  const typeRaw = get(source, "type");
  const type = (CARD_TYPES as readonly string[]).includes(typeRaw ?? "") ? (typeRaw as CardType) : "stats";
  const username = get(source, "username")?.trim() ?? null;
  const options = defaultAllOptions() as Record<CardType, unknown>;
  for (const t of CARD_TYPES) {
    const nested = get(source, t);
    if (t === type) {
      const flat = source instanceof URLSearchParams ? source : new URLSearchParams(
        Object.entries(source).flatMap(([k, v]) => (v === undefined ? [] : [[k, Array.isArray(v) ? v[0] : v]])),
      );
      options[t] = parseCardOptions(t, flat);
    } else if (nested) {
      options[t] = parseCardOptions(t, new URLSearchParams(nested));
    }
  }
  return { username: isValidUsername(username) ? username : null, type, options: options as AllOptions };
}

export function generatorQuery(state: GeneratorState): string {
  const params = new URLSearchParams();
  if (state.username) params.set("username", state.username);
  params.set("type", state.type);
  encodeFields(CARD_FIELDS[state.type], state.options[state.type] as never, params);
  for (const t of CARD_TYPES) {
    if (t === state.type) continue;
    const nested = encodeFields(CARD_FIELDS[t], state.options[t] as never).toString();
    if (nested) params.set(t, nested);
  }
  return params.toString();
}

export function cardImageUrl<T extends CardType>(origin: string, type: T, username: string, options: CardOptionsMap[T]) {
  const path = type === "stats" ? "/api/stats" : type === "top-langs" ? "/api/top-langs" : "/api/streak";
  return `${origin}${path}?${cardQuery(type, username, options)}`;
}
