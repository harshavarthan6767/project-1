export interface Archetype {
  id: string;
  name: string;
  emoji: string;
  description: string;
  gradient: string;
  traits: Record<string, number>;
}

export const ARCHETYPES: Archetype[] = [
  {
    id: "curator",
    name: "The Curator",
    emoji: "🎭",
    description:
      "Your taste is a carefully curated gallery. You dig deep for hidden gems and have an ear for what's genuinely good — not just what's popular.",
    gradient: "from-violet-600 via-purple-500 to-fuchsia-500",
    traits: { energy: 50, emotion: 60, curiosity: 95, nostalgia: 40, obscurity: 90, consistency: 20 },
  },
  {
    id: "party-starter",
    name: "The Party Starter",
    emoji: "🎪",
    description:
      "You're the energy in every room. Your playlist is built for movement — high BPM, big drops, and zero chance of a dull moment.",
    gradient: "from-orange-500 via-rose-500 to-pink-500",
    traits: { energy: 95, emotion: 70, curiosity: 50, nostalgia: 30, obscurity: 30, consistency: 60 },
  },
  {
    id: "late-night-feels",
    name: "Late Night Feels",
    emoji: "🌙",
    description:
      "Music is your emotional language. You lean into the melancholy, the introspection, the songs that understand what words can't say.",
    gradient: "from-indigo-600 via-blue-500 to-cyan-400",
    traits: { energy: 20, emotion: 95, curiosity: 40, nostalgia: 60, obscurity: 50, consistency: 70 },
  },
  {
    id: "hype-beast",
    name: "The Hype Beast",
    emoji: "🔥",
    description:
      "Maximum intensity, all the time. Your music is the soundtrack to domination — aggressive, loud, and unapologetically bold.",
    gradient: "from-red-600 via-orange-500 to-yellow-500",
    traits: { energy: 98, emotion: 50, curiosity: 30, nostalgia: 20, obscurity: 40, consistency: 50 },
  },
  {
    id: "classic-soul",
    name: "The Classic Soul",
    emoji: "🎸",
    description:
      "You've got timeless taste. The legends, the golden eras, the albums that shaped everything after — that's your musical home.",
    gradient: "from-amber-600 via-yellow-500 to-orange-400",
    traits: { energy: 40, emotion: 70, curiosity: 30, nostalgia: 95, obscurity: 20, consistency: 80 },
  },
  {
    id: "explorer",
    name: "The Explorer",
    emoji: "🌈",
    description:
      "Genres are just labels and you refuse to be boxed in. Your listening history is a world map of sound — always discovering, always expanding.",
    gradient: "from-emerald-500 via-teal-400 to-cyan-300",
    traits: { energy: 60, emotion: 50, curiosity: 98, nostalgia: 20, obscurity: 70, consistency: 10 },
  },
  {
    id: "stan",
    name: "The Devoted Stan",
    emoji: "💎",
    description:
      "When you find an artist you love, you go ALL in. Every album, every B-side, every live recording — your loyalty runs deep.",
    gradient: "from-pink-600 via-rose-500 to-red-400",
    traits: { energy: 65, emotion: 80, curiosity: 15, nostalgia: 50, obscurity: 60, consistency: 95 },
  },
  {
    id: "chill-vibes",
    name: "Chill Vibes Only",
    emoji: "🌊",
    description:
      "You're the calm in the chaos. Lo-fi beats, ambient textures, smooth grooves — your music is a deep breath in a loud world.",
    gradient: "from-teal-600 via-cyan-500 to-blue-400",
    traits: { energy: 10, emotion: 40, curiosity: 55, nostalgia: 45, obscurity: 50, consistency: 75 },
  },
];

export interface TraitInfo {
  key: string;
  label: string;
  emoji: string;
  description: (value: number) => string;
}

export const TRAITS: Record<string, TraitInfo> = {
  energy: {
    key: "energy",
    label: "Energy",
    emoji: "⚡",
    description: (v) =>
      v > 70 ? "High-octane, all-gas-no-brakes energy" : v > 40 ? "Balanced vibes with occasional fire" : "Cool, calm, and collected",
  },
  emotion: {
    key: "emotion",
    label: "Emotional Depth",
    emoji: "💜",
    description: (v) =>
      v > 70 ? "You FEEL everything deeply through music" : v > 40 ? "Music hits you when it matters" : "You're here for the sound, not the feels",
  },
  curiosity: {
    key: "curiosity",
    label: "Musical Curiosity",
    emoji: "🔍",
    description: (v) =>
      v > 70 ? "Always digging, always discovering new sounds" : v > 40 ? "Open to new music but you know what you like" : "You've found your lane and you're staying in it",
  },
  nostalgia: {
    key: "nostalgia",
    label: "Nostalgia",
    emoji: "📻",
    description: (v) =>
      v > 70 ? "Living in the golden era — classics never die" : v > 40 ? "A healthy mix of old and new" : "The future of music is now",
  },
  obscurity: {
    key: "obscurity",
    label: "Obscurity",
    emoji: "🪐",
    description: (v) =>
      v > 70 ? "If it's got more than 10k streams, it's too mainstream" : v > 40 ? "You balance popular with undiscovered" : "Top 40 and proud — hits are hits for a reason",
  },
  consistency: {
    key: "consistency",
    label: "Loyalty",
    emoji: "🎯",
    description: (v) =>
      v > 70 ? "You ride hard for your favorites — deep catalog diver" : v > 40 ? "You've got your go-tos but mix it up" : "Every day is a new musical adventure",
  },
};
