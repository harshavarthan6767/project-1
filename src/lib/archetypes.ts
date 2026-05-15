export interface Archetype {
  id: string;
  name: string;
  label: string;
  description: string;
  gradient: string;
  traits: Record<string, number>;
}

export const ARCHETYPES: Archetype[] = [
  {
    id: "curator",
    name: "The Curator",
    label: "Tastemaker",
    description:
      "You don't follow playlists — you build them. Your library runs deep with artists most people haven't discovered yet. If it's overplayed, you've already moved on.",
    gradient: "from-violet-600 via-purple-500 to-fuchsia-500",
    traits: { energy: 50, emotion: 60, curiosity: 95, nostalgia: 40, obscurity: 90, consistency: 20 },
  },
  {
    id: "party-starter",
    name: "The Energy",
    label: "High Energy",
    description:
      "Your playback is measured in BPM, not minutes. High-energy, dance-heavy, built for movement — someone puts you on aux and the room changes.",
    gradient: "from-orange-500 via-rose-500 to-pink-500",
    traits: { energy: 95, emotion: 70, curiosity: 50, nostalgia: 30, obscurity: 30, consistency: 60 },
  },
  {
    id: "late-night-feels",
    name: "The Feels",
    label: "Deep Listener",
    description:
      "Music isn't background noise for you — it's the main character. You gravitate toward songs that sit in minor keys and lyrics that hit at 2 AM.",
    gradient: "from-indigo-600 via-blue-500 to-cyan-400",
    traits: { energy: 20, emotion: 95, curiosity: 40, nostalgia: 60, obscurity: 50, consistency: 70 },
  },
  {
    id: "hype-beast",
    name: "The Hype",
    label: "Maximum Intensity",
    description:
      "Your listening peaks at 100. Hard hitting, loud, aggressive — you don't do background music. Every track is a statement.",
    gradient: "from-red-600 via-orange-500 to-yellow-500",
    traits: { energy: 98, emotion: 50, curiosity: 30, nostalgia: 20, obscurity: 40, consistency: 50 },
  },
  {
    id: "classic-soul",
    name: "The Timeless",
    label: "Old Soul",
    description:
      "The greats never left your rotation. Your library spans decades of iconic albums, legendary voices, and the records that defined entire eras.",
    gradient: "from-amber-600 via-yellow-500 to-orange-400",
    traits: { energy: 40, emotion: 70, curiosity: 30, nostalgia: 95, obscurity: 20, consistency: 80 },
  },
  {
    id: "explorer",
    name: "The Explorer",
    label: "Genre Nomad",
    description:
      "Your library looks like a world map. Every month brings a new scene, a new sound, a new rabbit hole — you're not loyal to a genre, you're loyal to discovery.",
    gradient: "from-emerald-500 via-teal-400 to-cyan-300",
    traits: { energy: 60, emotion: 50, curiosity: 98, nostalgia: 20, obscurity: 70, consistency: 10 },
  },
  {
    id: "stan",
    name: "The Devoted",
    label: "Ride or Die",
    description:
      "You don't just listen — you study. Every album cut, every B-side, every live version. When an artist clicks for you, you go through their entire catalog.",
    gradient: "from-pink-600 via-rose-500 to-red-400",
    traits: { energy: 65, emotion: 80, curiosity: 15, nostalgia: 50, obscurity: 60, consistency: 95 },
  },
  {
    id: "chill-vibes",
    name: "The Low Key",
    label: "Smooth Operator",
    description:
      "Your listening stays in the pocket — lo-fi, ambient, downtempo. Music that breathes. You've mastered the art of vibe curation.",
    gradient: "from-teal-600 via-cyan-500 to-blue-400",
    traits: { energy: 10, emotion: 40, curiosity: 55, nostalgia: 45, obscurity: 50, consistency: 75 },
  },
];

export interface TraitInfo {
  key: string;
  label: string;
  color: string;
  description: (value: number) => string;
}

export const TRAITS: Record<string, TraitInfo> = {
  energy: {
    key: "energy",
    label: "Energy",
    color: "#fbbf24",
    description: (v) =>
      v > 70 ? "Your listening is consistently high-octane" : v > 40 ? "You balance intensity with restraint" : "You keep it cool — low-key and steady",
  },
  emotion: {
    key: "emotion",
    label: "Depth",
    color: "#a78bfa",
    description: (v) =>
      v > 70 ? "You connect deeply — music is emotional first, everything else second" : v > 40 ? "Music hits when the moment is right" : "You value production and sound over emotional weight",
  },
  curiosity: {
    key: "curiosity",
    label: "Discovery",
    color: "#22d3ee",
    description: (v) =>
      v > 70 ? "Always digging — your library expands every week" : v > 40 ? "You explore, but you know your sound" : "You've found what works and you stick with it",
  },
  nostalgia: {
    key: "nostalgia",
    label: "Nostalgia",
    color: "#fb923c",
    description: (v) =>
      v > 70 ? "The classics are your home base — timeless over trending" : v > 40 ? "A solid mix of throwbacks and new releases" : "Forward-facing — you live in the now",
  },
  obscurity: {
    key: "obscurity",
    label: "Underground",
    color: "#f472b6",
    description: (v) =>
      v > 70 ? "Your top artists barely have Wikipedia pages" : v > 40 ? "A healthy split between mainstream and indie" : "You're not afraid of the Top 40 — hits are hits",
  },
  consistency: {
    key: "consistency",
    label: "Loyalty",
    color: "#34d399",
    description: (v) =>
      v > 70 ? "You go deep, not wide — when you find your artist, you commit" : v > 40 ? "A solid core rotation with room for newcomers" : "Your listening shifts with the seasons",
  },
};
