"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult } from "@/lib/analysis";
import { TRAITS } from "@/lib/archetypes";
import PersonalityCard from "@/components/PersonalityCard";
import TraitBar from "@/components/TraitBar";

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [reveal, setReveal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("musicPersonality");
    if (!stored) {
      router.push("/");
      return;
    }
    const parsed = JSON.parse(stored) as AnalysisResult;
    setData(parsed);
    setTimeout(() => setReveal(true), 300);
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const { archetype, traits, topArtists, topTracks, topGenres, stats, summary } = data;

  const handleShare = async () => {
    if (cardRef.current) {
      // Scroll card into view for screenshot
      cardRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-dvh bg-[#0a0a0a] pb-24">
      {/* Hero section with archetype reveal */}
      <section className="relative min-h-dvh flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 animated-gradient opacity-70" />
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl transition-all duration-1000 ${reveal ? "opacity-30" : "opacity-0"}`}
          style={{ background: `linear-gradient(135deg, ${archetype.id === "party-starter" ? "#f97316" : archetype.id === "late-night-feels" ? "#6366f1" : archetype.id === "hype-beast" ? "#ef4444" : archetype.id === "classic-soul" ? "#f59e0b" : archetype.id === "explorer" ? "#10b981" : archetype.id === "stan" ? "#ec4899" : archetype.id === "chill-vibes" ? "#06b6d4" : "#8b5cf6"}, ${archetype.id === "party-starter" ? "#f43f5e" : archetype.id === "late-night-feels" ? "#0ea5e9" : archetype.id === "hype-beast" ? "#f97316" : archetype.id === "classic-soul" ? "#eab308" : archetype.id === "explorer" ? "#06b6d4" : archetype.id === "stan" ? "#f43f5e" : archetype.id === "chill-vibes" ? "#6366f1" : "#d946ef"})` }}
        />

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          {/* Archetype emoji */}
          <div className={`transition-all duration-700 ${reveal ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
            <div className="text-7xl mb-6">{archetype.emoji}</div>
          </div>

          {/* Archetype name */}
          <div className={`transition-all duration-700 delay-200 ${reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-zinc-400 text-sm uppercase tracking-widest mb-3">Your Music Archetype</p>
            <h1
              className={`text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent ${archetype.gradient}`}
              style={{ fontFamily: "var(--font-righteous)" }}
            >
              {archetype.name}
            </h1>
          </div>

          {/* Description */}
          <div className={`transition-all duration-700 delay-400 ${reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-lg text-zinc-300 leading-relaxed max-w-xl mx-auto">
              {archetype.description}
            </p>
          </div>

          {/* Scroll hint */}
          <div className={`mt-12 transition-all duration-700 delay-700 ${reveal ? "opacity-100" : "opacity-0"}`}>
            <p className="text-zinc-600 text-sm animate-bounce">scroll to explore ↓</p>
          </div>
        </div>
      </section>

      {/* Trait Breakdown */}
      <section className="max-w-2xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-righteous)" }}>
          Your Music DNA
        </h2>
        <p className="text-zinc-500 mb-10">Six dimensions that define your listening personality</p>

        <div className="space-y-6">
          {Object.entries(TRAITS).map(([key, trait], i) => (
            <TraitBar
              key={key}
              label={trait.label}
              emoji={trait.emoji}
              value={traits[key] || 50}
              description={trait.description(traits[key] || 50)}
              delay={i * 100}
            />
          ))}
        </div>
      </section>

      {/* Top Artists & Tracks */}
      <section className="max-w-2xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="grid sm:grid-cols-2 gap-12">
          {/* Top Artists */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-righteous)" }}>
              Top Artists
            </h3>
            <div className="space-y-3">
              {topArtists.map((artist, i) => (
                <div key={artist.name} className="card-glass p-3 flex items-center gap-3 group hover:bg-white/[0.06] transition-colors">
                  <span className="text-zinc-600 text-sm w-5 tabular-nums">{i + 1}</span>
                  {artist.image ? (
                    <img src={artist.image} alt={artist.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-600 text-xs">N/A</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{artist.name}</p>
                    <p className="text-zinc-500 text-xs truncate">{artist.genres.slice(0, 2).join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Tracks */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-righteous)" }}>
              Top Tracks
            </h3>
            <div className="space-y-3">
              {topTracks.map((track, i) => (
                <div key={track.name} className="card-glass p-3 flex items-center gap-3 group hover:bg-white/[0.06] transition-colors">
                  <span className="text-zinc-600 text-sm w-5 tabular-nums">{i + 1}</span>
                  {track.image ? (
                    <img src={track.image} alt={track.name} className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-zinc-600 text-xs">N/A</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{track.name}</p>
                    <p className="text-zinc-500 text-xs truncate">{track.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top Genres */}
      <section className="max-w-2xl mx-auto px-6 py-20 border-t border-white/5">
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-righteous)" }}>
          Genre Landscape
        </h2>
        <p className="text-zinc-500 mb-8">The sounds that define your taste</p>
        <div className="flex flex-wrap gap-2">
          {topGenres.map((genre) => (
            <span
              key={genre.name}
              className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-colors"
            >
              {genre.name}
              <span className="text-zinc-600 ml-1.5">{genre.count}</span>
            </span>
          ))}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="max-w-2xl mx-auto px-6 py-20 border-t border-white/5">
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-righteous)" }}>
          By the Numbers
        </h2>
        <p className="text-zinc-500 mb-8">Your listening profile in stats</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Avg Energy", value: `${stats.avgEnergy}%`, emoji: "⚡" },
            { label: "Danceability", value: `${stats.avgDanceability}%`, emoji: "💃" },
            { label: "Mood", value: `${stats.avgValence}%`, emoji: "😊" },
            { label: "Avg Tempo", value: `${stats.avgTempo} BPM`, emoji: "🎵" },
            { label: "Artists", value: stats.totalArtists, emoji: "🎤" },
            { label: "Tracks", value: stats.totalTracks, emoji: "🎶" },
            { label: "Top Era", value: stats.topDecade, emoji: "📅" },
            { label: "Genres", value: stats.genreDiversity, emoji: "🎨" },
          ].map((stat) => (
            <div key={stat.label} className="card-glass p-4 text-center">
              <div className="text-2xl mb-1">{stat.emoji}</div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-xs text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Shareable Card */}
      <section ref={cardRef} className="max-w-md mx-auto px-6 py-20 border-t border-white/5">
        <h2 className="text-2xl font-bold text-white mb-2 text-center" style={{ fontFamily: "var(--font-righteous)" }}>
          Your Personality Card
        </h2>
        <p className="text-zinc-500 mb-8 text-center">Screenshot and share this with your friends</p>
        <PersonalityCard data={data} />
        <div className="text-center mt-6">
          <button
            onClick={handleShare}
            className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all text-sm"
          >
            📸 Screenshot Ready
          </button>
        </div>
      </section>

      {/* Summary */}
      <section className="max-w-2xl mx-auto px-6 py-20 border-t border-white/5 text-center">
        <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-righteous)" }}>
          The Verdict
        </h2>
        <p className="text-lg text-zinc-300 leading-relaxed">{summary}</p>
        <button
          onClick={() => {
            sessionStorage.clear();
            router.push("/");
          }}
          className="mt-10 spotify-btn"
        >
          Try Again
        </button>
      </section>
    </div>
  );
}
