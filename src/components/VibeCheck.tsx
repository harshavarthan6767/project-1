"use client";

import { useEffect, useState } from "react";
import type { AnalysisResult } from "@/lib/analysis";
import { getVibeCheck } from "@/lib/slang";

interface Props {
  data: AnalysisResult;
}

export default function VibeCheckSection({ data }: Props) {
  const [visible, setVisible] = useState(false);
  const vibe = getVibeCheck(data.archetype);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="max-w-2xl mx-auto px-6 py-20 border-t border-white/5">
      <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-righteous)" }}>
          Vibe Check
        </h2>
        <p className="text-zinc-500 mb-8">What your music says about you, no cap</p>

        {/* Aura */}
        <div className="card-glass p-6 mb-6 bg-gradient-to-r from-white/[0.02] to-white/[0.04]">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Your Aura</span>
          <p className="text-lg text-white font-medium leading-relaxed">{vibe.aura}</p>
        </div>

        {/* Walk-up song + Hypothetical */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="card-glass p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Walk-up Song</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{vibe.walkUpSong}</p>
          </div>
          <div className="card-glass p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">The Scenario</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{vibe.hypothetical}</p>
          </div>
        </div>

        {/* Phrases */}
        <div className="space-y-3 mb-6">
          {vibe.phrases.map((p) => (
            <div key={p.phrase} className="card-glass p-4 flex items-start gap-3 group hover:bg-white/[0.06] transition-colors">
              <span className="text-lg mt-0.5 shrink-0">🗣️</span>
              <div>
                <p className="text-white font-medium text-sm">&ldquo;{p.phrase}&rdquo;</p>
                <p className="text-zinc-500 text-xs mt-0.5">{p.meaning}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div className="card-glass p-5 text-center bg-gradient-to-r from-white/[0.02] to-white/[0.05]">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">The Verdict</p>
          <p className="text-white font-medium">{vibe.verdict}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {vibe.tags.map((tag) => (
            <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-zinc-400">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
