<div align="center">

<img src="./app/icon.svg" width="10%" alt="datgitstats" style="border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);" />

# datgitstats

**GitHub stats, your way.**

Build your GitHub stats, top languages and streak cards in one place, then paste a single URL into your README.

</div>

## ✨ Key Features

- **📊 Three Generators, One App**: GitHub Stats, Top Languages and GitHub Streak share one theme system, one set of options and one URL format.
- **👀 Live Preview**: The browser runs the same SVG renderer as the API, so the preview is exactly what your README will show. It updates as you type.
- **🎨 26 Themes & Custom Palettes**: Start from GitHub Dark, Dracula, Nord, Tokyo Night, Catppuccin, Gruvbox and more. You can change any of the nine colors, including the contribution scale, and save your own themes in the browser.
- **🍩 Five Language Layouts**: Bars, compact, donut, pie or percentage bars. Rank languages by code size, repository count or a weighted mix, and hide forks, archived repos or specific languages.
- **🔥 Streak Tracking**: See your current streak, longest streak and total contributions, counted in days or weeks, with an optional contribution heat strip.
- **🔗 Everything Is a URL**: Every setting is a query parameter. A share link restores the full setup of all three cards.
- **🛟 Never a Broken Image**: Bad usernames, rate limits and GitHub outages return a themed error card instead of a broken image.
- **🌟 Premium Minimal UI**: A dark, neutral interface with thin borders, careful typography and a mobile settings drawer. It supports keyboard navigation, screen readers and reduced motion.

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Runtime & View Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components on [Base UI](https://base-ui.com/)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/) and [Zod](https://zod.dev/)
- **Data**: [GitHub GraphQL & REST APIs](https://docs.github.com/en/graphql), no database
- **Rendering**: Hand-built SVG, with no charting library or headless browser
- **Testing**: [Vitest](https://vitest.dev/)
- **Icons**: [Lucide React](https://lucide.dev/) and [Octicons](https://primer.style/octicons/)
- **Fonts**: [Geist & Geist Mono](https://vercel.com/font), self-hosted

## 🔌 API

Each endpoint returns an `image/svg+xml` image that you can embed directly in a README:

| Endpoint | Card |
| --- | --- |
| `/api/stats?username=octocat` | GitHub Stats |
| `/api/top-langs?username=octocat` | Top Languages |
| `/api/streak?username=octocat` | GitHub Streak |

```md
![GitHub Stats](https://datgitstats.vercel.app/api/stats?username=octocat&theme=dracula&hide_border=true)
![Top Languages](https://datgitstats.vercel.app/api/top-langs?username=octocat&layout=donut&langs_count=8)
![GitHub Streak](https://datgitstats.vercel.app/api/streak?username=octocat&theme=nord&show_graph=true)
```

The homepage has the full parameter reference. It is generated from the same schemas the API uses, so it stays in sync with the code. If a parameter value is invalid, the API uses the default instead of failing.

## ⚡ Performance & Reliability

### Caching
- Simultaneous requests for the same user are merged into a single GitHub call.
- Data is cached in memory and in the Next.js data cache, which is shared by all serverless instances.
- If GitHub fails, the last good data is served instead.
- Cards are sent with CDN-friendly `Cache-Control` headers, so GitHub's image proxy and Vercel's edge cache serve most requests.


<br>

**Made with love for developers. 💜**  
*GitHub stats, your way.*
