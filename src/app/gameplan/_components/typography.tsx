"use client";

/**
 * Display + number typography wrappers — bind R0 theme fonts to spans
 * with optional graffiti tilt that flattens on every other chrome.
 *
 * Verbatim port of theme-typography.jsx#Marker / Reenie / Archivo,
 * minus Archivo (R2 `Mono` covers data type already).
 *
 *   Marker — display font (theme.fontDisplay) — used for headings
 *   Reenie — number font (theme.fontNumber || theme.fontBody) — big metric digits
 *
 * Both run their inline `style` through {@link stripTilt} so any
 * `transform: rotate(...)` only sticks on the graffiti chrome. Every
 * other theme wants level baselines.
 */

import type { CSSProperties, ReactNode } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { stripTilt as r4StripTilt } from "@/app/gameplan/new/_picker/util";

interface TypoProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function Marker({ children, style, className }: TypoProps) {
  const { chrome } = useTheme();
  const tiltSafe = r4StripTilt(style, chrome === "graffiti");
  return (
    <span
      className={`font-display ${className ?? ""}`}
      style={{ display: "inline-block", lineHeight: 1.05, ...tiltSafe }}
    >
      {children}
    </span>
  );
}

export function Reenie({ children, style, className }: TypoProps) {
  const { chrome } = useTheme();
  const tiltSafe = r4StripTilt(style, chrome === "graffiti");
  return (
    <span
      className={`font-data tabular-nums ${className ?? ""}`}
      style={{ lineHeight: 1, ...tiltSafe }}
    >
      {children}
    </span>
  );
}

/** Archivo — re-export R2 Mono for data-font spans (semantic alias). */
export { Mono as Archivo } from "@/app/checkin/_components/primitives";
