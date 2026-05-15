import { NextRequest, NextResponse } from "next/server";
import {
  getTopArtists,
  getTopTracks,
  getAudioFeatures,
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

    // Enrich artists without genres by fetching related artists
    const genreless = artists.filter((a) => !a.genres || a.genres.length === 0);
    if (genreless.length > 0) {
      const enriched = await Promise.all(
        genreless.slice(0, 10).map(async (artist) => {
          try {
            const related = await getRelatedArtists(token, artist.id);
            const genreSet = new Set<string>();
            related.forEach((r) => (r.genres || []).forEach((g) => genreSet.add(g)));
            return { ...artist, genres: [...genreSet].slice(0, 5) };
          } catch {
            return artist;
          }
        }),
      );
      // Merge enriched artists back
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
