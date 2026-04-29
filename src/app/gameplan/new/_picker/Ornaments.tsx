"use client";

/**
 * Iron-only chrome ornaments used across the picker steps.
 *
 * Verbatim port of picker-screens.jsx#ChalkSpray (lines 32–48),
 * BrassRib (lines 50–63), CornerStamp (lines 65–84), and IronCard
 * (lines 86–100). All four render `null` on every chrome other than
 * iron — the prototype's contract — so the rest of the chrome
 * vocabulary (lab barcode, notebook spiral, arcade bezel, etc.) comes
 * from `[data-theme="X"]` blocks in `globals.css` via `.ft-card`.
 *
 * Note: the prototype loads `assets/chalk-streak-{1..6}.png` for
 * ChalkSpray, but those PNGs are not in the repo. We synthesize a
 * comparable chalk-dust effect via SVG noise + radial gradient — the
 * intent (faded chalk smear behind iron headings) is preserved.
 */

import type { CSSProperties, ReactNode } from "react";
import { useTheme } from "@/providers/ThemeProvider";

/** Chalk-dust streak — iron-only ornament behind big headings. */
export function ChalkSpray({
  width = 220,
  height = 60,
  variant = 1,
  opacity = 0.55,
  style,
}: {
  width?: number;
  height?: number;
  /** Stable seed (1..6) for the noise pattern so it varies per heading. */
  variant?: number;
  opacity?: number;
  style?: CSSProperties;
}) {
  const { chrome } = useTheme();
  if (chrome !== "iron") return null;
  // Synthesized chalk smear via SVG noise + soft gradient. Variant
  // shifts the seed so each call gets a slightly different dust pattern.
  const id = `chalk-${variant}`;
  return (
    <div
      style={{
        position: "absolute",
        width,
        height,
        pointerEvents: "none",
        opacity,
        mixBlendMode: "screen",
        ...style,
      }}
      aria-hidden
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <filter id={id} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed={variant} />
            <feColorMatrix
              values="0 0 0 0 1
                      0 0 0 0 0.95
                      0 0 0 0 0.85
                      0 0 0 0.75 0"
            />
          </filter>
          <radialGradient id={`${id}-mask`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#fff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id}-mask)`} filter={`url(#${id})`} />
      </svg>
    </div>
  );
}

/** Brass-knurled rib strip — iron-only top-of-card chrome. */
export function BrassRib() {
  const { chrome } = useTheme();
  if (chrome !== "iron") return null;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background:
          "repeating-linear-gradient(90deg, rgba(200,169,110,.95) 0 2px, rgba(140,108,58,.9) 2px 4px), linear-gradient(90deg, #c8a96e, #a98855 50%, #c8a96e)",
        backgroundBlendMode: "multiply",
        boxShadow: "inset 0 1px 0 rgba(0,0,0,.4)",
        zIndex: 2,
      }}
    />
  );
}

/** Iron-only IRON · CHALK corner stamp anchored to bottom-right of step. */
export function CornerStamp({
  children = "IRON · CHALK",
  style,
}: {
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const { chrome } = useTheme();
  if (chrome !== "iron") return null;
  return (
    <div
      className="ft-stamp"
      aria-hidden
      style={{
        position: "absolute",
        bottom: 14,
        right: 14,
        transform: "rotate(-2deg)",
        pointerEvents: "none",
        zIndex: 3,
        border: "1px solid rgb(var(--ft-accent))",
        padding: "3px 8px",
        letterSpacing: ".35em",
        fontSize: 9,
        color: "rgb(var(--ft-accent))",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Themed picker card — surface + border via R0 tokens, with the
 * iron-only BrassRib stacked on top. Per-chrome chrome (lab barcode,
 * notebook paper-shadow, arcade bezel, etc.) comes from the
 * `.ft-card` class + `[data-theme="X"]` blocks in `globals.css`, so
 * this component stays minimal — it just adds the iron rib gate.
 */
export function PickerCard({
  children,
  style,
  padding = 14,
  className = "",
}: {
  children: ReactNode;
  style?: CSSProperties;
  padding?: number;
  className?: string;
}) {
  return (
    <div
      className={`ft-card ${className}`}
      style={{
        position: "relative",
        background: "rgb(var(--ft-surface))",
        border: "1px solid rgb(var(--ft-border))",
        padding,
        ...style,
      }}
    >
      <BrassRib />
      {children}
    </div>
  );
}
