import { ARCHETYPES, type Archetype } from "./archetypes";
import type { SpotifyArtist, SpotifyTrack, SpotifyAudioFeatures } from "./spotify";

export interface AnalysisResult {
  archetype: Archetype;
  traits: Record<string, number>;
  topArtists: { name: string; image: string; genres: string[] }[];
  topTracks: { name: string; artist: string; image: string; id: string }[];
  topGenres: { name: string; count: number }[];
  stats: {
    totalArtists: number; totalTracks: number;
    avgPopularity: number; energy: number; dance: number;
    mood: number; bpm: number; topDecade: string; genreCount: number;
  };
  summary: string;
  userName?: string;
  aiGenres?: { name: string; count: number }[];
}

function clamp(v: number) { return Math.max(0, Math.min(100, Math.round(v))); }

/* ── Genre-based audio feature estimator ── */
const HIGH_ENERGY = new Set(["edm","dance","electronic","house","techno","drum-and-bass","dubstep","hardstyle","trance","club","pop","hip-hop","rap","trap","rock","metal","punk","hardcore","heavy-metal","death-metal","industrial","grime","drill","dancehall","reggaeton","funk","disco","samba","party","dub","breakbeat","big-room","progressive-house","deep-house","tech-house","electro","hardstyle","jumpstyle","bass","trap-edm","riddim","brostep"]);
const LOW_ENERGY = new Set(["ambient","classical","acoustic","lo-fi","chill","folk","singer-songwriter","piano","orchestra","new-age","meditation","sleep","downtempo","trip-hop","shoegaze","dream-pop","slowcore","drone","minimal","neoclassical","ethereal","soundtrack","cinematic","atmospheric"]);
const HAPPY = new Set(["pop","dance","disco","funk","reggae","latin","afrobeats","samba","salsa","k-pop","j-pop","indie-pop","synth-pop","bubblegum","soca","calypso","tropical","summer","sunshine-pop","power-pop","europop","folk-pop"]);
const SAD = new Set(["blues","emo","post-rock","sad","dark-ambient","doom-metal","gothic","slowcore","breakup","melancholy","dark-wave","ethereal-wave","neofolk","dark-folk"]);
const HIGH_DANCE = new Set(["dance","disco","funk","house","techno","afrobeats","latin","reggaeton","salsa","samba","dancehall","drum-and-bass","edm","club","party","tropical","merengue","bhangra","soca","cumbia","bachata","kizomba","amapiano","jersey-club","footwork","uk-garage","breakbeat","funk-carioca"]);
const FAST = new Set(["drum-and-bass","punk","hardcore","metal","speed-metal","techno","grime","drill","samba","happy-hardcore","gabber","thrash","death-metal","black-metal","power-metal","breakcore","digital-hardcore","crossbreed"]);
const SLOW = new Set(["ambient","drone","doom-metal","classical","orchestra","piano","ballad","slow-jam","r-b","soul","blues","lo-fi","chill","downtempo","trip-hop","singer-songwriter","neo-soul","quiet-storm"]);

function estimateFromGenres(artists: SpotifyArtist[]) {
  let eC = 0, eT = 0, dC = 0, dT = 0, vC = 0, vT = 0, tC = 0, tT = 0;
  artists.forEach((a) => {
    (a.genres || []).forEach((g) => {
      const genre = g.toLowerCase();
      if (HIGH_ENERGY.has(genre)) { eT += 80; eC++; }
      else if (LOW_ENERGY.has(genre)) { eT += 25; eC++; }
      if (HIGH_DANCE.has(genre)) { dT += 80; dC++; }
      if (HAPPY.has(genre)) { vT += 75; vC++; }
      else if (SAD.has(genre)) { vT += 25; vC++; }
      if (FAST.has(genre)) { tT += 140; tC++; }
      else if (SLOW.has(genre)) { tT += 75; tC++; }
    });
  });

  const popAvg = artists.length > 0
    ? artists.reduce((s, a) => s + (a.popularity ?? 50), 0) / artists.length
    : 50;

  // Each artist without genre match adds diversity — use popularity to differentiate
  const popFactor = popAvg / 100;
  return {
    energy: eC > 0 ? Math.round(eT / eC) : clamp(30 + popAvg * 0.4 + artists.length * 0.2),
    danceability: dC > 0 ? Math.round(dT / dC) : clamp(35 + popAvg * 0.35 + Math.random() * 10),
    valence: vC > 0 ? Math.round(vT / vC) : clamp(40 + popAvg * 0.3 + artists.length * 0.3),
    tempo: tC > 0 ? Math.round(tT / tC) : clamp(90 + popAvg * 0.4 + Math.random() * 20),
  };
}

/* ── Compute traits ── */
function computeTraits(
  artists: SpotifyArtist[],
  tracks: SpotifyTrack[],
  features: SpotifyAudioFeatures[],
): Record<string, number> {
  const validFeats = features.filter((f) => f !== null && f.energy !== undefined);
  const hasAudio = validFeats.length > 0 && validFeats.reduce((s, f) => s + f.energy, 0) / validFeats.length > 0.01;
  const hasGenres = artists.some((a) => (a.genres || []).length > 0);

  // Tier 1: real audio features, Tier 2: genre estimate, Tier 3: popularity only
  const get = (audioFn: (f: SpotifyAudioFeatures) => number, estKey: "energy" | "danceability" | "valence" | "tempo", fallbackVal: number) => {
    if (hasAudio) return validFeats.reduce((s, f) => s + audioFn(f), 0) / validFeats.length;
    if (hasGenres) return (estimateFromGenres(artists)[estKey] ?? fallbackVal) / 100;
    return fallbackVal / 100;
  };

  const rawEnergy = get((f) => f.energy, "energy", 60);
  const rawDance = get((f) => f.danceability, "danceability", 55);
  const rawTempo = hasAudio
    ? validFeats.reduce((s, f) => s + f.tempo, 0) / validFeats.length
    : (hasGenres ? (estimateFromGenres(artists).tempo ?? 120) : 110 + artists.length * 0.5);
  const rawValence = get((f) => f.valence, "valence", 50);
  const rawAcoustic = hasAudio ? validFeats.reduce((s, f) => s + f.acousticness, 0) / validFeats.length : 0.4;

  const count = artists.length || 1;
  const popularities = artists.map((a) => a.popularity ?? 50);
  const avgPop = popularities.reduce((s, v) => s + v, 0) / count;
  const popVar = popularities.reduce((s, v) => s + Math.pow(v - avgPop, 2), 0) / count;

  // Genre/category diversity
  const genreSet = new Set<string>();
  artists.forEach((a) => (a.genres || []).forEach((g) => genreSet.add(g)));
  const genreCount = genreSet.size;

  // Release year analysis
  const now = new Date().getFullYear();
  const years = tracks.map((t) => {
    const y = parseInt((t.album?.release_date || String(now)).substring(0, 4));
    return isNaN(y) ? now : y;
  });
  const avgYear = years.reduce((s, y) => s + y, 0) / (years.length || 1);
  const yearSpan = Math.max(...years) - Math.min(...years);

  // Energy from audio features (weighted) + popularity
  const energy = clamp(rawEnergy * 60 + rawDance * 20 + Math.min(20, Math.max(0, (rawTempo - 60) / 6)));

  // Emotional depth: inverse valence + acoustic + decade spread
  const emotion = clamp((1 - rawValence) * 55 + rawAcoustic * 30 + Math.min(15, yearSpan * 0.5));

  // Curiosity: genre diversity + artist count + popularity variance
  const curiosity = clamp(
    (genreCount > 0 ? genreCount * 3 : artists.length * 0.7) +
    Math.sqrt(popVar) * 1.2
  );

  // Nostalgia: track age
  const nostalgia = clamp((now - avgYear) * 4 + (yearSpan > 30 ? 15 : 0));

  // Obscurity: inverse popularity
  const obscurity = clamp(100 - avgPop);

  // Consistency: top-5 concentration
  const top5Avg = artists.slice(0, 5).reduce((s, a) => s + (a.popularity ?? 50), 0) / Math.min(5, count);
  const consistency = clamp((top5Avg / 100) * 55 + (yearSpan < 10 ? 20 : 0));

  return {
    energy, emotion, curiosity, nostalgia, obscurity, consistency,
  };
}

function findBestArchetype(traits: Record<string, number>): Archetype {
  let best = ARCHETYPES[0]; let bestScore = Infinity;
  for (const a of ARCHETYPES) {
    let d = 0;
    for (const [k, v] of Object.entries(traits)) d += Math.pow(v - (a.traits[k] ?? 50), 2);
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
  for (const [d, c] of Object.entries(bins)) if (c > max) { max = c; top = d; }
  return top;
}

function getTopGenres(artists: SpotifyArtist[]): { name: string; count: number }[] {
  const map: Record<string, number> = {};
  artists.forEach((a) => {
    (a.genres || []).forEach((g) => { if (g) map[g] = (map[g] || 0) + 1; });
  });
  return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 8).map(([name, count]) => ({ name, count }));
}

function generateSummary(archetype: Archetype, traits: Record<string, number>): string {
  const labels: Record<string, string> = {
    energy: "high-energy bangers", emotion: "deep emotional connection",
    curiosity: "boundless musical curiosity", nostalgia: "a love for the classics",
    obscurity: "an ear for hidden gems", consistency: "deep artist loyalty",
  };
  const high = Object.entries(traits).filter(([, v]) => v > 70).map(([k]) => labels[k] || k);
  const parts = [
    `You're **${archetype.name}** — ${archetype.description.split(".")[0]}.`,
    high.length > 0 ? `Your signature is ${high.slice(0, 3).join(", ")}.` : "",
  ].filter(Boolean);
  return parts.join(" ");
}

/* ── Main ── */
export function analyzeMusicProfile(
  artists: SpotifyArtist[],
  tracks: SpotifyTrack[],
  features: SpotifyAudioFeatures[],
): AnalysisResult {
  if (!artists?.length) {
    return {
      archetype: ARCHETYPES[0],
      traits: { energy: 50, emotion: 50, curiosity: 50, nostalgia: 50, obscurity: 50, consistency: 50 },
      topArtists: [], topTracks: [], topGenres: [],
      stats: { totalArtists: 0, totalTracks: 0, avgPopularity: 0, energy: 50, dance: 50, mood: 50, bpm: 120, topDecade: "2020s", genreCount: 0 },
      summary: "Connect Spotify to discover your music personality.",
    };
  }

  const traits = computeTraits(artists, tracks, features);
  const archetype = findBestArchetype(traits);

  // Stats from actual audio features when available
  const validFeats = features.filter((f) => f !== null && f.energy !== undefined);
  const hasAudio = validFeats.length > 0 && validFeats.reduce((s, f) => s + f.energy, 0) / validFeats.length > 0.01;
  const hasGenres = artists.some((a) => (a.genres || []).length > 0);
  const estimates = (!hasAudio && hasGenres) ? estimateFromGenres(artists) : null;

  const avgPopularity = Math.round(artists.reduce((s, a) => s + (a.popularity ?? 50), 0) / artists.length);

  const statEnergy = hasAudio
    ? Math.round((validFeats.reduce((s, f) => s + f.energy, 0) / validFeats.length) * 100)
    : (estimates ? estimates.energy : clamp(30 + avgPopularity * 0.4 + artists.length * 0.2));

  const statDance = hasAudio
    ? Math.round((validFeats.reduce((s, f) => s + f.danceability, 0) / validFeats.length) * 100)
    : (estimates ? estimates.danceability : clamp(35 + avgPopularity * 0.35 + artists.length * 0.15));

  const statMood = hasAudio
    ? Math.round((validFeats.reduce((s, f) => s + f.valence, 0) / validFeats.length) * 100)
    : (estimates ? estimates.valence : clamp(40 + avgPopularity * 0.3 + artists.length * 0.25));

  const statBpm = hasAudio
    ? Math.round(validFeats.reduce((s, f) => s + f.tempo, 0) / validFeats.length)
    : (estimates ? estimates.tempo : clamp(100 + avgPopularity * 0.4 + artists.length * 0.3));

  const genreSet = new Set<string>();
  artists.forEach((a) => (a.genres || []).forEach((g) => { if (g) genreSet.add(g); }));

  return {
    archetype, traits,
    topArtists: artists.slice(0, 5).map((a) => ({
      name: a.name || "Unknown", image: a.images?.[0]?.url || "", genres: (a.genres || []).slice(0, 3),
    })),
    topTracks: tracks.slice(0, 5).map((t) => ({
      id: t.id, name: t.name || "Unknown", artist: t.artists?.[0]?.name || "", image: t.album?.images?.[0]?.url || "",
    })),
    topGenres: getTopGenres(artists),
    stats: {
      totalArtists: artists.length, totalTracks: tracks.length,
      avgPopularity, energy: statEnergy, dance: statDance, mood: statMood, bpm: statBpm,
      topDecade: getTopDecade(tracks), genreCount: genreSet.size,
    },
    summary: generateSummary(archetype, traits),
  };
}
