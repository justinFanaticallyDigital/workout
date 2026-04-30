"use client";

/**
 * Custom slider with track + fill + thumb + 5 tick marks. Verbatim
 * port of planning-screens.jsx#Slider (lines 555–585), upgraded to a
 * controlled `<input type=range>` so it's accessible and keyboard-
 * navigable.
 */

import type { CSSProperties } from "react";

export function Slider({
  value,
  min,
  max,
  step = 1,
  color = "rgb(var(--ft-accent))",
  glow,
  onChange,
  ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  color?: string;
  glow?: boolean;
  onChange: (v: number) => void;
  ariaLabel?: string;
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const containerStyle: CSSProperties = {
    position: "relative",
    height: 18,
    borderTop: "1px dashed rgb(var(--ft-border))",
    borderBottom: "1px dashed rgb(var(--ft-border))",
    background: "rgb(var(--ft-surface-alt))",
  };
  return (
    <div style={containerStyle}>
      {/* fill bar */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `${pct}%`,
          background: `${color}30`,
          borderRight: `1px solid ${color}`,
          pointerEvents: "none",
        }}
      />
      {/* tick marks */}
      {[0, 25, 50, 75, 100].map((t) => (
        <div
          key={t}
          aria-hidden
          style={{
            position: "absolute",
            left: `${t}%`,
            top: "50%",
            width: 1,
            height: 4,
            background: "rgb(var(--ft-text-tertiary))",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />
      ))}
      {/* thumb visual */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: `${pct}%`,
          top: -3,
          bottom: -3,
          width: 10,
          transform: "translateX(-50%)",
          background: "rgb(var(--ft-text-primary))",
          border: `1px solid ${color}`,
          boxShadow: glow ? `0 0 0 3px ${color}` : "none",
          pointerEvents: "none",
        }}
      />
      {/* invisible input handles input — covers the full track */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          position: "absolute",
          inset: -3,
          width: "100%",
          height: "calc(100% + 6px)",
          margin: 0,
          opacity: 0,
          cursor: "pointer",
        }}
      />
    </div>
  );
}
