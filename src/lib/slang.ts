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

  const underground = popularity < 40;
  const mainstream = popularity > 65;

  const auraTemplates: Record<string, string[]> = {
    curator: [
      `POV: you found ${topArtist} before they had 1k monthly listeners. now they're blowing up and you're gatekeeping like your life depends on it. valid tbh.`,
      `${topArtist} is your roman empire. you think about their discography at least 4 times a day. no cap.`,
    ],
    "party-starter": [
      `${topTrack} at ${bpm} BPM is your entire personality and honestly? slay. the aux cord was MADE for you.`,
      `you hear ${topArtist} and suddenly you're the main character. ${energy}% energy, zero chill, all vibes.`,
    ],
    "late-night-feels": [
      `${topArtist} gets you in ways your therapist doesn't. ${mood}% emotional depth is actually insane.`,
      `POV: it's 2am, ${topTrack} is playing, and you're rethinking every life decision. this is cinema.`,
    ],
    "hype-beast": [
      `your neighbors filed 3 noise complaints because of ${topArtist}. ${bpm} BPM is just your resting heart rate fr.`,
      `${topTrack} came on and you started ascending. head empty, just bass, pure sigma energy.`,
    ],
    "classic-soul": [
      `${era} called — they want their vibe back. ${topArtist} proves they don't make 'em like this anymore. the industry fell off after your era.`,
      `you've explained why ${topArtist} is better than anything on the charts today. you had a 47-slide presentation. you were right.`,
    ],
    explorer: [
      `your spotify wrapped is gonna look like a UN assembly. ${artistCount} artists, ${topArtist} was tuesday's obsession — wednesday is a whole new genre.`,
      `${topArtist} next to ${secondArtist} makes zero sense to anyone except you. your algorithm has given up trying to categorize this. bussin.`,
    ],
    stan: [
      `${topArtist} is ${Math.round(popularity)}% of your personality and you're not even mad about it. you know the UNRELEASED tracks. you've seen the Google Drive.`,
      `someone: "i love ${topArtist}" you: "name 3 songs" them: "${topTrack}" you: *activates trap card* "name the demo version from 2019"`,
    ],
    "chill-vibes": [
      `${topTrack} at ${bpm} BPM is your form of meditation. very demure, very mindful, very ${topArtist} coded.`,
      `your playlist has cured ${artistCount} cases of anxiety. ${topArtist} is basically a prescription at this point. big pharma HATES this one trick.`,
    ],
  };

  const verdictTemplates: Record<string, string[]> = {
    curator: [
      `your friends send you songs like "do u know this?" and u always do. ${underground ? "underground royalty behavior." : "certified tastemaker activities."} rizz level: astronomical.`,
      `${topArtist} in YOUR rotation before they were cool. you didn't choose the tastemaker life — it chose you. no cap fr fr.`,
    ],
    "party-starter": [
      `${energy > 70 ? "absolute menace on the dance floor." : "controlled chaos on aux."} ${topTrack} is your secret weapon and you KNOW it. the function doesn't start until you arrive.`,
      `you've never met a silent room you couldn't fix. ${mainstream ? "main character energy maxed out." : "underground party architect."} ate and left no crumbs.`,
    ],
    "late-night-feels": [
      `your spotify wrapped is gonna expose you and you've made peace with that. ${mood > 60 ? "deep feeler, deeper catalog." : "emotionally tuned to perfection."} hits different at 2am.`,
      `${topArtist} understands the assignment every single time. emotional damage but make it a ${bpm} BPM banger. cinema.`,
    ],
    "hype-beast": [
      `${bpm} BPM is just warmup speed for you. ${topArtist} at max volume is a spiritual experience. neighbors called the cops — you called it a tuesday.`,
      `head empty, just bass. ${topTrack} on repeat until the structural integrity of your speakers is compromised. worth it.`,
    ],
    "classic-soul": [
      `you've explained why the original is better than the cover. multiple times. with citations. ${era} runs through your veins and honestly? they could never make ${topArtist} today.`,
      `${topArtist} is canon. this isn't nostalgia — it's recognizing quality that transcends decades. old head energy but your taste is actually bussin.`,
    ],
    explorer: [
      `"what genre do you listen to?" "${topArtist}" "that's not a genre" "exactly." ${artistCount} artists deep across the musical spectrum. algorithm in shambles.`,
      `your spotify pie chart is just static noise. ${topArtist} was march. ${secondArtist} is june. by september you'll be on mongolian throat singing. king/queen behavior.`,
    ],
    stan: [
      `when you love an artist, you LOVE an artist. ${topArtist} at 3x everyone else. casual listening? don't know her. we go DEEP into the catalog or not at all.`,
      `track 7 from ${topArtist}'s least popular album? you know every word. the unreleased demos? memorized. the dedication is honestly impressive — maybe concerning, but impressive.`,
    ],
    "chill-vibes": [
      `"your playlist got me through finals" — at least 3 people, probably. ${topArtist} is your zen master. very demure, very ${bpm} BPM, very mindful.`,
      `the chill is actually profound. your music isn't background noise — it's a whole environment. ${topArtist} is the reason ${artistCount} people have inner peace.`,
    ],
  };

  return {
    aura: pick(auraTemplates[archetype.id] || auraTemplates.curator),
    walkUpSong: `${topTrack} by ${topArtist} (${bpm} BPM, ${era} era, pure ${energy > 70 ? "hype" : mood > 60 ? "emotion" : "vibes"})`,
    hypothetical: `someone asks what you're listening to. you say "${topArtist}." they say "who?" you already know this conversation is about to change their life. you've done this before. you have a playlist ready.`,
    verdict: pick(verdictTemplates[archetype.id] || verdictTemplates.curator),
    phrases: [
      {
        phrase: `${topTrack} on loop = personality trait`,
        meaning: `${bpm} BPM of ${energy > 70 ? "pure uncut hype" : mood > 60 ? "raw emotional damage" : "immaculate vibes"}. this track has a permanent residency in your brain.`,
      },
      {
        phrase: `${topArtist} era — ${era} coded`,
        meaning: `${underground ? "underground legend status." : "you and " + Math.round(popularity) + "% of spotify agree on this one."} ${mainstream ? "basic? never. popular for a REASON." : "gatekeeping successfully."}`,
      },
      {
        phrase: `certified ${energy > 70 ? "hype beast" : mood > 60 ? "feels merchant" : "vibe curator"} activities`,
        meaning: `${artistCount} artists in rotation. ${energy > 70 ? "all gas no brakes." : mood > 60 ? "all feelings no filter." : "all chill no drama."} the algorithm fears you.`,
      },
    ],
    tags: [
      `${era} Soul`,
      energy > 70 ? "Hype Machine" : mood > 60 ? "Professional Feeler" : "Vibe Curator",
      underground ? "Gatekeeping King/Queen" : "Tastemaker General",
      `${topArtist.split(" ")[0]} Stan Account`,
    ],
  };
}
