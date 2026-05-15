# Reflection — Music Personality App

## What was easy

The Spotify OAuth flow was straightforward — server-side authorization code grant with httpOnly cookies worked reliably. The Next.js 16 App Router made API routes clean and the project structure stayed organized despite rapid iteration. The analysis engine (Euclidean distance archetype matching, trait computation from artist popularity and genre diversity) came together quickly because the math is simple and the data model is flat.

## What was difficult

**Spotify audio features API returning empty/zero data** — this was the hardest technical challenge. For many regional artists (especially Indian/Tamil music), Spotify's audio features endpoint returns objects with all-zero values. This broke the stat cards (showing 0% everywhere) and made the archetype detection unreliable. I tried filtering zero-values, then built a genre-based keyword estimator (180+ genre keywords mapped to energy/danceability/valence/tempo), then finally restructured the entire analysis to work primarily from guaranteed-available data (artist popularity, track count, release years).

**Genre data for regional artists** — Spotify simply doesn't tag genres for many Indian artists. I tried the individual artist endpoint, related artists endpoint, and even built an AI inference system using OpenRouter's free Gemini Flash model. None of these fully solved the problem for every artist. The final solution was a layered fallback: Spotify genres → AI inference → popularity/decade-based categories.

**Scroll performance** — the Intersection Observer-based scroll reveals caused text glitching. Removing the observers and switching to simple CSS animations fixed it. The scroll progress bar was also triggering React re-renders on every pixel — moved it to direct DOM manipulation.

## What I learned

- **Spotify's API has significant regional gaps** — genre and audio feature data is heavily biased toward Western/English-language music
- **Layered fallbacks are essential** — every data source can fail, especially external APIs. Having AI → keyword → popularity fallbacks kept the app functional for all users
- **DOM-based animations outperform React state for scroll** — `requestAnimationFrame` + direct DOM updates avoid the re-render cascade that causes jank
- **AI-powered genre inference works surprisingly well** — sending 50 artist names to Gemini Flash via OpenRouter costs nothing (free tier) and produces accurate genre labels for any region

## What I'd change with more time

- **Real audio features** — the genre-based estimates work but aren't as accurate as real Spotify audio analysis. A native audio analysis library (like Web Audio API + essentia.js) could compute energy/danceability/valence directly from track previews
- **One-tap native share** — using the Web Share API with a generated image blob instead of manual screenshot + download
- **More archetypes** — the current 8 types cover the major patterns but finer granularity (16+ types) would make results feel more personal
- **Demo mode** — a static demo experience so judges can see the app without connecting Spotify
- **Real-time playlist generation** — auto-create a Spotify playlist from the user's top tracks during the analysis flow
