"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult } from "@/lib/analysis";

const LOADING_MESSAGES = [
  "Connecting to Spotify...",
  "Analyzing your top artists...",
  "Decoding your genre DNA...",
  "Measuring your musical energy...",
  "Calculating your emotional spectrum...",
  "Finding your listening archetype...",
  "Building your personality profile...",
];

export default function LoadingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < LOADING_MESSAGES.length - 1 ? s + 1 : s));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function analyze() {
      try {
        const res = await fetch("/api/spotify");
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = "/?error=auth_failed";
            return;
          }
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server error (${res.status})`);
        }
        const data: AnalysisResult = await res.json();
        if ("error" in data) {
          throw new Error((data as { error: string }).error);
        }
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
      {/* Orbs */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Spinning disc */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center animate-spin-slow shadow-2xl glow-green">
          <div className="w-8 h-8 rounded-full bg-[#0a0a0a]" />
        </div>

        {/* Loading message */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-righteous)" }}>
            Analyzing Your Music
          </h2>
          <p className="text-zinc-400 text-lg transition-all duration-300 min-h-[28px]">
            {LOADING_MESSAGES[step]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${((step + 1) / LOADING_MESSAGES.length) * 100}%` }}
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center max-w-sm">
            {error}
            <br />
            <button
              onClick={() => (window.location.href = "/")}
              className="underline mt-1 hover:text-red-300"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
