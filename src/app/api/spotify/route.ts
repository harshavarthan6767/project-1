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

    // If genres are still empty after enrichment, create sound-based categories
    const stillGenreless = artists.some((a) => !a.genres || a.genres.length === 0);
    if (stillGenreless) {
      const validFeats = features.filter((f) => f !== null && f.energy !== undefined);
      const hasAudio = validFeats.length > 0 &&
        validFeats.reduce((s, f) => s + f.energy, 0) / validFeats.length > 0.01;

      // Build sound-based genre labels from audio features or popularity
      const soundGenres: string[] = [];

      if (hasAudio) {
        const avgE = validFeats.reduce((s, f) => s + f.energy, 0) / validFeats.length;
        const avgD = validFeats.reduce((s, f) => s + f.danceability, 0) / validFeats.length;
        const avgV = validFeats.reduce((s, f) => s + f.valence, 0) / validFeats.length;
        const avgA = validFeats.reduce((s, f) => s + f.acousticness, 0) / validFeats.length;
        const avgT = validFeats.reduce((s, f) => s + f.tempo, 0) / validFeats.length;

        if (avgE > 0.7 && avgD > 0.6) soundGenres.push("Party Anthems");
        else if (avgE > 0.7) soundGenres.push("High Energy");
        else if (avgE < 0.35 && avgA > 0.5) soundGenres.push("Acoustic Sessions");
        else if (avgE < 0.35) soundGenres.push("Downtempo");

        if (avgV > 0.7) soundGenres.push("Feel Good Hits");
        else if (avgV < 0.3) soundGenres.push("Moody & Deep");

        if (avgT > 130) soundGenres.push("Fast Paced");
        else if (avgT < 90) soundGenres.push("Slow Jams");
        else soundGenres.push("Mid Tempo");

        if (avgD > 0.7) soundGenres.push("Dance Floor Ready");
        if (avgA > 0.6) soundGenres.push("Stripped Down");
      }

      // Add popularity-based categories
      const avgPop = artists.reduce((s, a) => s + (a.popularity ?? 50), 0) / artists.length;
      if (avgPop < 40) soundGenres.push("Underground Picks");
      else if (avgPop > 70) soundGenres.push("Mainstream Hits");
      else soundGenres.push("Rising Stars");

      // Add decade category
      const years = tracks.map((t) => parseInt((t.album?.release_date || "2020").substring(0, 4))).filter((y) => !isNaN(y));
      const avgYear = years.length > 0 ? years.reduce((s, y) => s + y, 0) / years.length : 2020;
      if (avgYear < 2000) soundGenres.push("Classic Era");
      else if (avgYear < 2015) soundGenres.push("2000s & 2010s");
      else soundGenres.push("Current Era");

      // Spread these sound genres across artists
      if (soundGenres.length > 0) {
        for (let i = 0; i < artists.length; i++) {
          if (!artists[i].genres || artists[i].genres.length === 0) {
            // Each artist gets 2-3 sound genres
            const start = (i * 2) % soundGenres.length;
            artists[i].genres = [
              soundGenres[start],
              soundGenres[(start + 1) % soundGenres.length],
            ];
          }
        }
      }
    }

    // Get user display name
    let userName = "";
    try {
      const profile = await getUserProfile(token);
      userName = profile.display_name || "";
    } catch { /* non-critical */ }

    const result = analyzeMusicProfile(artists, tracks, features);
    return NextResponse.json({ ...result, userName });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
