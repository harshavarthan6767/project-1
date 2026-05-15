import { NextRequest, NextResponse } from "next/server";
import {
  getTopArtists,
  getTopTracks,
  getAudioFeatures,
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

    // Audio features — optional, don't fail if unavailable
    const trackIds = tracks.map((t) => t.id);
    let features: Awaited<ReturnType<typeof getAudioFeatures>> = [];
    try {
      features = await getAudioFeatures(token, trackIds);
    } catch {
      // Non-fatal — analysis falls back to genre estimates
    }

    const result = analyzeMusicProfile(artists, tracks, features);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
