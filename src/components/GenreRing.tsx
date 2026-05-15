"use client";

interface GenreRingProps {
  genres: { name: string; count: number }[];
  visible: boolean;
}

const COLORS = [
  "#a78bfa", "#f472b6", "#22d3ee", "#fbbf24", "#34d399",
  "#fb923c", "#818cf8", "#e879f9", "#38bdf8", "#facc15",
];

export default function GenreRing({ genres, visible }: GenreRingProps) {
  const total = genres.reduce((s, g) => s + g.count, 0) || 1;
  const radius = 140;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  const center = radius + strokeWidth;

  // Build stroke-dasharray segments
  let offset = 0;
  const segments = genres.map((g, i) => {
    const pct = g.count / total;
    const length = pct * circumference;
    const seg = { name: g.name, color: COLORS[i % COLORS.length], offset, length };
    offset += length;
    return seg;
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
      {/* Ring */}
      <div className="relative shrink-0" style={{ width: center * 2, height: center * 2 }}>
        <svg
          viewBox={`0 0 ${center * 2} ${center * 2}`}
          className={`-rotate-90 w-full h-full transition-all duration-1000 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
        >
          {/* Background track */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
          {/* Segments */}
          {segments.map((seg, i) => (
            <circle
              key={seg.name}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${seg.length} ${circumference - seg.length}`}
              strokeDashoffset={-seg.offset}
              className="transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transitionDelay: `${i * 80}ms`,
                filter: `drop-shadow(0 0 6px ${seg.color}44)`,
              }}
            />
          ))}
        </svg>
        {/* Center count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-righteous)" }}>
            {genres.length}
          </span>
          <span className="text-xs text-zinc-500 mt-0.5">genres</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-1.5">
        {genres.slice(0, 8).map((g, i) => (
          <div key={g.name} className="flex items-center gap-2.5 text-sm">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-zinc-300">{g.name}</span>
            <span className="text-zinc-600 tabular-nums">{g.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
