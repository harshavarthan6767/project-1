# Music Personality App

Discover your music DNA — a Spotify Wrapped-style personality analyzer that reveals your listening archetype, music traits, and creates a shareable personality card.

## How It Works

1. **Connect Spotify** — OAuth login with `user-top-read` scope
2. **Analyze** — Fetches your top artists, tracks, and audio features
3. **Reveal** — See your listening archetype, trait breakdown, and genre landscape
4. **Share** — Screenshot your personality card and share with friends

## Setup

1. Create a Spotify app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Add `http://localhost:3000/api/auth/callback` as a Redirect URI
3. Copy `.env.example` to `.env.local` and fill in your credentials
4. Run the dev server:

```bash
npm install
npm run dev
```

## Archetypes

- The Curator — Hidden gem hunter
- The Party Starter — High energy, dance floor ready
- Late Night Feels — Deeply emotional listener
- The Hype Beast — Maximum intensity
- The Classic Soul — Timeless taste
- The Explorer — Genre-hopping discoverer
- The Devoted Stan — Deep artist loyalty
- Chill Vibes Only — Calm and collected

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS v4
- Spotify Web API
- Server-side OAuth with httpOnly cookies

## License

MIT
