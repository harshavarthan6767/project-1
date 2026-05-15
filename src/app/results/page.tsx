"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult } from "@/lib/analysis";
import { TRAITS } from "@/lib/archetypes";
import { getVibeCheck, getRegionArchetypeLabel } from "@/lib/slang";
import GenreRing from "@/components/GenreRing";
import PersonalityCard from "@/components/PersonalityCard";

/* ── Section wrapper ── */
function Section({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <section className={`animate-fade-up ${className}`}
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}>
      {children}
    </section>
  );
}

/* ── Stat card with glass morphism + count-up animation ── */
function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const [counted, setCounted] = useState(0);
  const numVal = typeof value === "string" ? parseInt(value) : value;

  useEffect(() => {
    if (isNaN(numVal)) return;
    const timer = setTimeout(() => {
      let animId: number;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / 800, 1);
        setCounted(Math.round(numVal * (1 - Math.pow(1 - p, 3))));
        if (p < 1) animId = requestAnimationFrame(tick);
      };
      animId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(animId);
    }, 300);
    return () => clearTimeout(timer);
  }, [numVal]);

  const displayVal = typeof value === "string"
    ? `${counted}%`
    : (label === "BPM" ? value : counted);

  return (
    <div className="relative group">
      <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5 text-center
                      hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300">
        <div className="absolute inset-x-0 top-0 h-px opacity-50 rounded-xl"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
        <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums"
          style={{ fontFamily: "var(--font-righteous)" }}>
          {displayVal}
        </div>
        <div className="text-[10px] sm:text-xs text-zinc-500 mt-1 uppercase tracking-widest">{label}</div>
      </div>
    </div>
  );
}

/* ── Trait bar with spring animation ── */
function TraitBar({ label, color, value, description, delay = 0 }: {
  label: string; color: string; value: number; description: string; delay?: number;
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
        <span className="text-zinc-400 text-sm tabular-nums font-medium">{width}%</span>
      </div>
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${width}%`,
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
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("musicPersonality");
    if (!stored) { router.push("/"); return; }
    setData(JSON.parse(stored) as AnalysisResult);
    setTimeout(() => setReveal(true), 150);
  }, [router]);

  // Scroll progress (DOM-based, no re-render) + sticky header (throttled)
  useEffect(() => {
    let rafId: number;
    let lastSticky = false;
    const onScroll = () => {
      // Update progress bar directly via DOM — avoids React re-renders
      if (progressRef.current) {
        const h = document.documentElement;
        const total = h.scrollHeight - h.clientHeight;
        const pct = total > 0 ? (h.scrollTop / total) * 100 : 0;
        progressRef.current.style.width = `${pct}%`;
      }
      // Sticky header — throttled via rAF, only when value changes
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          const sticky = document.documentElement.scrollTop > window.innerHeight * 0.7;
          if (sticky !== lastSticky) { setShowStickyHeader(sticky); lastSticky = sticky; }
          rafId = 0;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (rafId) cancelAnimationFrame(rafId); };
  }, []);

  if (!data) {
    return (
      <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-green-500/30 border-t-green-500 animate-spin" />
      </div>
    );
  }

  const { archetype, traits, topArtists, topTracks, topGenres, stats } = data;
  const vibe = getVibeCheck(archetype, data);
  const userName = data.userName || "";
  const displayGenres = topGenres.length > 0 ? topGenres : (data.aiGenres || []);
  const regionLabel = getRegionArchetypeLabel(archetype.id, data) || archetype.label;

  // Rich gradient colors per archetype
  const archColors: Record<string, { from: string; mid: string; to: string; blob1: string; blob2: string }> = {
    "party-starter": { from: "#0a0a0a", mid: "#1a0f08", to: "#0d0804", blob1: "rgba(249,115,22,0.12)", blob2: "rgba(244,63,94,0.08)" },
    "late-night-feels": { from: "#0a0a0a", mid: "#0f0a1e", to: "#080610", blob1: "rgba(99,102,241,0.12)", blob2: "rgba(14,165,233,0.08)" },
    "hype-beast": { from: "#0a0a0a", mid: "#1a0808", to: "#0d0404", blob1: "rgba(239,68,68,0.12)", blob2: "rgba(249,115,22,0.08)" },
    "classic-soul": { from: "#0a0a0a", mid: "#140e06", to: "#0a0704", blob1: "rgba(245,158,11,0.12)", blob2: "rgba(234,179,8,0.08)" },
    explorer: { from: "#0a0a0a", mid: "#081a14", to: "#040d0a", blob1: "rgba(16,185,129,0.12)", blob2: "rgba(6,182,212,0.08)" },
    stan: { from: "#0a0a0a", mid: "#1a0816", to: "#0d040b", blob1: "rgba(236,72,153,0.12)", blob2: "rgba(244,63,94,0.08)" },
    "chill-vibes": { from: "#0a0a0a", mid: "#08141a", to: "#040a0d", blob1: "rgba(6,182,212,0.12)", blob2: "rgba(99,102,241,0.08)" },
    curator: { from: "#0a0a0a", mid: "#10081e", to: "#080410", blob1: "rgba(139,92,246,0.12)", blob2: "rgba(217,70,239,0.08)" },
  };
  const colors = archColors[archetype.id] || archColors.curator;

  return (
    <div className="relative" style={{ background: `linear-gradient(180deg, ${colors.from} 0%, ${colors.mid} 35%, ${colors.to} 65%, ${colors.from} 100%)` }}>
      {/* Ambient light blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] animate-[float_20s_ease-in-out_infinite]"
          style={{ background: colors.blob1, top: "-10%", left: "-15%", animationDelay: "0s" }} />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[100px] animate-[float_25s_ease-in-out_infinite]"
          style={{ background: colors.blob2, bottom: "-10%", right: "-10%", animationDelay: "-7s" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[90px] animate-[float_22s_ease-in-out_infinite]"
          style={{ background: colors.blob1, top: "50%", left: "40%", animationDelay: "-14s", opacity: 0.6 }} />
      </div>

      {/* Content wrapper */}
      <div className="relative" style={{ zIndex: 1 }}>
      {/* ── Scroll Progress Bar (DOM-updated, no React re-render) ── */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 bg-white/[0.03]">
        <div ref={progressRef} className={`h-full bg-gradient-to-r ${archetype.gradient}`}
          style={{ width: "0%", transition: "width 0.1s linear" }} />
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
            {regionLabel}
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
            <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500 mb-4">{regionLabel}</p>
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
      {displayGenres.length > 0 ? (
        <Section className="max-w-2xl mx-auto px-6 py-20">
          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Genre Landscape</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-righteous)" }}>
              Your Sound Map
            </h2>
          </div>
          <GenreRing genres={displayGenres} visible />
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
              Genre data unavailable for your artists. This is common for regional and independent music.
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
                <a key={t.name}
                  href={t.id ? `https://open.spotify.com/track/${t.id}` : undefined}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group cursor-pointer">
                  <span className="text-zinc-600 text-xs w-5 tabular-nums font-medium">{String(i + 1).padStart(2, "0")}</span>
                  <ImageWithSkeleton src={t.image} alt={t.name} className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate group-hover:text-green-400 transition-colors">{t.name}</p>
                    <p className="text-zinc-600 text-xs truncate">{t.artist}</p>
                  </div>
                  <svg className="w-3.5 h-3.5 text-zinc-700 group-hover:text-green-400 transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <DiagonalDivider />

      {/* ═══ SPOTIFY PLAYERS ═══ */}
      <Section className="max-w-2xl mx-auto px-6 py-20">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Listen Now</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-righteous)" }}>
            Press Play
          </h2>
        </div>
        <div className="space-y-3">
          {data.topTracks.map((track) => (
            <div key={track.id} className="card-glass overflow-hidden">
              <iframe
                title={track.name}
                src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="w-full"
              />
            </div>
          ))}
        </div>
        <SavePlaylistButton trackIds={data.topTracks.map((t) => t.id)} />
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
        <PersonalityCard data={data} userName={userName} regionLabel={regionLabel} />
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
    </div>
  );
}

/* ── Save as Spotify Playlist button ── */
function SavePlaylistButton({ trackIds }: { trackIds: string[] }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/spotify/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackIds, name: "My Music Personality Top 5" }),
      });
      const data = await res.json();
      if (data.playlistUrl) {
        setPlaylistUrl(data.playlistUrl);
        setSaved(true);
      }
    } catch { /* failed */ }
    finally { setSaving(false); }
  };

  if (saved && playlistUrl) {
    return (
      <div className="mt-4 text-center">
        <a href={playlistUrl} target="_blank" rel="noopener noreferrer"
          className="spotify-btn text-sm">
          Open in Spotify
        </a>
      </div>
    );
  }

  return (
    <div className="mt-4 text-center">
      <button onClick={handleSave} disabled={saving}
        className="px-6 py-3 rounded-full bg-white/[0.04] border border-white/10 text-white text-sm font-medium
                   hover:bg-white/[0.08] hover:border-white/20 transition-all active:scale-[0.98]
                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto">
        {saving ? (
          <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating Playlist...</>
        ) : (
          <><svg width="16" height="16" viewBox="0 0 24 24" fill="#1db954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>Save as Spotify Playlist</>
        )}
      </button>
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
