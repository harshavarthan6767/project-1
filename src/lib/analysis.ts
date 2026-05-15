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
  const validFeatures = features.filter((f) => f !== null && f.energy > 0);
  const hasAudio = validFeatures.length > 0;

  // Use genre-based estimates when audio features are sparse
  const estimates = hasAudio ? null : estimateFromGenres(artists);

  // Obscurity: inverse of average artist popularity
  const avgPopularity = artists.length > 0
    ? artists.reduce((s, a) => s + a.popularity, 0) / artists.length
    : 50;
  const obscurity = Math.round(100 - avgPopularity);

  // Curiosity: genre diversity + artist variety
  const allGenres = new Set<string>();
  artists.forEach((a) => (a.genres || []).forEach((g) => allGenres.add(g)));
  const genreCount = allGenres.size;
  // If no genre data, estimate from artist count (more artists = more curious)
  const curiosity = genreCount > 0
    ? Math.min(100, Math.round(genreCount * 3.5))
    : Math.min(100, Math.round(30 + artists.length * 0.8));

  // Nostalgia: average track release age
  const currentYear = new Date().getFullYear();
  const avgYear = tracks.length > 0
    ? tracks.reduce((s, t) => s + parseInt(t.album.release_date.substring(0, 4)), 0) / tracks.length
    : currentYear;
  const avgAge = currentYear - avgYear;
  const nostalgia = Math.min(100, Math.round(avgAge * 5));

  // Energy: audio features or estimate
  const rawEnergy = hasAudio
    ? validFeatures.reduce((s, f) => s + f.energy, 0) / validFeatures.length
    : (estimates ? estimates.energy / 100 : 0.5);
  const rawDance = hasAudio
    ? validFeatures.reduce((s, f) => s + f.danceability, 0) / validFeatures.length
    : (estimates ? estimates.danceability / 100 : 0.5);
  const rawTempo = hasAudio
    ? validFeatures.reduce((s, f) => s + f.tempo, 0) / validFeatures.length
    : (estimates ? estimates.tempo : 120);
  const energy = Math.round(rawEnergy * 60 + rawDance * 20 + Math.min(20, (rawTempo - 60) / 6));

  // Emotion: from valence + acousticness, or estimate
  const rawValence = hasAudio
    ? validFeatures.reduce((s, f) => s + f.valence, 0) / validFeatures.length
    : (estimates ? estimates.valence / 100 : 0.5);
  const rawAcoustic = hasAudio
    ? validFeatures.reduce((s, f) => s + f.acousticness, 0) / validFeatures.length
    : 0.3;
  const emotion = Math.round((1 - rawValence) * 60 + rawAcoustic * 40);

  // Consistency: how concentrated is listening on top artists
  // More variance in popularity among top 5 = less consistent
  const top5 = artists.slice(0, 5);
  const top5Avg = top5.length > 0
    ? top5.reduce((s, a) => s + a.popularity, 0) / top5.length
    : 50;
  const consistency = Math.round((top5Avg / 100) * 50 + (1 - artists.length / 100) * 50);

  return {
    energy: clamp(energy),
    emotion: clamp(emotion),
    curiosity: clamp(curiosity),
    nostalgia: clamp(nostalgia),
    obscurity: clamp(obscurity),
    consistency: clamp(consistency),
  };
}

function clamp(v: number) { return Math.round(Math.min(100, Math.max(0, v))); }

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
    (a.genres || []).forEach((g) => {
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

function estimateFromGenres(artists: SpotifyArtist[]): {
  energy: number; danceability: number; valence: number; tempo: number;
} {
  const highEnergy = new Set(["edm", "dance", "electronic", "house", "techno", "drum-and-bass", "dubstep", "hardstyle", "trance", "party", "club", "pop", "hip-hop", "rap", "trap", "rock", "metal", "punk", "hardcore", "heavy-metal", "death-metal", "industrial", "grime", "drill", "dancehall", "reggaeton", "funk", "disco", "samba"]);
  const lowEnergy = new Set(["ambient", "classical", "acoustic", "lo-fi", "chill", "folk", "singer-songwriter", "piano", "orchestra", "new-age", "meditation", "sleep", "downtempo", "trip-hop", "shoegaze", "dream-pop", "slowcore"]);
  const happyGenres = new Set(["pop", "dance", "disco", "funk", "reggae", "latin", "afrobeats", "samba", "salsa", "k-pop", "j-pop", "indie-pop", "synth-pop", "bubblegum", "soca", "calypso"]);
  const sadGenres = new Set(["blues", "emo", "post-rock", "sad", "dark-ambient", "doom-metal", "gothic", "slowcore", "breakup", "melancholy"]);
  const highDance = new Set(["dance", "disco", "funk", "house", "techno", "afrobeats", "latin", "reggaeton", "salsa", "samba", "dancehall", "drum-and-bass", "edm", "club", "party", "tropical", "merengue", "bhangra", "soca"]);
  const fastTempo = new Set(["drum-and-bass", "punk", "hardcore", "metal", "speed-metal", "techno", "grime", "drill", "samba", "happy-hardcore", "gabber", "thrash"]);
  const slowTempo = new Set(["ambient", "drone", "doom-metal", "classical", "orchestra", "piano", "ballad", "slow-jam", "r-b", "soul", "blues", "lo-fi", "chill"]);

  let eCount = 0, eTotal = 0;
  let dCount = 0, dTotal = 0;
  let vCount = 0, vTotal = 0;
  let tCount = 0, tTotal = 0;

  artists.forEach((a) => {
    const genres = (a.genres || []).map((g) => g.toLowerCase());
    genres.forEach((g) => {
      if (highEnergy.has(g)) { eTotal += 80; eCount++; }
      else if (lowEnergy.has(g)) { eTotal += 25; eCount++; }
      if (highDance.has(g)) { dTotal += 80; dCount++; }
      if (happyGenres.has(g)) { vTotal += 75; vCount++; }
      else if (sadGenres.has(g)) { vTotal += 25; vCount++; }
      if (fastTempo.has(g)) { tTotal += 140; tCount++; }
      else if (slowTempo.has(g)) { tTotal += 75; tCount++; }
    });
  });

  const popBoost = artists.length > 0
    ? Math.round(artists.reduce((s, a) => s + a.popularity, 0) / artists.length)
    : 50;

  return {
    energy: eCount > 0 ? Math.round(eTotal / eCount) : Math.round(30 + popBoost * 0.5),
    danceability: dCount > 0 ? Math.round(dTotal / dCount) : Math.round(35 + popBoost * 0.45),
    valence: vCount > 0 ? Math.round(vTotal / vCount) : Math.round(40 + popBoost * 0.4),
    tempo: tCount > 0 ? Math.round(tTotal / tCount) : Math.round(90 + popBoost * 0.5),
  };
}

export function analyzeMusicProfile(
  artists: SpotifyArtist[],
  tracks: SpotifyTrack[],
  features: SpotifyAudioFeatures[],
): AnalysisResult {
  const traits = computeTraits(artists, tracks, features);
  const archetype = findBestArchetype(traits);

  const validFeatures = features.filter((f) => f !== null && f.energy > 0);
  const hasAudioFeatures = validFeatures.length > 0;
  const estimates = hasAudioFeatures ? null : estimateFromGenres(artists);

  const avgPopularity = artists.length > 0
    ? Math.round(artists.reduce((s, a) => s + a.popularity, 0) / artists.length)
    : 0;
  // Use trait values directly — they already have proper fallback logic
  const avgEnergy = traits.energy;
  const avgDanceability = hasAudioFeatures
    ? Math.round((validFeatures.reduce((s, f) => s + f.danceability, 0) / validFeatures.length) * 100)
    : (estimates?.danceability ?? 50);
  const avgValence = traits.emotion;
  const avgTempo = hasAudioFeatures
    ? Math.round(validFeatures.reduce((s, f) => s + f.tempo, 0) / validFeatures.length)
    : (estimates?.tempo ?? 120);

  const allGenres = new Set<string>();
  artists.forEach((a) => (a.genres || []).forEach((g) => allGenres.add(g)));

  return {
    archetype,
    traits,
    topArtists: artists.slice(0, 5).map((a) => ({
      name: a.name,
      image: a.images[0]?.url || "",
      genres: (a.genres || []).slice(0, 3),
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
