import { NextRequest, NextResponse } from "next/server";
import {
  getTopArtists,
  getTopTracks,
  getAudioFeatures,
  getArtist,
  getRelatedArtists,
  getUserProfile,
  refreshAccessToken,
} from "@/lib/spotify";
import { analyzeMusicProfile } from "@/lib/analysis";

async function fetchWithRetry(token: string, refreshToken: string) {
  // Try existing token first
  try {
    const [artists, tracks] = await Promise.all([
      getTopArtists(token, "medium_term"),
      getTopTracks(token, "medium_term"),
    ]);
    return { artists, tracks, token };
  } catch (err) {
    // If 401, try refreshing the token
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("401")) {
      const newTokens = await refreshAccessToken(refreshToken);
      const [artists, tracks] = await Promise.all([
        getTopArtists(newTokens.access_token, "medium_term"),
        getTopTracks(newTokens.access_token, "medium_term"),
      ]);
      return { artists, tracks, token: newTokens.access_token };
    }
    throw err;
  }
}

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("spotify_access_token")?.value;
  const rt = request.cookies.get("spotify_refresh_token")?.value;

  if (!accessToken || !rt) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { artists, tracks, token } = await fetchWithRetry(accessToken, rt);

    if (!artists.length || !tracks.length) {
      return NextResponse.json(
        { error: "Not enough listening data. Try listening to more music on Spotify first!" },
        { status: 400 },
      );
    }

    // Enrich artists without genres — try individual endpoint first, then related artists
    const genreless = artists.filter((a) => !a.genres || a.genres.length === 0);
    if (genreless.length > 0) {
      const enriched = await Promise.all(
        genreless.slice(0, 15).map(async (artist) => {
          try {
            // Try individual artist endpoint first (often has genres list endpoint doesn't)
            const single = await getArtist(token, artist.id);
            if (single.genres && single.genres.length > 0) {
              return { ...artist, genres: single.genres };
            }
            // Fall back to related artists
            const related = await getRelatedArtists(token, artist.id);
            const genreSet = new Set<string>();
            related.forEach((r) => (r.genres || []).forEach((g) => genreSet.add(g)));
            return { ...artist, genres: [...genreSet].slice(0, 5) };
          } catch {
            return artist;
          }
        }),
      );
      const enrichedMap = new Map(enriched.map((a) => [a.id, a]));
      for (let i = 0; i < artists.length; i++) {
        if (enrichedMap.has(artists[i].id)) {
          artists[i] = enrichedMap.get(artists[i].id)!;
        }
      }
    }

    // Audio features — optional, don't fail if unavailable
    const trackIds = tracks.map((t) => t.id);
    let features: Awaited<ReturnType<typeof getAudioFeatures>> = [];
    try {
      features = await getAudioFeatures(token, trackIds);
    } catch {
      // Non-fatal — analysis falls back to genre estimates
    }

    // If genres are still empty after Spotify enrichment, generate data-driven categories
    let aiGenres: { name: string; count: number }[] | null = null;
    const stillGenreless = artists.some((a) => !a.genres || a.genres.length === 0);
    if (stillGenreless) {
      // Try AI first if key available
      if (process.env.ANTHROPIC_API_KEY) {
        try {
          const names = artists.map((a) => a.name).join(", ");
          const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.ANTHROPIC_API_KEY,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 300,
              messages: [{
                role: "user",
                content: `You are a music genre expert. Given this list of artists, categorize them into 6-8 genre buckets.\n\nArtists: ${names}\n\nReply ONLY with valid JSON, no explanation, no markdown:\n[{"name": "Genre Name", "count": N}, ...]\n\nRules:\n- count = number of artists that fit that genre\n- Use specific genre names (e.g. "Tamil Pop", "K-Pop", "Afrobeats", "Drill") not vague ones\n- Every artist must be counted in exactly one genre\n- Max 8 genres`,
              }],
            }),
          });
          const aiData = await aiRes.json();
          const text = aiData.content?.[0]?.text ?? "[]";
          aiGenres = JSON.parse(text).filter((g: { name: string; count: number }) => g.count > 0);
        } catch { /* will use data-driven fallback below */ }
      }

      // Data-driven fallback: categorize by actual listening patterns
      if (!aiGenres || aiGenres.length === 0) {
        const genreMap = new Map<string, number>();

        artists.forEach((a) => {
          const pop = a.popularity ?? 50;
          let cat: string;
          if (pop >= 70) cat = "Mainstream Favorites";
          else if (pop >= 40) cat = "Rising & Established";
          else cat = "Underground Picks";
          genreMap.set(cat, (genreMap.get(cat) || 0) + 1);
        });

        // Add decade-based categories
        const decadeMap = new Map<string, number>();
        tracks.forEach((t) => {
          const y = parseInt((t.album?.release_date || "2020").substring(0, 4));
          if (isNaN(y)) return;
          let era: string;
          if (y >= 2020) era = "2020s Current";
          else if (y >= 2010) era = "2010s Era";
          else if (y >= 2000) era = "2000s Classics";
          else era = "Pre-2000s Legends";
          decadeMap.set(era, (decadeMap.get(era) || 0) + 1);
        });

        // Merge both categorizations
        aiGenres = [
          ...Array.from(genreMap.entries()).map(([name, count]) => ({ name, count })),
          ...Array.from(decadeMap.entries()).map(([name, count]) => ({ name, count: Math.round(count / 5) })),
        ].sort((a, b) => b.count - a.count).slice(0, 8);
      }
    }

    // Get user display name
    let userName = "";
    try {
      const profile = await getUserProfile(token);
      userName = profile.display_name || "";
    } catch { /* non-critical */ }

    const result = analyzeMusicProfile(artists, tracks, features);
    return NextResponse.json({ ...result, userName, aiGenres });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
