import type { Archetype } from "./archetypes";
import type { AnalysisResult } from "./analysis";

interface SlangPhrase {
  phrase: string;
  meaning: string;
}

interface VibeCheck {
  aura: string;
  walkUpSong: string;
  hypothetical: string;
  verdict: string;
  phrases: SlangPhrase[];
  tags: string[];
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

type SlangEra = "pre2000s" | "2000s" | "2010s" | "2020s";

function getSlangEra(decade: string): SlangEra {
  const d = parseInt(decade);
  if (d < 2000) return "pre2000s";
  if (d < 2010) return "2000s";
  if (d < 2020) return "2010s";
  return "2020s";
}

// Era-specific slang dictionaries
const ERA_SLANG: Record<SlangEra, { intensifier: string; approval: string; vibe: string; person: string; amazing: string; cool: string; spotify: string; wrapped: string; blend: string }> = {
  pre2000s: {
    intensifier: "totally", approval: "righteous", vibe: "groove", person: "dude", amazing: "radical", cool: "fly",
    spotify: "mixtape", wrapped: "cassette collection", blend: "supergroup",
  },
  "2000s": {
    intensifier: "literally", approval: "epic", vibe: "mood", person: "bestie", amazing: "legendary", cool: "iconic",
    spotify: "iPod shuffle", wrapped: "burned CD era", blend: "collab album",
  },
  "2010s": {
    intensifier: "lowkey", approval: "lit", vibe: "wave", person: "fam", amazing: "savage", cool: "on fleek",
    spotify: "viral playlist", wrapped: "Tumblr aesthetic", blend: "group chat playlist",
  },
  "2020s": {
    intensifier: "fr fr", approval: "ate and left no crumbs", vibe: "whole aura", person: "gang", amazing: "actually goated", cool: "the rizz is unreal",
    spotify: "daylist went crazy", wrapped: "Spotify Wrapped is gonna air your business", blend: "blend playlist is a fever dream",
  },
};

type Region = "indian" | "latin" | "korean" | "african" | "western" | "global";

function detectRegion(data: AnalysisResult): Region {
  const genres = data.topGenres?.map((g) => g.name.toLowerCase()).join(" ") || "";
  const artists = data.topArtists?.map((a) => a.name).join(" ") || "";
  const allText = genres + " " + artists;

  if (/tamil|bollywood|kollywood|indian|hindi|punjabi|desi|telugu|malayalam|kannada/i.test(allText)) return "indian";
  if (/k-pop|korea|seoul|k-rap|k-rb/i.test(allText)) return "korean";
  if (/latin|reggaeton|salsa|bachata|bad bunny|daddy yankee|j balvin/i.test(allText)) return "latin";
  if (/afrobeat|afropop|amapiano|burna boy|wizkid|davido|rema/i.test(allText)) return "african";
  if (/taylor swift|drake|kanye|travis scott|weeknd|billie|olivia|harry styles/i.test(allText)) return "western";
  return "global";
}

// Region-specific archetype flavor names
const REGION_LABELS: Record<string, Record<string, string>> = {
  indian: {
    curator: "Raga Curator", "party-starter": "Sangeet Starter", "late-night-feels": "Ghazal Soul",
    "hype-beast": "Dappankuthu King", "classic-soul": "Retro Maestro", explorer: "Fusion Explorer",
    stan: "Fan Army General", "chill-vibes": "Meditation Mode",
  },
  korean: {
    curator: "Indie Curator", "party-starter": "K-Rave Starter", "late-night-feels": "K-Drama Feels",
    "hype-beast": "K-Hype Machine", "classic-soul": "K-Classic Soul", explorer: "K-Genre Nomad",
    stan: "Ultimate K-Stan", "chill-vibes": "K-Chill Master",
  },
  latin: {
    curator: "Sonido Curator", "party-starter": "Fiesta Starter", "late-night-feels": "Bolero Soul",
    "hype-beast": "Perreo King", "classic-soul": "Salsa Legend", explorer: "Música Nomad",
    stan: "Fanático Supreme", "chill-vibes": "Tranquilo Master",
  },
  african: {
    curator: "Afro Curator", "party-starter": "Afrobeats Starter", "late-night-feels": "Afro Soul",
    "hype-beast": "Amapiano Hype", "classic-soul": "Highlife Legend", explorer: "Afro Nomad",
    stan: "Afro Stan General", "chill-vibes": "Afro Chill Mode",
  },
};

function getRegionLabel(archetypeId: string, region: Region): string | null {
  return REGION_LABELS[region]?.[archetypeId] || null;
}

export function getVibeCheck(archetype: Archetype, data?: AnalysisResult): VibeCheck {
  const topArtist = data?.topArtists?.[0]?.name || "your fave";
  const topTrack = data?.topTracks?.[0]?.name || "your anthem";
  const secondArtist = data?.topArtists?.[1]?.name || "another artist";
  const bpm = data?.stats?.bpm || 120;
  const era = data?.stats?.topDecade || "2020s";
  const energy = data?.stats?.energy || 50;
  const mood = data?.stats?.mood || 50;
  const popularity = data?.stats?.avgPopularity || 50;
  const artistCount = data?.stats?.totalArtists || 50;
  const region = data ? detectRegion(data) : "global";
  const slangEra = getSlangEra(era);
  const s = ERA_SLANG[slangEra];

  const underground = popularity < 40;
  const mainstream = popularity > 65;

  const auraMap: Record<string, string[]> = {
    curator: [
      `${topArtist} is your roman empire ${s.intensifier}. you found them before the algorithm did and now? ${s.approval} status. ${era} energy but make it exclusive.`,
      `POV: you're gatekeeping ${topArtist} like it's ${era}. ${s.cool} taste, ${s.intensifier} ahead of the curve.`,
    ],
    "party-starter": [
      `${topTrack} at ${bpm} BPM — ${s.intensifier} ${s.approval}. you ARE the aux cord now. ${era} party ${s.vibe} unmatched.`,
      `you hear ${topArtist} and suddenly everyone's ${s.vibe} shifts. ${energy}% energy, ${s.intensifier} main character.`,
    ],
    "late-night-feels": [
      `${topArtist} understands you deeper than your ${s.person}. ${mood}% emotional depth is ${s.intensifier} ${s.approval}. pure ${era} cinema.`,
      `${era} called — it wants its emotional intensity back. ${topArtist} is ${s.intensifier} ${s.cool}.`,
    ],
    "hype-beast": [
      `your neighbors filed complaints about ${topArtist} at ${bpm} BPM. ${s.intensifier} ${s.amazing} behavior. ${era} intensity maxed.`,
      `${topTrack} came on and you ${s.intensifier} ascended. head empty, just ${era} bass, pure ${s.vibe}.`,
    ],
    "classic-soul": [
      `${era} ${s.vibe} runs through your veins. ${topArtist} is ${s.intensifier} ${s.amazing} — they could never make this today. the industry ${s.intensifier} fell off after.`,
      `you've defended ${topArtist} to everyone who thinks new music is better. you were right then, you're ${s.intensifier} right now. ${s.approval}.`,
    ],
    explorer: [
      `your ${era} genre map is ${s.intensifier} unreadable. ${artistCount} artists, ${topArtist} was this week's obsession — next week? ${s.intensifier} something new. ${s.cool}.`,
      `${topArtist} next to ${secondArtist} makes no sense to anyone but you. your ${era} algorithm is ${s.intensifier} in shambles. ${s.approval}.`,
    ],
    stan: [
      `${topArtist} is ${Math.round(popularity)}% of your personality and that's ${s.intensifier} valid. you know the ${era} B-sides. you've seen the Google Drive. ${s.amazing}.`,
      `someone: "i love ${topArtist}" you: *activates ${era} trap card* "name the unreleased demo from ${era}" ${s.intensifier} ${s.cool}.`,
    ],
    "chill-vibes": [
      `${topTrack} at ${bpm} BPM is your ${era} meditation. ${s.intensifier} ${s.approval}, ${s.intensifier} mindful. ${s.cool} energy only.`,
      `your playlist has ${s.intensifier} cured ${artistCount} cases of stress. ${topArtist} is basically a prescription. ${s.cool}.`,
    ],
  };

  const verdictMap: Record<string, string[]> = {
    curator: [
      `your friends ask "do u know this?" and you ${s.intensifier} always do. ${underground ? "underground royalty." : "tastemaker general."} ${s.amazing} level: maximum.`,
      `${topArtist} in your rotation before it was ${s.cool}. ${s.intensifier} ahead of the game. ${s.approval}.`,
    ],
    "party-starter": [
      `${energy > 70 ? `${s.intensifier} ${s.amazing} on the dance floor.` : `controlled chaos on aux.`} ${topTrack} is your ${era} anthem. ${s.intensifier} ${s.cool}.`,
      `never met a silent room you couldn't fix. ${s.intensifier} ${s.amazing} energy. the ${era} ${s.vibe} is real.`,
    ],
    "late-night-feels": [
      `your ${era} wrapped is gonna expose you. ${mood > 60 ? `${s.intensifier} deep feeler.` : `${s.intensifier} tuned to perfection.`} ${s.cool}.`,
      `${topArtist} ${s.intensifier} understood the assignment. emotional damage but make it ${bpm} BPM. ${s.approval}.`,
    ],
    "hype-beast": [
      `${bpm} BPM is just warmup. ${topArtist} at max volume is ${s.intensifier} spiritual. ${s.amazing}.`,
      `head empty, ${era} bass only. ${topTrack} on repeat until the speakers ${s.intensifier} give up. ${s.approval}.`,
    ],
    "classic-soul": [
      `you've explained why the ${era} original is ${s.amazing}. with citations. ${topArtist} is canon. ${s.intensifier} ${s.approval}.`,
      `${era} music ${s.intensifier} hits different. ${topArtist} proves quality is timeless. ${s.cool}.`,
    ],
    explorer: [
      `"what genre do you listen to?" "${topArtist}." "that's not a genre." "exactly." ${artistCount} artists deep. ${s.intensifier} ${s.cool}.`,
      `your ${era} listening is a UN assembly. ${topArtist} was march, ${secondArtist} is now. ${s.intensifier} king/queen behavior.`,
    ],
    stan: [
      `${topArtist} at 3x everyone else. casual listening? ${s.intensifier} don't know her. we go DEEP into the ${era} catalog. ${s.amazing}.`,
      `track 7 from ${topArtist}'s least popular ${era} album? memorized. the dedication is ${s.intensifier} impressive. ${s.amazing}.`,
    ],
    "chill-vibes": [
      `"your playlist got me through exams" — at least 3 ${s.person}s, ${s.intensifier}. ${topArtist} is your ${era} zen. ${s.approval}.`,
      `the ${era} chill is ${s.intensifier} profound. ${topArtist} is the reason ${artistCount} people have peace. ${s.cool}.`,
    ],
  };

  return {
    aura: pick(auraMap[archetype.id] || auraMap.curator),
    walkUpSong: `${topTrack} by ${topArtist} (${bpm} BPM, ${era}, ${energy > 70 ? "all hype" : mood > 60 ? "all feels" : "pure vibes"})`,
    hypothetical: `someone in your ${era} playlist rabbit hole asks what you're listening to. "${topArtist}," you say. they don't know yet that their life is about to change. you ${s.intensifier} have a playlist ready. ${s.cool}.`,
    verdict: pick(verdictMap[archetype.id] || verdictMap.curator),
    phrases: [
      {
        phrase: `${topArtist} ${era} era = ${s.amazing} status`,
        meaning: `${bpm} BPM of ${energy > 70 ? "pure uncut energy" : mood > 60 ? "raw emotional cinema" : "immaculate vibes"}. this ${s.intensifier} has a permanent spot in your brain.`,
      },
      {
        phrase: `${era} coded, ${s.cool} verified`,
        meaning: `${underground ? "underground legend." : `you and ${Math.round(popularity)}% of listeners agree.`} ${mainstream ? "popular for a REASON." : "gatekeeping successfully."} ${s.approval}.`,
      },
      {
        phrase: `certified ${energy > 70 ? "hype merchant" : mood > 60 ? "feels dealer" : "vibe architect"} — ${s.approval}`,
        meaning: `${artistCount} artists deep. ${energy > 70 ? "all gas no brakes." : mood > 60 ? "all feelings no filter." : "all chill no drama."} the ${era} algorithm ${s.intensifier} fears you.`,
      },
    ],
    tags: [
      `${era} Soul`,
      energy > 70 ? "Hype Machine" : mood > 60 ? "Professional Feeler" : "Vibe Curator",
      underground ? "Gatekeeping Royalty" : "Tastemaker General",
      `${topArtist.split(" ")[0]} Era`,
      s.cool,
    ],
  };
}

// Export for use in results page to customize archetype display
export function getRegionArchetypeLabel(archetypeId: string, data?: AnalysisResult): string | null {
  if (!data) return null;
  return getRegionLabel(archetypeId, detectRegion(data));
}
