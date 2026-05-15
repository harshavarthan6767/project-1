import type { AnalysisResult } from "@/lib/analysis";

interface Props {
  data: AnalysisResult;
}

export default function PersonalityCard({ data }: Props) {
  const { archetype, traits, topArtists, stats } = data;

  const traitLabels: Record<string, string> = {
    energy: "Energy", emotion: "Depth", curiosity: "Discovery",
    nostalgia: "Nostalgia", obscurity: "Underground", consistency: "Loyalty",
  };

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${archetype.gradient} p-[1.5px] shadow-2xl`}>
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
            { label: "Energy", value: `${stats.avgEnergy}%` },
            { label: "Mood", value: `${stats.avgValence}%` },
            { label: "BPM", value: stats.avgTempo },
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
  );
}
