# Music Personality App

**Spotify Wrapped-style personality analyzer** — connect your Spotify to discover your music DNA, listening archetype, and a shareable personality card.

🔗 **Live:** [music-personality-app-ten.vercel.app](https://music-personality-app-ten.vercel.app)

---

## What It Does

1. **Connect Spotify** — OAuth with `user-top-read` scope, no data stored
2. **Analyze** — Fetches your top 50 artists & tracks, computes 6 personality traits
3. **Reveal** — Your listening archetype, mood spectrum, genre landscape, and vibe check
4. **Share** — Download a premium shareable card or save as Spotify playlist

## Archetypes (8 types)

| Archetype | Description |
|-----------|-------------|
| **The Curator** | Hidden gem hunter — underground, eclectic, tastemaker |
| **The Energy** | High BPM, dance floor ready, aux cord final boss |
| **The Feels** | Deep emotional listener, 2AM playlist curator |
| **The Hype** | Maximum intensity, all gas no brakes |
| **The Timeless** | Classic soul, golden era enthusiast |
| **The Explorer** | Genre nomad, algorithm breaker |
| **The Devoted** | Ride or die stan, deep catalog diver |
| **The Low Key** | Chill vibes only, zen master |

## Tech Stack

- **Framework:** Next.js 16 + TypeScript
- **Styling:** Tailwind CSS v4
- **Auth:** Spotify OAuth (server-side, httpOnly cookies)
- **Analysis:** Euclidean distance archetype matching, genre-based audio feature estimation
- **AI:** Optional genre inference via OpenRouter (Gemini Flash, free tier)
- **Export:** html-to-image (retina PNG)
- **Hosting:** Vercel

## Quick Start

```bash
git clone https://github.com/harshavarthan6767/project-1.git
cd project-1
npm install
cp .env.example .env.local
# Add your Spotify Client ID & Secret from https://developer.spotify.com/dashboard
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SPOTIFY_CLIENT_ID` | Yes | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | Yes | Spotify app client secret |
| `SPOTIFY_REDIRECT_URI` | Yes | OAuth callback URL |
| `NEXT_PUBLIC_APP_URL` | Yes | App base URL |
| `OPENROUTER_API_KEY` | No | Free AI genre inference |
| `GEMINI_API_KEY` | No | Alternative free AI |
| `ANTHROPIC_API_KEY` | No | Alternative AI |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Design tokens, animations
│   ├── loading/page.tsx            # Analysis loading screen
│   ├── results/page.tsx            # Results showcase
│   └── api/
│       ├── auth/login/route.ts     # Spotify OAuth redirect
│       ├── auth/callback/route.ts  # OAuth callback
│       └── spotify/route.ts        # Data fetch + analysis
├── lib/
│   ├── analysis.ts                 # Personality engine
│   ├── archetypes.ts               # 8 archetypes, 6 traits
│   ├── slang.ts                    # Era-based Gen Z slang
│   ├── spotify.ts                  # Spotify API client
│   └── useScrollReveal.ts          # Scroll animation hook
└── components/
    ├── PersonalityCard.tsx          # Shareable card
    └── GenreRing.tsx               # Interactive SVG donut
```

## License

MIT
