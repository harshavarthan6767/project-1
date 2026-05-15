import { NextResponse } from "next/server";

export function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || clientId === "your_spotify_client_id") {
    return NextResponse.json({ error: "Spotify not configured" }, { status: 500 });
  }

  const scope = "user-top-read";
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri!,
    scope,
    show_dialog: "false",
  });

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`,
  );
}
