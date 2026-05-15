"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { AnalysisResult } from "@/lib/analysis";

interface Props {
  data: AnalysisResult;
  userName?: string;
  showExport?: boolean;
}

const GENZ_PHRASES: Record<string, string[]> = {
  curator: ["no skips, all deep cuts", "algorithm said 'idk you tell me'", "playlist is a museum fr"],
  "party-starter": ["letting the aux cook", "the function don't start til u walk in", "understood the assignment"],
  "late-night-feels": ["in your feels era", "sad boi hours certified", "2am ceiling stare playlist"],
  "hype-beast": ["going absolutely feral rn", "this goes unbelievably hard", "head empty just bass"],
  "classic-soul": ["they don't make em like this anymore", "old head energy new gen respect", "vintage vibes only"],
  explorer: ["genre? never heard of her", "algorithm in shambles", "collecting sounds like pokemon"],
  stan: ["casual listening not found", "committed to the deep catalog", "the dedication is impressive"],
  "chill-vibes": ["vibes are curated not captured", "the chill is actually profound", "in your zen bag"],
};

export default function PersonalityCard({ data, userName, showExport = true }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const { archetype, traits, topArtists, topTracks, stats } = data;
  const topArtist = topArtists[0]?.name || "your fave";
  const topTrack = topTracks[0]?.name || "your anthem";
  const slang = GENZ_PHRASES[archetype.id] || GENZ_PHRASES.curator;
  const randomSlang = slang[Math.floor(Math.random() * slang.length)];

  const traitLabels: Record<string, string> = {
    energy: "Energy", emotion: "Depth", curiosity: "Discovery",
    nostalgia: "Nostalgia", obscurity: "Underground", consistency: "Loyalty",
  };

  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#0a0a0a" });
      const link = document.createElement("a");
      link.download = `music-personality-${archetype.id}.png`;
      link.href = dataUrl; link.click();
      setExported(true); setTimeout(() => setExported(false), 2000);
    } catch { /* fallback */ } finally { setExporting(false); }
  };

  return (
    <div>
      <div
        ref={cardRef}
        className="rounded-2xl p-[1.5px] shadow-2xl relative overflow-hidden"
        style={{
          background: `linear-gradient(145deg,
            rgba(255,255,255,0.2) 0%,
            ${archetype.id === "party-starter" ? "#f97316" : archetype.id === "late-night-feels" ? "#818cf8" : archetype.id === "hype-beast" ? "#ef4444" : archetype.id === "classic-soul" ? "#d97706" : archetype.id === "explorer" ? "#10b981" : archetype.id === "stan" ? "#ec4899" : archetype.id === "chill-vibes" ? "#0891b2" : "#8b5cf6"} 25%,
            rgba(255,255,255,0.12) 50%,
            ${archetype.id === "party-starter" ? "#f43f5e" : archetype.id === "late-night-feels" ? "#6366f1" : archetype.id === "hype-beast" ? "#f97316" : archetype.id === "classic-soul" ? "#b45309" : archetype.id === "explorer" ? "#059669" : archetype.id === "stan" ? "#db2777" : archetype.id === "chill-vibes" ? "#0e7490" : "#7c3aed"} 75%,
            rgba(255,255,255,0.06) 100%
          )`,
        }}
      >
        <div className="bg-[#0c0c0c] rounded-2xl px-6 py-7 space-y-5">
          {/* User name + Archetype */}
          <div className="text-center">
            {userName && (
              <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] mb-1">{userName}</p>
            )}
            <h3 className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${archetype.gradient}`}
              style={{ fontFamily: "var(--font-righteous)" }}>
              {archetype.name}
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1">{archetype.label}</p>
          </div>

          {/* Top Artist + Top Track */}
          <div className="text-center space-y-1 py-1 border-y border-white/[0.05]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">On Repeat</p>
            <p className="text-sm text-white font-medium truncate">{topTrack}</p>
            <p className="text-xs text-zinc-500 truncate">{topArtist}</p>
          </div>

          {/* Gen Z slang */}
          <div className="text-center">
            <p className="text-xs text-zinc-500 italic">&ldquo;{randomSlang}&rdquo;</p>
          </div>

          {/* Trait bars */}
          <div className="space-y-2">
            {Object.entries(traits).map(([key, value]) => {
              const colors: Record<string, string> = {
                energy: "#fbbf24", emotion: "#a78bfa", curiosity: "#22d3ee",
                nostalgia: "#fb923c", obscurity: "#f472b6", consistency: "#34d399",
              };
              return (
                <div key={key} className="flex items-center gap-2.5">
                  <span className="text-[10px] text-zinc-500 w-16 text-right uppercase tracking-wider shrink-0">{traitLabels[key]}</span>
                  <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${value}%`, background: colors[key] || "#888", boxShadow: `0 0 8px ${colors[key]}44` }} />
                  </div>
                  <span className="text-[10px] text-zinc-400 w-8 tabular-nums">{value}</span>
                </div>
              );
            })}
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/[0.06]">
            {[
              { label: "Energy", value: `${stats.energy}%` },
              { label: "Mood", value: `${stats.mood}%` },
              { label: "BPM", value: stats.bpm },
              { label: "Era", value: stats.topDecade },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-sm font-bold text-white tabular-nums">{s.value}</div>
                <div className="text-[9px] text-zinc-600 uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <p className="text-center text-[10px] text-zinc-700 pt-1">musicpersonality.app &middot; Powered by Spotify</p>
        </div>
      </div>

      {showExport && (
        <button onClick={handleExport} disabled={exporting}
          className="mt-4 w-full py-3 rounded-full bg-white/[0.04] border border-white/10 text-white text-sm font-medium
                     hover:bg-white/[0.08] hover:border-white/20 transition-all active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {exporting ? (
            <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving...</>
          ) : exported ? (
            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Downloaded</>
          ) : (
            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Save as Image</>
          )}
        </button>
      )}
    </div>
  );
}
