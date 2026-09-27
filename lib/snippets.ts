import { CARD_LABELS, CARD_TYPES, type CardType } from "@/lib/config";
import { cardImageUrl, type AllOptions } from "@/lib/generator-state";

export function markdownSnippet(type: CardType, url: string, username: string) {
  return `[![${CARD_LABELS[type]}](${url})](https://github.com/${username})`;
}

export function htmlSnippet(type: CardType, url: string, username: string) {
  return `<a href="https://github.com/${username}"><img src="${url.replace(/&/g, "&amp;")}" alt="${CARD_LABELS[type]}" /></a>`;
}

export function readmeSection(origin: string, username: string, options: AllOptions, types: readonly CardType[] = CARD_TYPES) {
  const imgs = types
    .map((t) => `  <img src="${cardImageUrl(origin, t, username, options[t] as never).replace(/&/g, "&amp;")}" alt="${CARD_LABELS[t]}" />`)
    .join("\n");
  return `<p align="center">\n${imgs}\n</p>`;
}

export function readmeMarkdown(origin: string, username: string, options: AllOptions, types: readonly CardType[] = CARD_TYPES) {
  return types.map((t) => `![${CARD_LABELS[t]}](${cardImageUrl(origin, t, username, options[t] as never)})`).join("\n");
}
