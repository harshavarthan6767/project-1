"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { AnalysisResult } from "@/lib/analysis";

interface Props {
  data: AnalysisResult;
  userName?: string;
  regionLabel?: string;
  showExport?: boolean;
}

const BRAINROT: Record<string, string[]> = {
  curator: ["gatekeeping is self-care", "your daylist is a museum", "discover weekly cooked here"],
  "party-starter": ["aux cord final boss", "the blend playlist energy", "daylist: 100% bangers"],
  "late-night-feels": ["sad boi hours certified", "daylist: melancholy maxxing", "blend playlist: therapy session"],
  "hype-beast": ["daylist: feral mode", "spotify wrapped gonna be wild", "blend playlist: no chill edition"],
  "classic-soul": ["daylist: timeless only", "wrapped: all classics", "blend: vintage supremacy"],
  explorer: ["daylist: genre roulette", "discover weekly MVP", "wrapped: 47 genres"],
  stan: ["daylist: one artist only", "blend: 95% same artist", "wrapped: no surprises here"],
  "chill-vibes": ["daylist: very demure", "blend: chill only", "wrapped: most relaxed listener"],
};

export default function PersonalityCard({ data, userName, regionLabel, showExport = true }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const { archetype, traits, topArtists, topTracks, stats } = data;
  const topArtist = topArtists[0]?.name || "your fave";
  const topTrack = topTracks[0]?.name || "your anthem";
  const slang = BRAINROT[archetype.id] || BRAINROT.curator;
  const randomSlang = slang[Math.floor(Math.random() * slang.length)];

  const traitLabels: Record<string, string> = {
    energy: "Energy", emotion: "Depth", curiosity: "Discovery",
    nostalgia: "Nostalgia", obscurity: "Underground", consistency: "Loyalty",
  };
  const traitColors: Record<string, string> = {
    energy: "#fbbf24", emotion: "#a78bfa", curiosity: "#22d3ee",
    nostalgia: "#fb923c", obscurity: "#f472b6", consistency: "#34d399",
  };

  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#0a0a0f" });
      const link = document.createElement("a");
      link.download = `music-personality-${archetype.id}.png`;
      link.href = dataUrl; link.click();
      setExported(true); setTimeout(() => setExported(false), 2000);
    } catch { /* fallback */ } finally { setExporting(false); }
  };

  return (
    <div>
      {/* Share Card — SoundSoul-inspired premium layout */}
      <div ref={cardRef}
        className="rounded-3xl p-10 relative overflow-hidden border border-white/[0.06]"
        style={{
          background: "linear-gradient(135deg, #0d1117 0%, #111827 40%, #0d1117 100%)",
        }}>
        {/* Radial glow corners */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 50% at 0% 0%, rgba(29,185,84,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 100% 100%, rgba(132,94,247,0.12) 0%, transparent 60%)",
        }} />

        <div className="relative z-10 space-y-6">
          {/* Header row */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-green-500/70">MusicPersonality</p>
              {userName && <p className="text-[10px] text-zinc-600 mt-0.5">{userName}</p>}
            </div>
            <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-wider">2026 Music DNA</p>
          </div>

          {/* Archetype name */}
          <div>
            <h2 className={`text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${archetype.gradient}`}
              style={{ fontFamily: "var(--font-righteous)", lineHeight: 1.1 }}>
              {archetype.name}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">{regionLabel || archetype.label}</p>
          </div>

          {/* On Repeat */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3">
            <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">On Repeat</p>
            <p className="text-sm text-white font-medium">{topTrack}</p>
            <p className="text-xs text-zinc-500">{topArtist}</p>
          </div>

          {/* Gen Z tagline */}
          <p className="text-xs text-zinc-500 italic text-center">&ldquo;{randomSlang}&rdquo;</p>

          {/* Mood bars */}
          <div className="space-y-2.5">
            {Object.entries(traits).slice(0, 4).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-500 w-20 shrink-0 text-right">{traitLabels[key]}</span>
                <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${value}%`, background: traitColors[key] || "#888" }} />
                </div>
                <span className="text-[10px] text-zinc-500 w-7 tabular-nums">{value}</span>
              </div>
            ))}
          </div>

          {/* Genre pills */}
          <div className="flex flex-wrap gap-1.5">
            {data.topGenres.length > 0 ? data.topGenres.slice(0, 4).map((g, i) => {
              const colors = ["#1db954","#845ef7","#ff6b6b","#ffd43b"];
              return (
                <span key={g.name} className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                  style={{ background: `${colors[i]}18`, color: colors[i], border: `1px solid ${colors[i]}33` }}>
                  {g.name}
                </span>
              );
            }) : (data.aiGenres || []).slice(0, 4).map((g, i) => {
              const colors = ["#1db954","#845ef7","#ff6b6b","#ffd43b"];
              return (
                <span key={g.name} className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                  style={{ background: `${colors[i]}18`, color: colors[i], border: `1px solid ${colors[i]}33` }}>
                  {g.name}
                </span>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-white/[0.06]">
            <p className="text-[10px] text-zinc-500">
              Alter ego: <span className="text-purple-400 font-medium">{archetype.name}</span>
            </p>
            <p className="font-mono text-[9px] text-zinc-600">musicpersonality.app</p>
          </div>
        </div>
      </div>

      {/* Export button */}
      {showExport && (
        <div className="flex gap-2 mt-4">
          <button onClick={handleExport} disabled={exporting}
            className="flex-1 py-3 rounded-full bg-green-500 text-black font-bold text-sm
                       hover:bg-green-400 transition-all active:scale-[0.98] shadow-lg shadow-green-500/25
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {exporting ? (
              <><div className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />Saving...</>
            ) : exported ? (
              <>Downloaded ✓</>
            ) : (
              <>Download Card</>
            )}
          </button>
          <button onClick={() => {
            const text = `My music personality is "${archetype.name}" 🎵 Discover yours at musicpersonality.app`;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
          }}
            className="px-5 py-3 rounded-full bg-white/[0.04] border border-white/10 text-white text-sm font-medium
                       hover:bg-white/[0.08] transition-all active:scale-[0.98]">
            Share
          </button>
        </div>
      )}
    </div>
  );
}
