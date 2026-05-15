"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult } from "@/lib/analysis";
import { TRAITS } from "@/lib/archetypes";
import { getVibeCheck } from "@/lib/slang";
import PersonalityCard from "@/components/PersonalityCard";

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [reveal, setReveal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("musicPersonality");
    if (!stored) { router.push("/"); return; }
    const parsed = JSON.parse(stored) as AnalysisResult;
    setData(parsed);
    setTimeout(() => setReveal(true), 200);
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-green-500/30 border-t-green-500 animate-spin" />
      </div>
    );
  }

  const { archetype, traits, topArtists, topTracks, topGenres, stats } = data;
  const vibe = getVibeCheck(archetype);

  return (
    <div className="bg-[#0a0a0a]">
      {/* ── HERO ────────────────────────────── */}
      <section className="relative min-h-dvh flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0920] to-[#0a0a0a]" />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl transition-all duration-1000 ${reveal ? "opacity-25" : "opacity-0"}`}
          style={{ background: `radial-gradient(circle, ${
            archetype.id === "party-starter" ? "#f97316" :
            archetype.id === "late-night-feels" ? "#6366f1" :
            archetype.id === "hype-beast" ? "#ef4444" :
            archetype.id === "classic-soul" ? "#f59e0b" :
            archetype.id === "explorer" ? "#10b981" :
            archetype.id === "stan" ? "#ec4899" :
            archetype.id === "chill-vibes" ? "#06b6d4" : "#8b5cf6"
          } 0%, transparent 70%)` }}
        />

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className={`transition-all duration-700 ${reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">{archetype.label}</p>
          </div>
          <div className={`transition-all duration-700 delay-150 ${reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <h1 className={`text-6xl sm:text-7xl md:text-8xl font-bold leading-none mb-8 bg-gradient-to-r bg-clip-text text-transparent ${archetype.gradient}`}
              style={{ fontFamily: "var(--font-righteous)" }}>
              {archetype.name}
            </h1>
          </div>
          <div className={`transition-all duration-700 delay-300 ${reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-lg mx-auto">{archetype.description}</p>
          </div>
          <div className={`mt-16 transition-all duration-700 delay-500 ${reveal ? "opacity-100" : "opacity-0"}`}>
            <div className="inline-block animate-bounce">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ROW ───────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-20 -mt-12 relative z-10">
        <div className={`grid grid-cols-4 gap-3 transition-all duration-700 delay-500 ${reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {[
            { label: "Energy", value: `${stats.avgEnergy}%`, gradient: "from-amber-500 to-orange-500" },
            { label: "Dance", value: `${stats.avgDanceability}%`, gradient: "from-pink-500 to-rose-500" },
            { label: "Mood", value: `${stats.avgValence}%`, gradient: "from-violet-500 to-purple-500" },
            { label: "BPM", value: stats.avgTempo, gradient: "from-cyan-500 to-blue-500" },
          ].map((s) => (
            <div key={s.label} className="relative group">
              <div className="card-glass p-4 sm:p-5 text-center relative overflow-hidden">
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${s.gradient} opacity-50`} />
                <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums" style={{ fontFamily: "var(--font-righteous)" }}>
                  {s.value}
                </div>
                <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LISTENING PROFILE ───────────────── */}
      <section className="max-w-2xl mx-auto px-6 py-20 border-t border-white/[0.06]">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-righteous)" }}>Listening Profile</h2>
          <p className="text-zinc-500 text-sm">Six dimensions of your music taste</p>
        </div>
        <div className="space-y-5">
          {Object.entries(TRAITS).map(([key, trait], i) => (
            <TraitBar
              key={key}
              label={trait.label}
              color={trait.color}
              value={traits[key] || 50}
              description={trait.description(traits[key] || 50)}
              delay={i * 80}
            />
          ))}
        </div>
      </section>

      {/* ── TOP ARTISTS & TRACKS ────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-white/[0.06]">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-righteous)" }}>Your Rotation</h2>
          <p className="text-zinc-500 text-sm">The artists and tracks that defined your listening</p>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-5">Top Artists</p>
            <div className="space-y-2">
              {topArtists.map((a, i) => (
                <div key={a.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group">
                  <span className="text-zinc-700 text-xs w-5 tabular-nums font-medium">{String(i + 1).padStart(2, "0")}</span>
                  {a.image ? (
                    <img src={a.image} alt={a.name} className="w-11 h-11 rounded-lg object-cover ring-1 ring-white/5" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-white/[0.03]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate group-hover:text-green-400 transition-colors">{a.name}</p>
                    <p className="text-zinc-600 text-xs truncate">{(a.genres || []).slice(0, 2).join(" · ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-5">Top Tracks</p>
            <div className="space-y-2">
              {topTracks.map((t, i) => (
                <div key={t.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group">
                  <span className="text-zinc-700 text-xs w-5 tabular-nums font-medium">{String(i + 1).padStart(2, "0")}</span>
                  {t.image ? (
                    <img src={t.image} alt={t.name} className="w-11 h-11 rounded-lg object-cover ring-1 ring-white/5" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-white/[0.03]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate group-hover:text-green-400 transition-colors">{t.name}</p>
                    <p className="text-zinc-600 text-xs truncate">{t.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GENRES ──────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-white/[0.06]">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-righteous)" }}>Your Genres</h2>
          <p className="text-zinc-500 text-sm">The sounds that showed up the most</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {topGenres.map((genre, i) => {
            const colors = [
              "bg-white/[0.04] border-white/[0.08] text-zinc-300",
              "bg-purple-500/[0.06] border-purple-500/20 text-purple-300",
              "bg-cyan-500/[0.06] border-cyan-500/20 text-cyan-300",
              "bg-pink-500/[0.06] border-pink-500/20 text-pink-300",
              "bg-amber-500/[0.06] border-amber-500/20 text-amber-300",
              "bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-300",
              "bg-orange-500/[0.06] border-orange-500/20 text-orange-300",
              "bg-blue-500/[0.06] border-blue-500/20 text-blue-300",
            ];
            return (
              <span key={genre.name} className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all hover:scale-105 ${colors[i % colors.length]}`}>
                {genre.name}
              </span>
            );
          })}
        </div>
      </section>

      {/* ── VIBE CHECK ──────────────────────── */}
      <section className="max-w-2xl mx-auto px-6 py-20 border-t border-white/[0.06]">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-righteous)" }}>Vibe Check</h2>
          <p className="text-zinc-500 text-sm">What your music says about you, no cap</p>
        </div>

        <div className="space-y-4">
          <div className="card-glass p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">Your Aura</p>
            <p className="text-lg text-white font-medium">{vibe.aura}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card-glass p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">Walk-up Song</p>
              <p className="text-sm text-zinc-300">{vibe.walkUpSong}</p>
            </div>
            <div className="card-glass p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">The Scenario</p>
              <p className="text-sm text-zinc-300">{vibe.hypothetical}</p>
            </div>
          </div>

          <div className="space-y-2">
            {vibe.phrases.map((p) => (
              <div key={p.phrase} className="card-glass p-4 hover:bg-white/[0.06] transition-colors">
                <p className="text-white font-medium text-sm">&ldquo;{p.phrase}&rdquo;</p>
                <p className="text-zinc-500 text-xs mt-1">{p.meaning}</p>
              </div>
            ))}
          </div>

          <div className="card-glass p-5 text-center">
            <p className="text-white font-medium">{vibe.verdict}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {vibe.tags.map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-zinc-400">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHAREABLE CARD ──────────────────── */}
      <section ref={cardRef} className="max-w-md mx-auto px-6 py-20 border-t border-white/[0.06]">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-righteous)" }}>Share Your Results</h2>
          <p className="text-zinc-500 text-sm">Screenshot and post it</p>
        </div>
        <PersonalityCard data={data} />
      </section>

      {/* ── FOOTER ──────────────────────────── */}
      <section className="text-center px-6 py-20 border-t border-white/[0.06]">
        <p className="text-lg text-zinc-400 leading-relaxed max-w-lg mx-auto mb-10">{data.summary}</p>
        <button
          onClick={() => { sessionStorage.clear(); router.push("/"); }}
          className="spotify-btn"
        >
          Try Again
        </button>
        <p className="text-xs text-zinc-700 mt-8">
          Powered by Spotify
        </p>
      </section>
    </div>
  );
}

function TraitBar({ label, color, value, description, delay }: {
  label: string; color: string; value: number; description: string; delay: number;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 200 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <span className="text-white font-semibold text-sm">{label}</span>
        <span className="text-zinc-400 text-sm tabular-nums font-medium">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: color, boxShadow: `0 0 16px ${color}44`, transitionDelay: `${delay}ms` }}
        />
      </div>
      <p className="text-xs text-zinc-600">{description}</p>
    </div>
  );
}
