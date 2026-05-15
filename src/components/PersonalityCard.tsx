"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { AnalysisResult } from "@/lib/analysis";

interface Props {
  data: AnalysisResult;
  showExport?: boolean;
}

export default function PersonalityCard({ data, showExport = true }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const { archetype, traits, topArtists, stats } = data;

  const traitLabels: Record<string, string> = {
    energy: "Energy", emotion: "Depth", curiosity: "Discovery",
    nostalgia: "Nostalgia", obscurity: "Underground", consistency: "Loyalty",
  };

  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0a0a0a",
      });
      const link = document.createElement("a");
      link.download = `music-personality-${archetype.id}.png`;
      link.href = dataUrl;
      link.click();
      setExported(true);
      setTimeout(() => setExported(false), 2000);
    } catch {
      // Fallback for browsers where html-to-image fails
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      {/* Card */}
      <div
        ref={cardRef}
        className={`rounded-2xl bg-gradient-to-br ${archetype.gradient} p-[1.5px] shadow-2xl`}
      >
        <div className="bg-[#0c0c0c] rounded-2xl px-6 py-7 space-y-5">
          {/* Header */}
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">{archetype.label}</p>
            <h3 className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${archetype.gradient}`}
              style={{ fontFamily: "var(--font-righteous)" }}>
              {archetype.name}
            </h3>
          </div>

          {/* Artist line */}
          {topArtists.length > 0 && (
            <p className="text-center text-sm text-zinc-500">
              {topArtists.slice(0, 3).map((a) => a.name).join("  ·  ")}
            </p>
          )}

          {/* Trait bars (compact) */}
          <div className="space-y-2">
            {Object.entries(traits).map(([key, value]) => {
              const colors: Record<string, string> = {
                energy: "#fbbf24", emotion: "#a78bfa", curiosity: "#22d3ee",
                nostalgia: "#fb923c", obscurity: "#f472b6", consistency: "#34d399",
              };
              return (
                <div key={key} className="flex items-center gap-2.5">
                  <span className="text-[10px] text-zinc-500 w-16 text-right uppercase tracking-wider shrink-0">
                    {traitLabels[key]}
                  </span>
                  <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${value}%`, background: colors[key] || "#888", boxShadow: `0 0 8px ${colors[key]}44` }} />
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

          <p className="text-center text-[10px] text-zinc-700 pt-1">
            musicpersonality.app &middot; Powered by Spotify
          </p>
        </div>
      </div>

      {/* Export button */}
      {showExport && (
        <button
          onClick={handleExport}
          disabled={exporting}
          className="mt-4 w-full py-3 rounded-full bg-white/[0.04] border border-white/10 text-white text-sm font-medium
                     hover:bg-white/[0.08] hover:border-white/20 transition-all active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {exporting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Saving...
            </>
          ) : exported ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              Downloaded
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Save as Image
            </>
          )}
        </button>
      )}
    </div>
  );
}
