"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult } from "@/lib/analysis";
import { TRAITS } from "@/lib/archetypes";
import { getVibeCheck } from "@/lib/slang";
import { useScrollReveal } from "@/lib/useScrollReveal";
import GenreRing from "@/components/GenreRing";
import PersonalityCard from "@/components/PersonalityCard";

/* ── Section wrapper with scroll-triggered reveal ── */
function Section({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal(0.1);
  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </section>
  );
}

/* ── Animated stat card ── */
function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const [counted, setCounted] = useState(0);
  const { ref, visible } = useScrollReveal(0.3);
  const numVal = typeof value === "string" ? parseInt(value) : value;

  useEffect(() => {
    if (!visible || isNaN(numVal)) return;
    const duration = 800;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounted(Math.round(numVal * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, numVal]);

  return (
    <div ref={ref} className="card-glass p-4 sm:p-5 text-center relative overflow-hidden group hover:bg-white/[0.06] transition-colors">
      <div className="absolute inset-x-0 top-0 h-px opacity-50" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums" style={{ fontFamily: "var(--font-righteous)" }}>
        {visible ? counted : 0}{typeof value === "string" && value.includes("%") ? "%" : ""}
        {label === "BPM" && visible ? ` ${value}` : label === "BPM" ? " ..." : ""}
      </div>
      <div className="text-[10px] sm:text-xs text-zinc-500 mt-1 uppercase tracking-widest">{label}</div>
      <div className="absolute inset-x-0 bottom-0 h-px opacity-0 group-hover:opacity-30 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    </div>
  );
}

/* ── Trait bar ── */
function TraitBar({ label, color, value, description }: { label: string; color: string; value: number; description: string }) {
  const { ref, visible } = useScrollReveal(0.1);
  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-end justify-between">
        <span className="text-white font-semibold text-sm">{label}</span>
        <span className="text-zinc-400 text-sm tabular-nums font-medium">{visible ? value : 0}%</span>
      </div>
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${visible ? value : 0}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 16px ${color}33`,
          }}
        />
      </div>
      <p className="text-xs text-zinc-600">{description}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("musicPersonality");
    if (!stored) { router.push("/"); return; }
    setData(JSON.parse(stored) as AnalysisResult);
    setTimeout(() => setReveal(true), 150);
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-0 h-0 rounded-full shadow-[0_0_60px_20px_rgba(29,185,84,0.3)] animate-pulse" />
      </div>
    );
  }

  const { archetype, traits, topArtists, topTracks, topGenres, stats } = data;
  const vibe = getVibeCheck(archetype);

  return (
    <div className="bg-[#0a0a0a]">
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-dvh flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,10,60,0.6)_0%,transparent_70%)]" />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl transition-all duration-1500 ${reveal ? "opacity-25 scale-100" : "opacity-0 scale-50"}`}
          style={{ background: `radial-gradient(circle, ${
            archetype.id === "party-starter" ? "#f97316" : archetype.id === "late-night-feels" ? "#6366f1" :
            archetype.id === "hype-beast" ? "#ef4444" : archetype.id === "classic-soul" ? "#f59e0b" :
            archetype.id === "explorer" ? "#10b981" : archetype.id === "stan" ? "#ec4899" :
            archetype.id === "chill-vibes" ? "#06b6d4" : "#8b5cf6"
          } 0%, transparent 70%)` }}
        />

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className={`transition-all duration-700 ${reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500 mb-4">{archetype.label}</p>
          </div>
          <div className={`transition-all duration-700 delay-150 ${reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <h1 className={`text-6xl sm:text-7xl md:text-8xl font-bold leading-[0.95] mb-8 bg-gradient-to-r bg-clip-text text-transparent ${archetype.gradient}`}
              style={{ fontFamily: "var(--font-righteous)" }}>
              {archetype.name}
            </h1>
          </div>
          <div className={`transition-all duration-700 delay-300 ${reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-lg mx-auto">{archetype.description}</p>
          </div>
          <div className={`mt-16 transition-all duration-700 delay-500 ${reveal ? "opacity-100" : "opacity-0"}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round" className="mx-auto animate-bounce"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <Section className="max-w-4xl mx-auto px-6 pb-16 -mt-8 relative z-10">
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Energy" value={`${stats.avgEnergy}%`} color="#fbbf24" />
          <StatCard label="Dance" value={`${stats.avgDanceability}%`} color="#f472b6" />
          <StatCard label="Mood" value={`${stats.avgValence}%`} color="#a78bfa" />
          <StatCard label="BPM" value={stats.avgTempo} color="#22d3ee" />
        </div>
      </Section>

      {/* ═══ TRAITS ═══ */}
      <Section className="max-w-2xl mx-auto px-6 py-16 border-t border-white/[0.05]">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Listening Profile</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "var(--font-righteous)" }}>
            Your Music DNA
          </h2>
        </div>
        <div className="space-y-5">
          {Object.entries(TRAITS).map(([key, t]) => (
            <TraitBar key={key} label={t.label} color={t.color} value={traits[key] || 50} description={t.description(traits[key] || 50)} />
          ))}
        </div>
      </Section>

      {/* ═══ GENRE RING ═══ */}
      <Section className="max-w-2xl mx-auto px-6 py-16 border-t border-white/[0.05]">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Genre Landscape</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "var(--font-righteous)" }}>
            Your Sound Map
          </h2>
        </div>
        <GenreRing genres={topGenres} visible />
      </Section>

      {/* ═══ TOP ARTISTS & TRACKS ═══ */}
      <Section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/[0.05]">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Heavy Rotation</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "var(--font-righteous)" }}>
            Your Top Picks
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          {/* Artists */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-600 mb-4">Top Artists</p>
            <div className="space-y-1.5">
              {topArtists.map((a, i) => (
                <div key={a.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group">
                  <span className="text-zinc-600 text-xs w-5 tabular-nums font-medium">{String(i + 1).padStart(2, "0")}</span>
                  {a.image ? (
                    <img src={a.image} alt="" className="w-10 h-10 rounded-lg object-cover ring-1 ring-white/5 group-hover:ring-white/10 transition-all" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/[0.02]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate group-hover:text-green-400 transition-colors">{a.name}</p>
                    {(a.genres || []).length > 0 && (
                      <p className="text-zinc-600 text-xs truncate">{(a.genres || []).slice(0, 2).join(" · ")}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Tracks */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-600 mb-4">Top Tracks</p>
            <div className="space-y-1.5">
              {topTracks.map((t, i) => (
                <div key={t.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group">
                  <span className="text-zinc-600 text-xs w-5 tabular-nums font-medium">{String(i + 1).padStart(2, "0")}</span>
                  {t.image ? (
                    <img src={t.image} alt="" className="w-10 h-10 rounded-lg object-cover ring-1 ring-white/5 group-hover:ring-white/10 transition-all" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/[0.02]" />
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
      </Section>

      {/* ═══ VIBE CHECK ═══ */}
      <Section className="max-w-2xl mx-auto px-6 py-16 border-t border-white/[0.05]">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Vibe Check</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "var(--font-righteous)" }}>
            What Your Taste Says
          </h2>
        </div>
        <div className="space-y-3">
          <div className="card-glass p-5">
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">Aura</p>
            <p className="text-base text-white font-medium">{vibe.aura}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="card-glass p-5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">Walk-up Song</p>
              <p className="text-sm text-zinc-300">{vibe.walkUpSong}</p>
            </div>
            <div className="card-glass p-5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">Scenario</p>
              <p className="text-sm text-zinc-300">{vibe.hypothetical}</p>
            </div>
          </div>
          {vibe.phrases.map((p) => (
            <div key={p.phrase} className="card-glass p-4 hover:bg-white/[0.05] transition-colors">
              <p className="text-white font-medium text-sm">&ldquo;{p.phrase}&rdquo;</p>
              <p className="text-zinc-500 text-xs mt-1">{p.meaning}</p>
            </div>
          ))}
          <div className="card-glass p-5 text-center">
            <p className="text-white font-medium text-sm">{vibe.verdict}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {vibe.tags.map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/[0.03] border border-white/[0.06] text-zinc-400">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ SHARE CARD ═══ */}
      <Section className="max-w-md mx-auto px-6 py-16 border-t border-white/[0.05]">
        <div className="text-center mb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Share</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "var(--font-righteous)" }}>
            Your Card
          </h2>
          <p className="text-zinc-500 text-sm mt-2">Screenshot and post it</p>
        </div>
        <PersonalityCard data={data} />
      </Section>

      {/* ═══ FOOTER ═══ */}
      <section className="text-center px-6 py-20 border-t border-white/[0.05]">
        <p className="text-zinc-400 leading-relaxed max-w-lg mx-auto mb-8 text-sm">{data.summary}</p>
        <button
          onClick={() => { sessionStorage.clear(); router.push("/"); }}
          className="spotify-btn"
        >
          Try Again
        </button>
        <p className="text-[10px] text-zinc-700 mt-10 uppercase tracking-widest">Powered by Spotify</p>
      </section>
    </div>
  );
}
