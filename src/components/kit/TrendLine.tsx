"use client";

import { useState, type PointerEvent } from "react";

interface TrendLineProps {
  pts: number[];
  w?: number;
  h?: number;
  /** Series colour (any CSS colour). Defaults to the accent token. */
  color?: string;
  /** Formats the tap / hover readout and the accessible summary. */
  fmt?: (v: number, i: number) => string;
  /** Evenly spread x-axis labels under the plot (e.g. months). */
  labels?: string[];
  title?: string;
  className?: string;
}

const PAD = 6;

/**
 * Single-series sparkline: 2px line, 8px end marker with a 2px surface ring,
 * hairline + readout on tap / hover. Text stays in text tokens, never the series colour.
 */
export default function TrendLine({ pts, w = 150, h = 44, color = "rgb(var(--ft-accent))", fmt = (v) => String(v), labels, title, className = "" }: TrendLineProps) {
  const [active, setActive] = useState<number | null>(null);
  if (pts.length === 0) {
    return (
      <div className={`flex items-center font-data text-[11px] text-ft-dim ${className}`} style={{ height: h }}>
        No data yet
      </div>
    );
  }
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const last = pts.length - 1;
  const step = last > 0 ? (w - PAD * 2) / last : 0;
  const x = (i: number) => PAD + i * step;
  const y = (v: number) => h - PAD - ((v - min) / span) * (h - PAD * 2);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join(" ");
  const pick = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * w;
    setActive(step > 0 ? Math.max(0, Math.min(last, Math.round((px - PAD) / step))) : 0);
  };
  const i = active ?? last;
  const readout = fmt(pts[i], i);
  const anchorEnd = x(i) > w / 2;
  return (
    <div className={className}>
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="block max-w-full touch-none select-none"
        role="img"
        aria-label={title ? `${title}: ${pts.length} points, latest ${fmt(pts[last], last)}` : `${pts.length} points, latest ${fmt(pts[last], last)}`}
        onPointerMove={pick}
        onPointerDown={pick}
        onPointerLeave={() => setActive(null)}
      >
        {title && <title>{title}</title>}
        {active !== null && <line x1={x(i)} x2={x(i)} y1={2} y2={h - 2} stroke="rgb(var(--ft-border))" strokeWidth="1" />}
        <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x(i)} cy={y(pts[i])} r="4" fill={color} stroke="rgb(var(--ft-surface))" strokeWidth="2" />
        {active !== null && (
          <text x={anchorEnd ? x(i) - 7 : x(i) + 7} y={Math.max(10, Math.min(h - 4, y(pts[i]) - 8))} textAnchor={anchorEnd ? "end" : "start"} fontSize="10.5" fontWeight="600" fill="rgb(var(--ft-light))" style={{ fontFamily: "var(--ft-font-data)" }}>
            {readout}
          </text>
        )}
      </svg>
      {labels && labels.length > 0 && (
        <div className="mt-1 flex justify-between font-data text-[9.5px] uppercase tracking-[0.08em] text-ft-dim">
          {labels.map((l, k) => (
            <span key={`${l}-${k}`}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}
