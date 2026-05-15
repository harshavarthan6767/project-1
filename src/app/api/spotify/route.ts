import { NextRequest, NextResponse } from "next/server";
import { getTopArtists, getTopTracks, getAudioFeatures, refreshAccessToken } from "@/lib/spotify";
import { analyzeMusicProfile } from "@/lib/analysis";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("spotify_access_token")?.value;
  const refreshToken = request.cookies.get("spotify_refresh_token")?.value;

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let token = accessToken;

  // Always refresh token to be safe (tokens are short-lived)
  try {
    const newTokens = await refreshAccessToken(refreshToken);
    token = newTokens.access_token;
  } catch {
    // If refresh fails, try with existing token
    console.log("Token refresh failed, trying existing token");
  }

  try {
    const [artists, tracks] = await Promise.all([
      getTopArtists(token, "medium_term"),
      getTopTracks(token, "medium_term"),
    ]);

    if (!tracks.length) {
      return NextResponse.json({ error: "No top tracks found. Listen to more music on Spotify!" }, { status: 400 });
    }

    const trackIds = tracks.map((t) => t.id);
    let features: Awaited<ReturnType<typeof getAudioFeatures>> = [];
    try {
      features = await getAudioFeatures(token, trackIds);
    } catch {
      // Audio features may fail — continue without them
    }

    const result = analyzeMusicProfile(artists, tracks, features);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Spotify analysis error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
