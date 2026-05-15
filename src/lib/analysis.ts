import { ARCHETYPES, type Archetype } from "./archetypes";
import type { SpotifyArtist, SpotifyTrack, SpotifyAudioFeatures } from "./spotify";

export interface AnalysisResult {
  archetype: Archetype;
  traits: Record<string, number>;
  topArtists: { name: string; image: string; genres: string[] }[];
  topTracks: { name: string; artist: string; image: string }[];
  topGenres: { name: string; count: number }[];
  stats: {
    totalArtists: number;
    totalTracks: number;
    avgPopularity: number;
    energy: number;
    dance: number;
    mood: number;
    bpm: number;
    topDecade: string;
    genreCount: number;
  };
  summary: string;
}

function clamp(v: number) { return Math.max(0, Math.min(100, Math.round(v))); }
function safeNum(n: number, fallback = 50) { return isNaN(n) || n === null ? fallback : n; }

/* ── Compute all 6 traits from guaranteed-available data ── */
function computeTraits(artists: SpotifyArtist[], tracks: SpotifyTrack[]): Record<string, number> {
  const count = artists.length || 1;

  // Popularity metrics
  const popularities = artists.map((a) => a.popularity ?? 50);
  const avgPop = popularities.reduce((s, v) => s + v, 0) / count;

  // Obscurity: lower average popularity = more underground
  const obscurity = clamp(100 - avgPop);

  // Genre diversity — from genres if available, else estimated
  const genreSet = new Set<string>();
  artists.forEach((a) => (a.genres || []).forEach((g) => genreSet.add(g)));
  const genreCount = genreSet.size;

  // Curiosity: genre diversity + artist spread
  const curiosity = genreCount > 0
    ? clamp(genreCount * 3.5)
    : clamp(20 + count * 0.8);

  // Nostalgia: from track release years
  const now = new Date().getFullYear();
  const years = tracks.map((t) => {
    const y = parseInt((t.album?.release_date || String(now)).substring(0, 4));
    return isNaN(y) ? now : y;
  });
  const avgYear = years.reduce((s, y) => s + y, 0) / (years.length || 1);
  const nostalgia = clamp((now - avgYear) * 5);

  // Energy & Mood: estimated from artist popularity pattern
  // Higher popularity = tends toward higher energy
  const energy = clamp(30 + avgPop * 0.5);

  // Mood: derived from popularity spread (diverse popularity = emotional depth)
  const popVariance = popularities.reduce((s, v) => s + Math.pow(v - avgPop, 2), 0) / count;
  const emotion = clamp(40 + Math.sqrt(popVariance) * 1.5);

  // Consistency: how concentrated is listening
  const top5Avg = artists.slice(0, 5).reduce((s, a) => s + (a.popularity ?? 50), 0) / Math.min(5, artists.length);
  const consistency = clamp((top5Avg / 100) * 60 + 20);

  return {
    energy: energy,
    emotion: emotion,
    curiosity: curiosity,
    nostalgia: nostalgia,
    obscurity: obscurity,
    consistency: consistency,
  };
}

function findBestArchetype(traits: Record<string, number>): Archetype {
  let best = ARCHETYPES[0];
  let bestScore = Infinity;
  for (const a of ARCHETYPES) {
    let d = 0;
    for (const [k, v] of Object.entries(traits)) {
      d += Math.pow(v - (a.traits[k] ?? 50), 2);
    }
    if (d < bestScore) { bestScore = d; best = a; }
  }
  return best;
}

function getTopDecade(tracks: SpotifyTrack[]): string {
  const bins: Record<string, number> = {};
  tracks.forEach((t) => {
    const y = parseInt((t.album?.release_date || "2020").substring(0, 4));
    if (isNaN(y)) return;
    const decade = `${Math.floor(y / 10) * 10}s`;
    bins[decade] = (bins[decade] || 0) + 1;
  });
  let top = "2020s"; let max = 0;
  for (const [d, c] of Object.entries(bins)) { if (c > max) { max = c; top = d; } }
  return top;
}

function getTopGenres(artists: SpotifyArtist[]): { name: string; count: number }[] {
  const map: Record<string, number> = {};
  artists.forEach((a) => {
    (a.genres || []).forEach((g) => {
      if (g) map[g] = (map[g] || 0) + 1;
    });
  });
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));
}

function generateSummary(archetype: Archetype, traits: Record<string, number>): string {
  const labels: Record<string, string> = {
    energy: "high-energy bangers", emotion: "deep emotional connection",
    curiosity: "boundless musical curiosity", nostalgia: "a love for the classics",
    obscurity: "an ear for hidden gems", consistency: "deep artist loyalty",
  };
  const high = Object.entries(traits)
    .filter(([, v]) => v > 70)
    .map(([k]) => labels[k] || k);
  return [
    `You're **${archetype.name}** — ${archetype.description.split(".")[0]}.`,
    high.length > 0 ? `Your signature is ${high.slice(0, 3).join(", ")}.` : "",
  ].filter(Boolean).join(" ");
}

/* ── Main entry point ── */
export function analyzeMusicProfile(
  artists: SpotifyArtist[],
  tracks: SpotifyTrack[],
  _features: SpotifyAudioFeatures[], // accepted but not relied on — unreliable from Spotify API
): AnalysisResult {
  // Safe defaults
  if (!artists?.length) {
    return {
      archetype: ARCHETYPES[0],
      traits: { energy: 50, emotion: 50, curiosity: 50, nostalgia: 50, obscurity: 50, consistency: 50 },
      topArtists: [], topTracks: [], topGenres: [],
      stats: { totalArtists: 0, totalTracks: 0, avgPopularity: 0, energy: 50, dance: 50, mood: 50, bpm: 120, topDecade: "2020s", genreCount: 0 },
      summary: "Connect your Spotify to discover your music personality.",
    };
  }

  const traits = computeTraits(artists, tracks);
  const archetype = findBestArchetype(traits);

  // Stats — all derived from guaranteed data, no audio features dependency
  const avgPopularity = Math.round(artists.reduce((s, a) => s + (a.popularity ?? 50), 0) / artists.length);
  const genreSet = new Set<string>();
  artists.forEach((a) => (a.genres || []).forEach((g) => { if (g) genreSet.add(g); }));

  return {
    archetype,
    traits,
    topArtists: artists.slice(0, 5).map((a) => ({
      name: a.name || "Unknown",
      image: a.images?.[0]?.url || "",
      genres: (a.genres || []).slice(0, 3),
    })),
    topTracks: tracks.slice(0, 5).map((t) => ({
      name: t.name || "Unknown",
      artist: t.artists?.[0]?.name || "",
      image: t.album?.images?.[0]?.url || "",
    })),
    topGenres: getTopGenres(artists),
    stats: {
      totalArtists: artists.length,
      totalTracks: tracks.length,
      avgPopularity,
      energy: traits.energy,
      dance: clamp(40 + avgPopularity * 0.4),
      mood: traits.emotion,
      bpm: 100 + Math.round(avgPopularity * 0.5),
      topDecade: getTopDecade(tracks),
      genreCount: genreSet.size,
    },
    summary: generateSummary(archetype, traits),
  };
}
