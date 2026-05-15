"use client";

import { Suspense } from "react";
import { getSpotifyAuthUrl } from "@/lib/spotify";
import { useSearchParams } from "next/navigation";

function LandingContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleConnect = () => {
    window.location.href = getSpotifyAuthUrl();
  };

  return (
    <div className="animated-gradient min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1db954">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span className="text-sm font-medium text-white/80">Powered by Spotify</span>
          </div>
        </div>

        {/* Hero */}
        <h1 className="animate-fade-up animate-fade-up-delay-1 text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-4" style={{ fontFamily: "var(--font-righteous)" }}>
          What Does Your
          <br />
          <span className="gradient-text">Music Say About You?</span>
        </h1>

        <p className="animate-fade-up animate-fade-up-delay-2 text-lg text-zinc-400 max-w-lg mx-auto mb-6 leading-relaxed">
          Connect your Spotify to unlock your <span className="text-white font-medium">Music DNA</span> — discover your listening archetype, emotional fingerprint, and the personality hidden in your playlists.
        </p>

        {/* CTA */}
        <div className="animate-fade-up animate-fade-up-delay-3 flex flex-col items-center gap-4">
          <button onClick={handleConnect} className="spotify-btn text-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Connect Your Spotify
          </button>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
              {error === "auth_failed" ? "Authentication failed. Please try again." : "Something went wrong. Please try again."}
            </p>
          )}

          <p className="text-xs text-zinc-600 mt-2">
            We only access your top artists and tracks. No posting, no modifications.
          </p>
        </div>

        {/* Feature pills */}
        <div className="animate-fade-up animate-fade-up-delay-4 flex flex-wrap justify-center gap-3 mt-16">
          {[
            { emoji: "\u{1F9EC}", label: "Music DNA" },
            { emoji: "\u{1F3AD}", label: "Listening Archetype" },
            { emoji: "\u{1F4CA}", label: "Trait Breakdown" },
            { emoji: "\u{1F517}", label: "Shareable Card" },
          ].map((f) => (
            <div key={f.label} className="card-glass px-4 py-2.5 flex items-center gap-2 text-sm text-zinc-300">
              <span>{f.emoji}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-xs text-zinc-700">
        Built with ❤️ using Next.js & Spotify API
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={
      <div className="animated-gradient min-h-dvh flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
      </div>
    }>
      <LandingContent />
    </Suspense>
  );
}
