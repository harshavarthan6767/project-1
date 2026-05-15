const SPOTIFY_API = "https://api.spotify.com/v1";

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: number;
  images: { url: string }[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    name: string;
    release_date: string;
    images: { url: string }[];
  };
  popularity: number;
  duration_ms: number;
}

export interface SpotifyAudioFeatures {
  danceability: number;
  energy: number;
  valence: number;
  tempo: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  speechiness: number;
}

export interface SpotifyTopArtistsResponse {
  items: SpotifyArtist[];
}

export interface SpotifyTopTracksResponse {
  items: SpotifyTrack[];
}

function getClientId(): string {
  const id = process.env.SPOTIFY_CLIENT_ID;
  if (!id || id === "your_spotify_client_id") {
    throw new Error("SPOTIFY_CLIENT_ID is not configured. Add it to .env.local");
  }
  return id;
}

function getClientSecret(): string {
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!secret || secret === "your_spotify_client_secret") {
    throw new Error("SPOTIFY_CLIENT_SECRET is not configured. Add it to .env.local");
  }
  return secret;
}

function getRedirectUri(): string {
  return process.env.SPOTIFY_REDIRECT_URI || "http://localhost:3000/api/auth/callback";
}

export function getSpotifyAuthUrl(): string {
  const scope = "user-top-read";
  const params = new URLSearchParams({
    client_id: getClientId(),
    response_type: "code",
    redirect_uri: getRedirectUri(),
    scope,
    show_dialog: "false",
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<SpotifyTokens> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${getClientId()}:${getClientSecret()}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokens> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${getClientId()}:${getClientSecret()}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) throw new Error("Failed to refresh token");

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

async function spotifyFetch<T>(endpoint: string, accessToken: string): Promise<T> {
  const res = await fetch(`${SPOTIFY_API}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Spotify API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getTopArtists(accessToken: string, timeRange: "short_term" | "medium_term" | "long_term" = "medium_term"): Promise<SpotifyArtist[]> {
  const data = await spotifyFetch<SpotifyTopArtistsResponse>(
    `/me/top/artists?limit=50&time_range=${timeRange}`,
    accessToken,
  );
  return data.items;
}

export async function getTopTracks(accessToken: string, timeRange: "short_term" | "medium_term" | "long_term" = "medium_term"): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<SpotifyTopTracksResponse>(
    `/me/top/tracks?limit=50&time_range=${timeRange}`,
    accessToken,
  );
  return data.items;
}

export async function getAudioFeatures(accessToken: string, trackIds: string[]): Promise<SpotifyAudioFeatures[]> {
  const data = await spotifyFetch<{ audio_features: SpotifyAudioFeatures[] }>(
    `/audio-features?ids=${trackIds.join(",")}`,
    accessToken,
  );
  return data.audio_features.filter(Boolean);
}

export async function getUserProfile(accessToken: string): Promise<{ display_name: string; images: { url: string }[] }> {
  return spotifyFetch("/me", accessToken);
}

export async function getArtist(accessToken: string, artistId: string): Promise<SpotifyArtist> {
  return spotifyFetch<SpotifyArtist>(`/artists/${artistId}`, accessToken);
}

export async function getRelatedArtists(accessToken: string, artistId: string): Promise<SpotifyArtist[]> {
  const data = await spotifyFetch<{ artists: SpotifyArtist[] }>(
    `/artists/${artistId}/related-artists`,
    accessToken,
  );
  return data.artists || [];
}
