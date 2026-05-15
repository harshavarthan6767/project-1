"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult } from "@/lib/analysis";
import { TRAITS } from "@/lib/archetypes";
import { getVibeCheck } from "@/lib/slang";
import { useScrollReveal } from "@/lib/useScrollReveal";
import GenreRing from "@/components/GenreRing";
import PersonalityCard from "@/components/PersonalityCard";

/* ── Section wrapper ── */
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useScrollReveal(0.1);
  return (
    <section ref={ref} className={`transition-all duration-700 ease-out ${className}`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)" }}>
      {children}
    </section>
  );
}

/* ── Stat card with glass morphism ── */
function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const [counted, setCounted] = useState(0);
  const { ref, visible } = useScrollReveal(0.3);
  const numVal = typeof value === "string" ? parseInt(value) : value;

  useEffect(() => {
    if (!visible || isNaN(numVal)) return;
    let animId: number;
    const start = performance.now();
    const duration = 800;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounted(Math.round(numVal * eased));
      if (progress < 1) animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [visible, numVal]);

  const displayVal = typeof value === "string" ? `${visible ? counted : 0}%` : (label === "BPM" ? (visible ? value : "...") : (visible ? counted : 0));

  return (
    <div ref={ref} className="relative group">
      <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5 text-center
                      hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300">
        <div className="absolute inset-x-0 top-0 h-px opacity-50 rounded-xl"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
        <div className={`text-2xl sm:text-3xl font-bold text-white tabular-nums ${visible && counted === numVal ? "animate-pulse-glow" : ""}`}
          style={{ fontFamily: "var(--font-righteous)", animationDuration: "0.6s" }}>
          {displayVal}
        </div>
        <div className="text-[10px] sm:text-xs text-zinc-500 mt-1 uppercase tracking-widest">{label}</div>
      </div>
    </div>
  );
}

/* ── Trait bar with spring feel ── */
function TraitBar({ label, color, value, description, delay = 0 }: {
  label: string; color: string; value: number; description: string; delay?: number;
}) {
  const { ref, visible } = useScrollReveal(0.1);
  return (
    <div ref={ref} className="space-y-2" style={{ transitionDelay: `${delay}ms` }}>
      <div className="flex items-end justify-between">
        <span className="text-white font-semibold text-sm">{label}</span>
        <span className="text-zinc-400 text-sm tabular-nums font-medium">{visible ? value : 0}%</span>
      </div>
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${visible ? value : 0}%`,
            background: `linear-gradient(90deg, ${color}66, ${color})`,
            boxShadow: `0 0 14px ${color}33`,
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </div>
      <p className="text-xs text-zinc-600">{description}</p>
    </div>
  );
}

/* ── Diagonal divider ── */
function DiagonalDivider() {
  return (
    <div className="relative h-16 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0a]" style={{ clipPath: "polygon(0 0, 100% 40%, 100% 100%, 0 100%)" }} />
      <div className="absolute inset-0 bg-[#0a0a0a]" style={{ clipPath: "polygon(0 40%, 100% 0, 100% 40%, 0 75%)", background: "linear-gradient(180deg, rgba(255,255,255,0.015) 0%, transparent 100%)" }} />
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("musicPersonality");
    if (!stored) { router.push("/"); return; }
    setData(JSON.parse(stored) as AnalysisResult);
    setTimeout(() => setReveal(true), 150);
  }, [router]);

  // Scroll progress + sticky header
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setScrollProgress(total > 0 ? h.scrollTop / total : 0);
      setShowStickyHeader(h.scrollTop > window.innerHeight * 0.7);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      {/* ── Scroll Progress Bar ── */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 bg-white/[0.03]">
        <div className={`h-full bg-gradient-to-r ${archetype.gradient} transition-all duration-150`}
          style={{ width: `${scrollProgress * 100}%` }} />
      </div>

      {/* ── Sticky Mini Header ── */}
      <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        showStickyHeader ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}>
        <div className="backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/[0.05] px-6 py-3 flex items-center justify-center gap-3">
          <span className={`text-sm font-bold bg-gradient-to-r bg-clip-text text-transparent ${archetype.gradient}`}
            style={{ fontFamily: "var(--font-righteous)" }}>
            {archetype.name}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-600 bg-white/[0.03] px-2 py-0.5 rounded-full">
            {archetype.label}
          </span>
        </div>
      </div>

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-dvh flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-500/8 rounded-full blur-3xl" />

        {/* Radial glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl transition-all duration-1500 ${reveal ? "opacity-20 scale-100" : "opacity-0 scale-50"}`}
          style={{
            background: `radial-gradient(circle, ${
              archetype.id === "party-starter" ? "#f97316" : archetype.id === "late-night-feels" ? "#6366f1" :
              archetype.id === "hype-beast" ? "#ef4444" : archetype.id === "classic-soul" ? "#f59e0b" :
              archetype.id === "explorer" ? "#10b981" : archetype.id === "stan" ? "#ec4899" :
              archetype.id === "chill-vibes" ? "#06b6d4" : "#8b5cf6"
            } 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className={`transition-all duration-700 ${reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500 mb-4">{archetype.label}</p>
          </div>
          <div className={`transition-all duration-700 delay-150 ${reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <h1 className={`text-6xl sm:text-7xl md:text-8xl font-bold leading-[0.95] mb-8 bg-gradient-to-r bg-clip-text text-transparent ${archetype.gradient}`}
              style={{ fontFamily: "var(--font-righteous)", textShadow: "0 0 80px rgba(255,255,255,0.08)" }}>
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

      {/* ═══ STATS BAR (glassmorphism) ═══ */}
      <Section className="max-w-4xl mx-auto px-6 pb-16 -mt-8 relative z-10">
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Energy" value={`${stats.energy}%`} color="#fbbf24" />
          <StatCard label="Dance" value={`${stats.dance}%`} color="#f472b6" />
          <StatCard label="Mood" value={`${stats.mood}%`} color="#a78bfa" />
          <StatCard label="BPM" value={stats.bpm} color="#22d3ee" />
        </div>
      </Section>

      <DiagonalDivider />

      {/* ═══ TRAITS ═══ */}
      <Section className="max-w-2xl mx-auto px-6 py-20">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Listening Profile</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-righteous)" }}>
            Your Music DNA
          </h2>
        </div>
        <div className="space-y-5">
          {Object.entries(TRAITS).map(([key, t], i) => (
            <TraitBar key={key} label={t.label} color={t.color} value={traits[key] || 50}
              description={t.description(traits[key] || 50)} delay={i * 100} />
          ))}
        </div>
      </Section>

      <DiagonalDivider />

      {/* ═══ GENRE RING ═══ */}
      {topGenres.length > 0 ? (
        <Section className="max-w-2xl mx-auto px-6 py-20">
          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Genre Landscape</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-righteous)" }}>
              Your Sound Map
            </h2>
          </div>
          <GenreRing genres={topGenres} visible />
        </Section>
      ) : (
        <Section className="max-w-2xl mx-auto px-6 py-20">
          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Genre Landscape</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-righteous)" }}>
              Your Sound Map
            </h2>
          </div>
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-xl p-8 text-center">
            <p className="text-zinc-400 text-sm leading-relaxed">
              Spotify doesn&apos;t provide genre tags for your top artists yet — this is common for regional and independent music. Your listening profile is still fully analyzed from your artist and track data.
            </p>
          </div>
        </Section>
      )}

      <DiagonalDivider />

      {/* ═══ TOP ARTISTS & TRACKS ═══ */}
      <Section className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Heavy Rotation</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-righteous)" }}>
            Your Top Picks
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-600 mb-4">Top Artists</p>
            <div className="space-y-1.5">
              {topArtists.map((a, i) => (
                <div key={a.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group">
                  <span className="text-zinc-600 text-xs w-5 tabular-nums font-medium">{String(i + 1).padStart(2, "0")}</span>
                  <ImageWithSkeleton src={a.image} alt={a.name} className="w-10 h-10 rounded-lg" />
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
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-600 mb-4">Top Tracks</p>
            <div className="space-y-1.5">
              {topTracks.map((t, i) => (
                <div key={t.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group">
                  <span className="text-zinc-600 text-xs w-5 tabular-nums font-medium">{String(i + 1).padStart(2, "0")}</span>
                  <ImageWithSkeleton src={t.image} alt={t.name} className="w-10 h-10 rounded-lg" />
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

      <DiagonalDivider />

      {/* ═══ VIBE CHECK ═══ */}
      <Section className="max-w-2xl mx-auto px-6 py-20">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Vibe Check</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-righteous)" }}>
            What Your Taste Says
          </h2>
        </div>
        <div className="space-y-3">
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">Aura</p>
            <p className="text-base text-white font-medium">{vibe.aura}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">Walk-up Song</p>
              <p className="text-sm text-zinc-300">{vibe.walkUpSong}</p>
            </div>
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">Scenario</p>
              <p className="text-sm text-zinc-300">{vibe.hypothetical}</p>
            </div>
          </div>
          {vibe.phrases.map((p) => (
            <div key={p.phrase} className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
              <p className="text-white font-medium text-sm">&ldquo;{p.phrase}&rdquo;</p>
              <p className="text-zinc-500 text-xs mt-1">{p.meaning}</p>
            </div>
          ))}
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 text-center">
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

      <DiagonalDivider />

      {/* ═══ SHARE CARD ═══ */}
      <Section className="max-w-md mx-auto px-6 py-20">
        <div className="text-center mb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Share</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-righteous)" }}>
            Your Card
          </h2>
          <p className="text-zinc-500 text-sm mt-2">Save and post it anywhere</p>
        </div>
        <PersonalityCard data={data} />
      </Section>

      {/* ═══ FOOTER ═══ */}
      <section className="text-center px-6 py-20">
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

/* ── Image with skeleton placeholder ── */
function ImageWithSkeleton({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [loaded, setLoaded] = useState(false);
  if (!src) return <div className={`${className} bg-white/[0.02]`} />;
  return (
    <div className={`${className} relative overflow-hidden`}>
      {!loaded && (
        <div className="absolute inset-0 bg-white/[0.03] animate-pulse rounded-inherit"
          style={{ backgroundImage: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      )}
      <img src={src} alt={alt} className={`w-full h-full object-cover ring-1 ring-white/5 ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        onLoad={() => setLoaded(true)} />
    </div>
  );
}
