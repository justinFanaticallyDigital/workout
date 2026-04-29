"use client";

/**
 * Graffiti-native ornaments with token-driven fallbacks for every
 * other chrome. Verbatim port of gameplan-active.jsx#SprayUnderline /
 * ButtonSpray / FreshTape / SprayDotsLayer / DashedDivider (lines
 * 67–212).
 *
 * Per-chrome gating:
 *   - graffiti → torn SVG, clip-path tape, deterministic dot field
 *   - notebook → 3px paper rule for SprayUnderline (slightly thicker,
 *                rounded), unrotated tape
 *   - lab/iron/blueprint/cyberpunk/arcade → flat themed accent rule
 *                                            for underlines, accent
 *                                            badge for tape
 *
 * Iron-only ornaments (BrassRib, ChalkSpray, CornerStamp) live in R4
 * `_picker/Ornaments.tsx`. Re-export via the barrel if needed.
 */

import { useMemo, type CSSProperties } from "react";
import { useTheme } from "@/providers/ThemeProvider";

/** Spray-paint underline beneath section headings + the StatusStrip name. */
export function SprayUnderline({
  width = 180,
  color,
  style,
}: {
  width?: number;
  color?: string;
  style?: CSSProperties;
}) {
  const { chrome } = useTheme();
  const c = color ?? "rgb(var(--ft-info-fg))";
  if (chrome !== "graffiti") {
    const isNotebook = chrome === "notebook";
    return (
      <div
        aria-hidden
        style={{
          width,
          height: isNotebook ? 3 : 2,
          background: c,
          opacity: isNotebook ? 0.55 : 0.7,
          borderRadius: isNotebook ? 2 : 0,
          ...style,
        }}
      />
    );
  }
  return (
    <svg
      width={width}
      height="14"
      viewBox="0 0 180 14"
      aria-hidden
      style={{ display: "block", ...style }}
    >
      <defs>
        <filter id="sprayBlur" x="-5%" y="-50%" width="110%" height="200%">
          <feGaussianBlur stdDeviation=".4" />
        </filter>
      </defs>
      <g filter="url(#sprayBlur)">
        <path
          d="M2 7 Q 22 4, 44 6 T 88 5 Q 110 8, 132 5 T 178 7"
          fill="none"
          stroke={c}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M5 9 Q 30 11, 60 9 T 120 10 Q 150 8, 175 10"
          fill="none"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity=".55"
        />
      </g>
      <circle cx="3" cy="3" r="0.8" fill={c} opacity=".6" />
      <circle cx="40" cy="12" r="0.6" fill={c} opacity=".5" />
      <circle cx="92" cy="2" r="0.7" fill={c} opacity=".55" />
      <circle cx="155" cy="13" r="0.6" fill={c} opacity=".45" />
      <circle cx="175" cy="2" r="0.5" fill={c} opacity=".4" />
    </svg>
  );
}

/** Chunkier graffiti underline used beneath buttons. */
export function ButtonSpray({
  width = 120,
  color,
  style,
}: {
  width?: number;
  color?: string;
  style?: CSSProperties;
}) {
  const { chrome } = useTheme();
  const c = color ?? "rgb(var(--ft-text-primary))";
  if (chrome !== "graffiti") {
    return (
      <div
        aria-hidden
        style={{
          width,
          height: 2,
          background: c,
          opacity: 0.75,
          marginTop: 2,
          ...style,
        }}
      />
    );
  }
  return (
    <svg
      width={width}
      height="10"
      viewBox="0 0 120 10"
      aria-hidden
      style={{ display: "block", ...style }}
    >
      <path
        d="M3 5 Q 18 2, 36 4 T 72 4 Q 90 7, 117 5"
        fill="none"
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity=".95"
      />
      <path
        d="M6 8 Q 30 9, 60 7 T 115 8"
        fill="none"
        stroke={c}
        strokeWidth="1"
        strokeLinecap="round"
        opacity=".5"
      />
      <circle cx="2" cy="3" r="0.6" fill={c} opacity=".7" />
      <circle cx="118" cy="3" r="0.5" fill={c} opacity=".6" />
    </svg>
  );
}

/**
 * FRESH stamp/badge — graffiti torn-tape via clip-path; themed accent
 * badge fallback on every other chrome. Sharp themes (iron / blueprint
 * / cyberpunk / arcade) skip the rotation.
 */
export function FreshTape({
  rotate = -8,
  size = "md",
  label = "FRESH",
  style,
}: {
  rotate?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  style?: CSSProperties;
}) {
  const { chrome } = useTheme();
  const s =
    size === "sm"
      ? { fs: 10, py: 4, px: 11 }
      : size === "lg"
      ? { fs: 15, py: 7, px: 16 }
      : { fs: 12, py: 5, px: 14 };

  if (chrome !== "graffiti") {
    const sharp = chrome === "iron" || chrome === "blueprint" || chrome === "cyberpunk" || chrome === "arcade";
    return (
      <div
        className="font-data"
        style={{
          display: "inline-block",
          background: "rgb(var(--ft-accent))",
          color: "rgb(var(--ft-text-on-accent))",
          fontSize: s.fs - 1,
          fontWeight: 600,
          letterSpacing: ".18em",
          padding: `${s.py}px ${s.px}px`,
          transform: `rotate(${sharp ? 0 : rotate * 0.3}deg)`,
          ...style,
        }}
      >
        {label}
      </div>
    );
  }
  return (
    <div
      className="font-display"
      style={{
        display: "inline-block",
        background: "rgb(var(--ft-accent))",
        color: "rgb(var(--ft-bg))",
        fontSize: s.fs,
        letterSpacing: ".18em",
        padding: `${s.py}px ${s.px}px`,
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 1px 0 rgba(0,0,0,.4), 0 4px 8px rgba(0,0,0,.25)",
        clipPath:
          "polygon(2% 18%, 6% 6%, 12% 14%, 22% 4%, 32% 12%, 44% 2%, 56% 14%, 68% 4%, 80% 12%, 92% 2%, 98% 14%, 99% 86%, 94% 96%, 86% 84%, 76% 96%, 64% 86%, 52% 96%, 40% 86%, 28% 96%, 16% 86%, 6% 96%, 2% 84%)",
        ...style,
      }}
    >
      {label}
    </div>
  );
}

/** Scattered spray-paint dots — graffiti-only screen overlay. */
export function SprayDotsLayer({ seed = 1 }: { seed?: number }) {
  const { chrome } = useTheme();
  const dots = useMemo(() => {
    let s = seed * 9301 + 49297;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const out: { x: number; y: number; r: number; o: number; useAccent: boolean }[] = [];
    for (let i = 0; i < 18; i++) {
      out.push({
        x: rand() * 100,
        y: rand() * 100,
        r: 0.6 + rand() * 1.6,
        o: 0.08 + rand() * 0.12,
        useAccent: rand() <= 0.7,
      });
    }
    return out;
  }, [seed]);
  if (chrome !== "graffiti") return null;
  return (
    <svg
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
    >
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={`${d.x}%`}
          cy={`${d.y}%`}
          r={d.r}
          fill={d.useAccent ? "rgb(var(--ft-accent))" : "rgb(var(--ft-info-fg))"}
          opacity={d.o}
        />
      ))}
    </svg>
  );
}

/** Repeating-dash horizontal divider in border-faint. */
export function DashedDivider({ style }: { style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      style={{
        height: 1,
        backgroundImage:
          "repeating-linear-gradient(90deg, rgb(var(--ft-border-faint)) 0 6px, transparent 6px 12px)",
        margin: "14px 0",
        ...style,
      }}
    />
  );
}
