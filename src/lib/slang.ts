import type { Archetype } from "./archetypes";

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

const SLANG_DB: Record<string, VibeCheck> = {
  curator: {
    aura: "You're in your underground era and we're here for it",
    auraEmoji: "💿",
    walkUpSong: "Something with <5,000 monthly listeners that absolutely slaps",
    hypothetical: "You discover an artist before they blow up, and when they hit mainstream you're insufferable about it. As you should be.",
    verdict: "Certified tastemaker. Your friends send you songs asking 'do you know this?' and you always do.",
    phrases: [
      { phrase: "chronically online music taste", meaning: "You find music in places most people don't know exist" },
      { phrase: "gatekeeping is self-care", meaning: "Some artists are too good to share with the masses" },
      { phrase: "your discover weekly has no skips", meaning: "The algorithm knows you're that person" },
    ],
    tags: ["Tastemaker", "Gatekeeper", "Music Nerd", "Underground King/Queen"],
  },
  "party-starter": {
    aura: "You are the aux cord and the main character simultaneously",
    auraEmoji: "🔊",
    walkUpSong: "Anything above 120 BPM with a bass drop that rearranges your organs",
    hypothetical: "The function doesn't start until you walk in. Someone hands you the aux before you even ask.",
    verdict: "You've never met a silent room you couldn't fix. Absolute menace on the dance floor.",
    phrases: [
      { phrase: "letting the aux cord cook", meaning: "Your queue is a journey, not a playlist" },
      { phrase: "understood the assignment", meaning: "Every playlist you make is exactly what the moment needed" },
      { phrase: "no skips, all hits", meaning: "Your rotation is lethal from start to finish" },
    ],
    tags: ["Main Character", "Aux Cord Menace", "Party Starter", "Energy Dealer"],
  },
  "late-night-feels": {
    aura: "You're in your feelings era and honestly? The art is better here",
    auraEmoji: "🌧️",
    walkUpSong: "Something in a minor key that makes you stare at the ceiling at 2 AM",
    hypothetical: "You have a playlist called 'songs to cry in the rain to' and it has 47 saves from strangers who Get It.",
    verdict: "Your Spotify Wrapped is going to expose you and you've made peace with that.",
    phrases: [
      { phrase: "in your sad boi/girl hours", meaning: "You process emotions through music and we respect the craft" },
      { phrase: "the vibes are immaculate but devastating", meaning: "Beautiful songs that wreck you emotionally" },
      { phrase: "sitting with the feeling", meaning: "You don't skip the sad songs — you lean in" },
    ],
    tags: ["Deep Feeler", "2 AM Playlist Curator", "Emotional Architect", "Mood Master"],
  },
  "hype-beast": {
    aura: "You listen to music like you're training for a boss fight",
    auraEmoji: "💥",
    walkUpSong: "Something that would play during the final battle in an anime",
    hypothetical: "Your gym playlist has accidentally become the workout soundtrack for half your friends.",
    verdict: "Your neighbors know your top 5 artists. Not by choice, but they know.",
    phrases: [
      { phrase: "going absolutely feral", meaning: "That drop hit and you are no longer in control of your body" },
      { phrase: "this goes unbelievably hard", meaning: "The track is so intense it should be studied" },
      { phrase: "head empty, just bass", meaning: "Sometimes you just need to feel the kick drum in your chest" },
    ],
    tags: ["Hype Machine", "Mosh Pit Ready", "Intensity Maxed", "Bass Dealer"],
  },
  "classic-soul": {
    aura: "You were born in the wrong decade and your playlists prove it",
    auraEmoji: "📼",
    walkUpSong: "Something released before you were born that still hits harder than anything on the charts",
    hypothetical: "You've explained to someone why the original is better than the cover. Multiple times. You had receipts.",
    verdict: "You don't just listen to classics — you study them. Your music knowledge runs decades deep.",
    phrases: [
      { phrase: "they don't make 'em like this anymore", meaning: "You have a deep appreciation for the golden era of music" },
      { phrase: "old head energy, new gen respect", meaning: "You bridge generations with your taste" },
      { phrase: "vintage vibes, timeless taste", meaning: "Your rotation is a museum of certified classics" },
    ],
    tags: ["Old Soul", "Vinyl Collector Energy", "Music Historian", "Timeless Taste"],
  },
  explorer: {
    aura: "Your genre loyalty is nonexistent and that's your superpower",
    auraEmoji: "🌍",
    walkUpSong: "Something in a language you don't speak from a genre you can't pronounce",
    hypothetical: "Your Spotify pie chart looks like a bag of Skittles. Every week is a new musical obsession.",
    verdict: "You've never had a 'favorite genre' and you never will. The world is too big for that.",
    phrases: [
      { phrase: "genre? never heard of her", meaning: "Labels are too small for your musical universe" },
      { phrase: "algorithm in shambles", meaning: "Spotify cannot figure you out and that's the point" },
      { phrase: "collecting sounds like Pokémon", meaning: "Every genre is a new discovery waiting to happen" },
    ],
    tags: ["Genre Nomad", "Algorithm Breaker", "Musical Polyglot", "Rabbit Hole Diver"],
  },
  stan: {
    aura: "When you love an artist, you LOVE an artist. No casual listening here.",
    auraEmoji: "🎯",
    walkUpSong: "Track 7 from your favorite artist's least popular album — and you know every word",
    hypothetical: "Someone says they 'love' your favorite artist but only knows 2 songs. You smile politely. Inside, you're screaming.",
    verdict: "Your Spotify stats show one artist at 3x everything else. You contain multitudes — all of them about this one artist.",
    phrases: [
      { phrase: "I fear you've committed to the deep catalog", meaning: "You don't just know the hits, you know the B-sides, the unreleased, the demo versions"},
      { phrase: "casual listening not found", meaning: "Every listen is an intentional experience" },
      { phrase: "the dedication is honestly impressive", meaning: "Your loyalty to your fave is unmatched" },
    ],
    tags: ["Day One Fan", "Deep Catalog Explorer", "Superfan Mode", "Discography Completionist"],
  },
  "chill-vibes": {
    aura: "You're the human embodiment of a weighted blanket",
    auraEmoji: "🌿",
    walkUpSong: "Something lo-fi with rain sounds in the background that makes everyone exhale",
    hypothetical: "You've been told 'your playlist helped me through finals week' at least three times.",
    verdict: "Your music isn't background noise — it's a whole environment. You curate peace.",
    phrases: [
      { phrase: "vibes are curated, not captured", meaning: "Every song in your rotation is intentionally placed" },
      { phrase: "the chill is actually profound", meaning: "People think your taste is simple but it's intentionally crafted" },
      { phrase: "in your zen bag", meaning: "You're locked into a state of musical tranquility" },
    ],
    tags: ["Vibe Curator", "Lo-fi Royalty", "Ambient Architect", "Zen Master"],
  },
};

export function getVibeCheck(archetype: Archetype): VibeCheck {
  return SLANG_DB[archetype.id] || SLANG_DB.curator;
}

export function getRandomTag(archetype: Archetype): string {
  const check = getVibeCheck(archetype);
  return check.tags[Math.floor(Math.random() * check.tags.length)];
}
