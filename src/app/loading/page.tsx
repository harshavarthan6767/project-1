"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult } from "@/lib/analysis";

const LOADING_MESSAGES = [
  "Connecting to Spotify...",
  "Pulling your top artists...",
  "Analyzing your most played tracks...",
  "Crunching audio features...",
  "Mapping your genre fingerprint...",
  "Calculating your listening profile...",
  "Almost there...",
];

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg bg-white/[0.03] overflow-hidden ${className}`}
      style={{ backgroundImage: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }}
    />
  );
}

export default function LoadingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < LOADING_MESSAGES.length - 1 ? s + 1 : s));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Clear stale data immediately
    sessionStorage.clear();

    async function analyze() {
      try {
        const res = await fetch("/api/spotify");
        if (!res.ok) {
          if (res.status === 401) { window.location.href = "/?error=auth_failed"; return; }
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server error (${res.status})`);
        }
        const data: AnalysisResult = await res.json();
        if ("error" in data) throw new Error((data as { error: string }).error);
        sessionStorage.setItem("musicPersonality", JSON.stringify(data));
        router.push("/results");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    }
    analyze();
  }, [router]);

  return (
    <div className="animated-gradient min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* Top: spinner + message */}
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center animate-spin-slow shadow-2xl glow-green">
            <div className="w-7 h-7 rounded-full bg-[#0a0a0a]" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-1.5" style={{ fontFamily: "var(--font-righteous)" }}>
              Analyzing Your Music
            </h2>
            <p className="text-zinc-400 text-sm transition-all duration-500 min-h-[20px]">
              {LOADING_MESSAGES[step]}
            </p>
          </div>
          <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${((step + 1) / LOADING_MESSAGES.length) * 100}%` }} />
          </div>
        </div>

        {/* Skeleton preview of results layout */}
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
          {/* Hero skeleton */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <SkeletonBlock className="w-20 h-3" />
            <SkeletonBlock className="w-56 h-7" />
            <SkeletonBlock className="w-72 h-4" />
          </div>

          {/* Stat cards skeleton */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
                <SkeletonBlock className="w-10 h-6 mx-auto mb-1" />
                <SkeletonBlock className="w-12 h-2 mx-auto" />
              </div>
            ))}
          </div>

          {/* Trait bars skeleton */}
          <div className="space-y-3 mt-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <SkeletonBlock className="w-16 h-3" />
                  <SkeletonBlock className="w-8 h-3" />
                </div>
                <SkeletonBlock className="w-full h-1.5 rounded-full" />
              </div>
            ))}
          </div>

          {/* Genre ring skeleton */}
          <div className="flex justify-center gap-8 mt-6">
            <SkeletonBlock className="w-32 h-32 rounded-full" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <SkeletonBlock className="w-2 h-2 rounded-full" />
                  <SkeletonBlock className="w-20 h-3" />
                </div>
              ))}
            </div>
          </div>

          {/* Artist rows skeleton */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <SkeletonBlock className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1">
                    <SkeletonBlock className="w-24 h-3" />
                    <SkeletonBlock className="w-16 h-2" />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <SkeletonBlock className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1">
                    <SkeletonBlock className="w-24 h-3" />
                    <SkeletonBlock className="w-16 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center max-w-sm mx-auto mt-8">
            {error}
            <br />
            <button onClick={() => (window.location.href = "/")} className="underline mt-1 hover:text-red-300">
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
