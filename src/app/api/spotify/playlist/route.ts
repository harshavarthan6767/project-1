import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/spotify";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("spotify_access_token")?.value;
  const rt = request.cookies.get("spotify_refresh_token")?.value;

  if (!accessToken || !rt) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let token = accessToken;
  try {
    const newTokens = await refreshAccessToken(rt);
    token = newTokens.access_token;
  } catch { /* continue with existing token */ }

  try {
    const body = await request.json();
    const { trackIds, name } = body as { trackIds: string[]; name: string };

    if (!trackIds?.length) {
      return NextResponse.json({ error: "No tracks provided" }, { status: 400 });
    }

    // Create playlist
    const createRes = await fetch("https://api.spotify.com/v1/me/playlists", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name || "My Music Personality Playlist",
        description: "Created by musicpersonality.app — your listening personality revealed",
        public: false,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      return NextResponse.json({ error: `Failed to create playlist: ${err}` }, { status: createRes.status });
    }

    const playlist = await createRes.json();

    // Add tracks
    const uris = trackIds.map((id) => `spotify:track:${id}`);
    const addRes = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris }),
    });

    if (!addRes.ok) {
      return NextResponse.json({ error: "Playlist created but failed to add tracks" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      playlistUrl: playlist.external_urls?.spotify || `https://open.spotify.com/playlist/${playlist.id}`,
      playlistId: playlist.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
