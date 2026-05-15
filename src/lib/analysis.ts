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
    avgEnergy: number;
    avgDanceability: number;
    avgValence: number;
    avgTempo: number;
    topDecade: string;
    genreDiversity: number;
  };
  summary: string;
}

function computeTraits(
  artists: SpotifyArtist[],
  tracks: SpotifyTrack[],
  features: SpotifyAudioFeatures[],
): Record<string, number> {
  const validFeatures = features.filter((f) => f !== null);

  // Energy: from audio features + popularity
  const avgEnergy = validFeatures.length > 0
    ? validFeatures.reduce((s, f) => s + f.energy, 0) / validFeatures.length
    : 0.5;

  // Obscurity: inverse of artist popularity
  const avgPopularity = artists.length > 0
    ? artists.reduce((s, a) => s + a.popularity, 0) / artists.length
    : 50;
  const obscurity = Math.round(100 - avgPopularity);

  // Curiosity: genre diversity
  const allGenres = new Set<string>();
  artists.forEach((a) => a.genres.forEach((g) => allGenres.add(g)));
  const genreDiversity = allGenres.size;
  const curiosity = Math.min(100, Math.round(genreDiversity * 3.5));

  // Nostalgia: based on track release dates
  const currentYear = new Date().getFullYear();
  const avgYear = tracks.length > 0
    ? tracks.reduce((s, t) => s + parseInt(t.album.release_date.substring(0, 4)), 0) / tracks.length
    : currentYear;
  const avgAge = currentYear - avgYear;
  const nostalgia = Math.min(100, Math.round(avgAge * 5));

  // Emotion: from valence (inverted - sad songs have low valence) + acousticness
  const avgValence = validFeatures.length > 0
    ? validFeatures.reduce((s, f) => s + f.valence, 0) / validFeatures.length
    : 0.5;
  const avgAcoustic = validFeatures.length > 0
    ? validFeatures.reduce((s, f) => s + f.acousticness, 0) / validFeatures.length
    : 0.3;
  const emotion = Math.round((1 - avgValence) * 60 + avgAcoustic * 40);

  // Consistency: inverse of how spread out artist listening is
  const artistConcentration = artists.length > 0
    ? artists.slice(0, 5).reduce((s, a) => s + a.popularity, 0) / (5 * 100)
    : 0.5;
  const consistency = Math.round(artistConcentration * 70 + 20);

  // Energy adjusted with danceability + tempo
  const avgDanceability = validFeatures.length > 0
    ? validFeatures.reduce((s, f) => s + f.danceability, 0) / validFeatures.length
    : 0.5;
  const avgTempo = validFeatures.length > 0
    ? validFeatures.reduce((s, f) => s + f.tempo, 0) / validFeatures.length
    : 120;
  const energy = Math.round(avgEnergy * 60 + avgDanceability * 20 + Math.min(20, (avgTempo - 60) / 6));

  return {
    energy: Math.round(Math.min(100, Math.max(0, energy))),
    emotion: Math.round(Math.min(100, Math.max(0, emotion))),
    curiosity: Math.round(Math.min(100, Math.max(0, curiosity))),
    nostalgia: Math.round(Math.min(100, Math.max(0, nostalgia))),
    obscurity: Math.round(Math.min(100, Math.max(0, obscurity))),
    consistency: Math.round(Math.min(100, Math.max(0, consistency))),
  };
}

function findBestArchetype(traits: Record<string, number>): Archetype {
  let best = ARCHETYPES[0];
  let bestScore = Infinity;

  for (const archetype of ARCHETYPES) {
    let distance = 0;
    for (const [key, value] of Object.entries(traits)) {
      const archValue = archetype.traits[key] || 50;
      distance += Math.pow(value - archValue, 2);
    }
    if (distance < bestScore) {
      bestScore = distance;
      best = archetype;
    }
  }

  return best;
}

function getTopDecade(tracks: SpotifyTrack[]): string {
  const decadeCount: Record<string, number> = {};
  tracks.forEach((t) => {
    const year = parseInt(t.album.release_date.substring(0, 4));
    const decade = `${Math.floor(year / 10) * 10}s`;
    decadeCount[decade] = (decadeCount[decade] || 0) + 1;
  });

  let top = "2020s";
  let max = 0;
  for (const [decade, count] of Object.entries(decadeCount)) {
    if (count > max) {
      max = count;
      top = decade;
    }
  }
  return top;
}

function getTopGenres(artists: SpotifyArtist[]): { name: string; count: number }[] {
  const genreCount: Record<string, number> = {};
  artists.forEach((a) => {
    a.genres.forEach((g) => {
      genreCount[g] = (genreCount[g] || 0) + 1;
    });
  });

  return Object.entries(genreCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));
}

function generateSummary(archetype: Archetype, traits: Record<string, number>): string {
  const traitDescriptions = Object.entries(traits)
    .filter(([, v]) => v > 70)
    .map(([k]) => k);

  const highTraits = traitDescriptions.map((t) => {
    const labels: Record<string, string> = {
      energy: "high-energy bangers",
      emotion: "deep emotional connection",
      curiosity: "boundless musical curiosity",
      nostalgia: "a love for the classics",
      obscurity: "an ear for hidden gems",
      consistency: "deep artist loyalty",
    };
    return labels[t] || t;
  });

  const parts = [
    `You're **${archetype.name}** — ${archetype.description.split(".")[0]}.`,
    highTraits.length > 0
      ? `Your signature is ${highTraits.slice(0, 3).join(", ")}.`
      : "",
  ].filter(Boolean);

  return parts.join(" ");
}

export function analyzeMusicProfile(
  artists: SpotifyArtist[],
  tracks: SpotifyTrack[],
  features: SpotifyAudioFeatures[],
): AnalysisResult {
  const traits = computeTraits(artists, tracks, features);
  const archetype = findBestArchetype(traits);

  const validFeatures = features.filter((f) => f !== null);
  const avgPopularity = artists.length > 0
    ? Math.round(artists.reduce((s, a) => s + a.popularity, 0) / artists.length)
    : 0;
  const avgEnergy = validFeatures.length > 0
    ? Math.round((validFeatures.reduce((s, f) => s + f.energy, 0) / validFeatures.length) * 100)
    : 0;
  const avgDanceability = validFeatures.length > 0
    ? Math.round((validFeatures.reduce((s, f) => s + f.danceability, 0) / validFeatures.length) * 100)
    : 0;
  const avgValence = validFeatures.length > 0
    ? Math.round((validFeatures.reduce((s, f) => s + f.valence, 0) / validFeatures.length) * 100)
    : 0;
  const avgTempo = validFeatures.length > 0
    ? Math.round(validFeatures.reduce((s, f) => s + f.tempo, 0) / validFeatures.length)
    : 0;

  const allGenres = new Set<string>();
  artists.forEach((a) => a.genres.forEach((g) => allGenres.add(g)));

  return {
    archetype,
    traits,
    topArtists: artists.slice(0, 5).map((a) => ({
      name: a.name,
      image: a.images[0]?.url || "",
      genres: a.genres.slice(0, 3),
    })),
    topTracks: tracks.slice(0, 5).map((t) => ({
      name: t.name,
      artist: t.artists[0]?.name || "",
      image: t.album.images[0]?.url || "",
    })),
    topGenres: getTopGenres(artists),
    stats: {
      totalArtists: artists.length,
      totalTracks: tracks.length,
      avgPopularity,
      avgEnergy,
      avgDanceability,
      avgValence,
      avgTempo,
      topDecade: getTopDecade(tracks),
      genreDiversity: allGenres.size,
    },
    summary: generateSummary(archetype, traits),
  };
}
