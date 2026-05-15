import { NextRequest, NextResponse } from "next/server";
import { getTopArtists, getTopTracks, getAudioFeatures, refreshAccessToken } from "@/lib/spotify";
import { analyzeMusicProfile } from "@/lib/analysis";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("spotify_access_token")?.value;
  const refreshToken = request.cookies.get("spotify_refresh_token")?.value;
  const expiresAt = request.cookies.get("spotify_expires_at")?.value;

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let token = accessToken;

  // Refresh if expired
  if (expiresAt && Date.now() > parseInt(expiresAt) - 60000) {
    try {
      const newTokens = await refreshAccessToken(refreshToken);
      token = newTokens.access_token;
    } catch {
      return NextResponse.json({ error: "Failed to refresh token" }, { status: 401 });
    }
  }

  try {
    const [artists, tracks] = await Promise.all([
      getTopArtists(token, "medium_term"),
      getTopTracks(token, "medium_term"),
    ]);

    const trackIds = tracks.map((t) => t.id);
    const features = await getAudioFeatures(token, trackIds);

    const result = analyzeMusicProfile(artists, tracks, features);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
