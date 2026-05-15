"use client";

import { useEffect, useState } from "react";

interface TraitBarProps {
  label: string;
  emoji: string;
  value: number;
  description: string;
  delay: number;
}

const COLOR_MAP: Record<string, string> = {
  "⚡": "#fbbf24",
  "💜": "#a78bfa",
  "🔍": "#22d3ee",
  "📻": "#fb923c",
  "🪐": "#f472b6",
  "🎯": "#34d399",
};

export default function TraitBar({ label, emoji, value, description, delay }: TraitBarProps) {
  const [width, setWidth] = useState(0);
  const color = COLOR_MAP[emoji] || "#a78bfa";

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 200 + delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <span className="text-white font-medium text-sm">{label}</span>
        </div>
        <span className="text-zinc-500 text-sm tabular-nums">{value}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}44`,
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
      <p className="text-xs text-zinc-600">{description}</p>
    </div>
  );
}
