"use client";

import { useState } from "react";

interface GenreRingProps {
  genres: { name: string; count: number }[];
  visible: boolean;
}

const COLORS = [
  "#a78bfa", "#f472b6", "#22d3ee", "#fbbf24", "#34d399",
  "#fb923c", "#818cf8", "#e879f9", "#38bdf8", "#facc15",
];

export default function GenreRing({ genres, visible }: GenreRingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const total = genres.reduce((s, g) => s + g.count, 0) || 1;
  const radius = 140;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  const center = radius + strokeWidth;

  let offset = 0;
  const segments = genres.map((g, i) => {
    const pct = g.count / total;
    const length = pct * circumference;
    // Add small gap between segments
    const gap = 2;
    const seg = { name: g.name, count: g.count, color: COLORS[i % COLORS.length], offset, length: Math.max(length - gap, 1) };
    offset += length;
    return seg;
  });

  const hoveredSegment = hovered !== null ? segments[hovered] : null;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
      {/* Ring + tooltip */}
      <div className="relative shrink-0" style={{ width: center * 2, height: center * 2 }}>
        <svg
          viewBox={`0 0 ${center * 2} ${center * 2}`}
          className={`-rotate-90 w-full h-full transition-all duration-1000 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
        >
          <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />

          {segments.map((seg, i) => {
            const isHovered = hovered === i;
            const isActive = active === i;
            const isDimmed = hovered !== null && hovered !== i;
            return (
              <circle
                key={seg.name}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered || isActive ? strokeWidth + 4 : strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${seg.length} ${circumference - seg.length}`}
                strokeDashoffset={-seg.offset}
                className="cursor-pointer transition-all duration-200"
                style={{
                  opacity: isDimmed ? 0.35 : (isHovered || isActive ? 1 : 0.85),
                  filter: isHovered || isActive
                    ? `drop-shadow(0 0 10px ${seg.color})`
                    : `drop-shadow(0 0 3px ${seg.color}33)`,
                  transitionDelay: visible ? `${i * 40}ms` : "0ms",
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setActive(active === i ? null : i)}
              />
            );
          })}

          {/* Active ring highlight */}
          {active !== null && (
            <circle cx={center} cy={center} r={radius + strokeWidth / 2 + 4} fill="none"
              stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} className="transition-all duration-300"
              strokeDasharray={`${segments[active].length} ${circumference - segments[active].length}`}
              strokeDashoffset={-segments[active].offset} />
          )}
        </svg>

        {/* Center count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-righteous)" }}>
            {active !== null ? segments[active].count : genres.length}
          </span>
          <span className="text-xs text-zinc-500 mt-0.5">
            {active !== null ? "artists" : "genres"}
          </span>
        </div>

        {/* Tooltip */}
        {hoveredSegment && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[140%] pointer-events-none z-20">
            <div className="card-glass px-4 py-2 text-center whitespace-nowrap">
              <p className="text-white text-sm font-medium">{hoveredSegment.name}</p>
              <p className="text-zinc-400 text-xs">
                {hoveredSegment.count} artists ({Math.round((hoveredSegment.count / total) * 100)}%)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="space-y-1">
        {segments.slice(0, 8).map((g, i) => (
          <button
            key={g.name}
            onClick={() => setActive(active === i ? null : i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={`flex items-center gap-2.5 text-sm w-full text-left px-2 py-1 rounded-lg transition-all ${
              hovered === i || active === i ? "bg-white/[0.06]" : ""
            } ${hovered !== null && hovered !== i ? "opacity-40" : "opacity-100"}`}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform"
              style={{ background: g.color, transform: hovered === i || active === i ? "scale(1.3)" : "scale(1)" }} />
            <span className={`truncate ${active === i ? "text-white font-medium" : "text-zinc-300"}`}>{g.name}</span>
            <span className="text-zinc-600 tabular-nums ml-auto">{g.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
