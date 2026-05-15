import type { AnalysisResult } from "@/lib/analysis";

interface Props {
  data: AnalysisResult;
}

export default function PersonalityCard({ data }: Props) {
  const { archetype, traits, topArtists, stats } = data;

  return (
    <div className={`rounded-2xl overflow-hidden bg-gradient-to-br ${archetype.gradient} p-[1px] shadow-2xl`}>
      <div className="bg-[#0a0a0a] rounded-2xl p-6 space-y-5">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] mb-2">{archetype.label}</p>
          <h3
            className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${archetype.gradient}`}
            style={{ fontFamily: "var(--font-righteous)" }}
          >
            {archetype.name}
          </h3>
        </div>

        {/* Top artists line */}
        {topArtists.length > 0 && (
          <div className="text-center">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Featuring</p>
            <p className="text-sm text-zinc-400">
              {topArtists.slice(0, 3).map((a) => a.name).join("  ·  ")}
            </p>
          </div>
        )}

        {/* Trait pills */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {Object.entries(traits).map(([key, value]) => {
            const labels: Record<string, string> = {
              energy: "Energy",
              emotion: "Depth",
              curiosity: "Discovery",
              nostalgia: "Nostalgia",
              obscurity: "Underground",
              consistency: "Loyalty",
            };
            return (
              <span
                key={key}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-zinc-300"
              >
                {labels[key] || key} {value}%
              </span>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: "Energy", value: `${stats.avgEnergy}%` },
            { label: "Mood", value: `${stats.avgValence}%` },
            { label: "BPM", value: stats.avgTempo },
            { label: "Era", value: stats.topDecade },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-base font-bold text-white">{s.value}</div>
              <div className="text-[10px] text-zinc-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-white/5">
          <p className="text-[10px] text-zinc-600">
            musicpersonality.app &middot; Powered by Spotify
          </p>
        </div>
      </div>
    </div>
  );
}
