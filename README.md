# datgitstats

A self-hostable replacement for **GitHub Readme Stats**, **Top Languages** and **GitHub Streak Stats**, in one Next.js app.
You enter a username, customize each card with a live preview, and paste a permanent URL into your README.

The app fetches GitHub data and renders the SVG cards itself. It does not proxy the existing services.

```md
![GitHub Stats](https://your-domain.com/api/stats?username=octocat&theme=dracula)
![Top Languages](https://your-domain.com/api/top-langs?username=octocat&layout=donut)
![GitHub Streak](https://your-domain.com/api/streak?username=octocat&theme=nord)
```

## Features

- **Three generators:** stats (with rank), top languages (5 layouts) and contribution streaks (daily or weekly, with an optional heat strip).
- **26 built-in themes**, per-color overrides and custom themes saved in `localStorage`.
- **Every option is a URL parameter.** The generator's share link (`/generate?username=…&type=…`) restores the full configuration of all three cards.
- **Pixel-identical live preview.** The browser runs the same pure SVG renderer as the API.
- **Never a broken image.** Every failure returns a themed error SVG with HTTP 200 and a short cache time.
- **Built for README traffic:** in-flight request deduplication, an in-memory LRU with stale-on-error, the Next.js data cache (shared across serverless instances) and CDN-friendly `Cache-Control` headers.

## API

| Endpoint | Returns |
| --- | --- |
| `GET /api/stats?username=` | Stats card SVG |
| `GET /api/top-langs?username=` | Top languages SVG |
| `GET /api/streak?username=` | Streak SVG |
| `GET /api/data?username=` | JSON bundle used by the generator UI |
| `GET /api/demo?card=stats\|top-langs\|streak` | Sample card rendered from demo data |

The homepage has the full parameter reference, generated from the same schemas the API uses (`lib/config/*`).
Invalid parameter values fall back to their defaults.

## Development

```bash
pnpm install
cp .env.example .env.local   # optional: add GITHUB_TOKEN
pnpm dev
pnpm test                    # vitest: streaks, languages, config round-trips, SVG output
pnpm typecheck && pnpm lint
```

## Deploying to Vercel

1. Import the repository in Vercel. No build settings are needed.
2. Optional: set `GITHUB_TOKEN`. A token without scopes is enough for public data.
3. Optional: set `NEXT_PUBLIC_SITE_URL` if you serve the app from a custom domain.

## How data is fetched

`lib/github/` hides where the data comes from:

| Data | With `GITHUB_TOKEN` | Without a token |
| --- | --- | --- |
| Profile, counts | One GraphQL query | REST `/users/:u` + Search API |
| Repositories and languages | GraphQL, exact bytes per language | REST repos; repo size assigned to the primary language (approximate) |
| Contribution calendar | One aliased GraphQL query per 4 years | Public `github.com/users/:u/contributions` HTML |

`getContributionData(username)` is the single entry point for the contribution calendar, so you can swap its implementation without touching the cards.
If a token is rejected or rate-limited, requests fall back to the public implementation.

## Project structure

```
app/            pages (/, /generate) and route handlers (/api/*)
components/     generator UI, home sections, theme gallery, shadcn/ui primitives
lib/config/     URL parameter schemas (parse, encode, docs)
lib/generators/ pure SVG renderers (server + browser)
lib/github/     GitHub data access (GraphQL / REST / HTML), errors, token rotation
lib/cache/      dedup + LRU + Next data cache, HTTP cache headers
lib/themes/     built-in themes
lib/utils/      streak math, language aggregation, rank, dates, formatting
tests/          vitest
```
