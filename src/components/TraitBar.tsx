"use client";

import { useEffect, useState } from "react";

interface TraitBarProps {
  label: string;
  color: string;
  value: number;
  description: string;
  delay: number;
}

export default function TraitBar({ label, color, value, description, delay }: TraitBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 200 + delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-white font-medium text-sm">{label}</span>
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
      <p className="text-xs text-zinc-500">{description}</p>
    </div>
  );
}
