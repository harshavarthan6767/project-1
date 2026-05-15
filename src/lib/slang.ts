import type { Archetype } from "./archetypes";
import type { AnalysisResult } from "./analysis";

interface SlangPhrase {
  phrase: string;
  meaning: string;
}

interface VibeCheck {
  aura: string;
  auraEmoji: string;
  walkUpSong: string;
  hypothetical: string;
  verdict: string;
  phrases: SlangPhrase[];
  tags: string[];
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getVibeCheck(archetype: Archetype, data?: AnalysisResult): VibeCheck {
  const topArtist = data?.topArtists?.[0]?.name || "your favorite artist";
  const topTrack = data?.topTracks?.[0]?.name || "your top track";
  const bpm = data?.stats?.bpm || 120;
  const era = data?.stats?.topDecade || "2020s";
  const energy = data?.stats?.energy || 50;
  const mood = data?.stats?.mood || 50;
  const popularity = data?.stats?.avgPopularity || 50;
  const artistCount = data?.stats?.totalArtists || 50;

  const auraTemplates: Record<string, string[]> = {
    curator: [
      `You're not just listening — you're curating. Your library is a gallery and ${topArtist} is the centerpiece.`,
      `Mainstream is a suggestion you politely ignore. ${topArtist} and your underground faves prove it.`,
    ],
    "party-starter": [
      `Your aux cord is a weapon. When ${topTrack} comes on, the energy shifts. Everyone knows it.`,
      `You don't just play music — you conduct experiences. ${energy}% energy is your default setting.`,
    ],
    "late-night-feels": [
      `${topArtist} understands you in ways people don't. Your playlists are emotional architecture.`,
      `You've spent countless hours with ${topTrack} on repeat, staring at the ceiling. Time well spent.`,
    ],
    "hype-beast": [
      `Your listening peaks at ${bpm} BPM and never dips. ${topArtist} is your battle soundtrack.`,
      `Background music? Never heard of her. Every track from ${topArtist} demands full attention.`,
    ],
    "classic-soul": [
      `Your ${era} heart beats through ${topArtist}. They don't make 'em like this anymore — literally.`,
      `While others chase trends, you're discovering the deep cuts from ${topArtist} that most people missed.`,
    ],
    explorer: [
      `Your genre map has ${artistCount} pins and counting. ${topArtist} was just this week's discovery.`,
      `Spotify's algorithm gave up trying to categorize you. ${topArtist} next to ${pick(["that obscure artist", "your latest find", "last week's obsession"])}? Makes perfect sense to you.`,
    ],
    stan: [
      `Your ${topArtist} obsession runs deep — probably ${artistCount} artists in your rotation but let's be real, it's mostly them.`,
      `Someone mentions ${topArtist} and you appear like it's your bat signal. You contain multitudes, all of them about this artist.`,
    ],
    "chill-vibes": [
      `${topArtist} at ${bpm} BPM is your sweet spot. Your playlists could be prescribed for anxiety.`,
      `You've mastered the art of sonic tranquility. ${topTrack} on repeat could solve world peace.`,
    ],
  };

  const verdictTemplates: Record<string, string[]> = {
    curator: [
      `Your friends send you songs asking "have you heard this?" You always have. Certified tastemaker.`,
      `You don't follow playlists — playlists follow you. ${popularity < 40 ? "Underground royalty." : "Tastemaker with range."}`,
    ],
    "party-starter": [
      `The function doesn't start until you arrive. ${energy > 70 ? "Absolute menace on the dance floor." : "Controlled chaos on aux."}`,
      `You've never met a silent room you couldn't fix. ${topTrack} is your secret weapon.`,
    ],
    "late-night-feels": [
      `Your Spotify Wrapped is going to expose you and you've made peace with that. ${mood > 60 ? "Deep feeler, deeper catalog." : "Emotionally tuned to perfection."}`,
      `Music isn't background noise for you — it's the main character. ${topArtist} knows the assignment.`,
    ],
    "hype-beast": [
      `Your neighbors know your top 5. Not by choice. ${bpm} BPM is just your resting heart rate.`,
      `Head empty, just bass. ${topArtist} at maximum volume is a spiritual experience.`,
    ],
    "classic-soul": [
      `You've explained why the original is better than the cover. Multiple times. You had receipts. ${era} runs through your veins.`,
      `Your music knowledge spans decades. ${topArtist} is just one chapter in your extensive library.`,
    ],
    explorer: [
      `You've never had a "favorite genre" and you never will. ${artistCount} artists across the musical spectrum says it all.`,
      `Your Spotify pie chart looks like a bag of Skittles. ${topArtist} was last month — this month it's something entirely new.`,
    ],
    stan: [
      `When you love an artist, you LOVE an artist. ${topArtist} at 3x everyone else in your rotation. The dedication is honestly impressive.`,
      `Track 7 from ${topArtist}'s least popular album? You know every word. Casual listening not found in your vocabulary.`,
    ],
    "chill-vibes": [
      `You've been told "your playlist got me through finals week" at least three times. ${topArtist} is your zen master.`,
      `The chill is actually profound. Your music isn't background noise — it's a whole environment curated at ${bpm} BPM.`,
    ],
  };

  const templates = auraTemplates[archetype.id] || auraTemplates.curator;
  const verdicts = verdictTemplates[archetype.id] || verdictTemplates.curator;

  return {
    aura: pick(templates),
    auraEmoji: "",
    walkUpSong: `${topTrack} by ${topArtist}`,
    hypothetical: `When someone asks what you're listening to and you say ${topArtist} — the look on their face tells you everything about their taste level.`,
    verdict: pick(verdicts),
    phrases: [
      {
        phrase: `${topTrack} on repeat`,
        meaning: `Your most played track — ${bpm} BPM of pure ${energy > 70 ? "energy" : mood > 60 ? "emotion" : "vibe"}`,
      },
      {
        phrase: `${topArtist} era`,
        meaning: `You're in your ${era} bag and ${topArtist} is leading the charge`,
      },
      {
        phrase: `${popularity < 40 ? "underground " : ""}${energy > 70 ? "hype " : mood > 60 ? "feels " : "vibe "}curator`,
        meaning: `Your listening pattern is uniquely yours — ${artistCount} artists deep and counting`,
      },
    ],
    tags: [
      `${era} Soul`,
      `${energy > 70 ? "High Energy" : mood > 60 ? "Deep Feeler" : "Vibe Master"}`,
      `${popularity < 40 ? "Underground King" : "Tastemaker"}`,
      `${topArtist.split(" ")[0]} Stan`,
    ],
  };
}
