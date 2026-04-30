"use client";

import type { CSSProperties } from "react";

/**
 * Drafting target glyph — small `+` corner mark used by `PlanningCard`
 * at all four corners. Verbatim port of planning-screens.jsx#Crosshair
 * (lines 40–46). Uses `currentColor` so callers control tone.
 */
export function Crosshair({
  size = 10,
  style,
}: {
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      aria-hidden
      style={{ position: "absolute", color: "rgb(var(--ft-text-tertiary))", ...style }}
    >
      <path d="M5 0 L5 10 M0 5 L10 5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
