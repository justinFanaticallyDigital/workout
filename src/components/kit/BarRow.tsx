"use client";

import { useState } from "react";

interface BarRowProps {
  bars: number[];
  h?: number;
  /** Series colour (any CSS colour). Defaults to the accent token. */
  color?: string;
  labels?: string[];
  fmt?: (v: number, i: number) => string;
  title?: string;
  className?: string;
}

/**
 * One-series column row: bars ≤ 24px thick with a 4px rounded top on a hairline
 * baseline; the latest bar is solid, earlier ones recede. Tap / hover reads a value
 * out in the label row (text tokens).
 */
export default function BarRow({ bars, h = 54, color = "rgb(var(--ft-accent))", labels, fmt = (v) => String(Math.round(v)), title, className = "" }: BarRowProps) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(0, ...bars);
  const last = bars.length - 1;
  return (
    <div className={className} role="group" aria-label={title}>
      <div className="flex items-end gap-1.5" style={{ height: h }}>
        {bars.map((v, i) => {
          const bh = max > 0 ? Math.max(4, Math.round((v / max) * h)) : 4;
          const on = i === last || i === active;
          return (
            <button
              key={i}
              type="button"
              aria-label={`${labels?.[i] ?? `Bar ${i + 1}`}: ${fmt(v, i)}`}
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              onClick={() => setActive(active === i ? null : i)}
              className="flex h-full min-w-0 flex-1 items-end justify-center"
            >
              <span className="block w-full max-w-[24px] rounded-t-[4px] transition-opacity" style={{ height: bh, background: color, opacity: on ? 1 : 0.38 }} />
            </button>
          );
        })}
      </div>
      <div className="h-px bg-ft-border-faint" />
      <div className="mt-1.5 flex h-[12px] gap-1.5">
        {active !== null ? (
          <div className="flex-1 text-center font-data text-[10px] font-semibold text-ft-light">
            {labels?.[active] ? `${labels[active]} · ` : ""}
            {fmt(bars[active], active)}
          </div>
        ) : (
          labels?.map((l, i) => (
            <div key={`${l}-${i}`} className="min-w-0 flex-1 truncate text-center font-data text-[9px] tracking-[0.08em] text-ft-dim">
              {l}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
