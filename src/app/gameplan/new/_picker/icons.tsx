"use client";

/**
 * Picker icons — chalk-line monochrome SVG glyphs used across steps.
 *
 * Two icon families, both ported verbatim from picker-screens.jsx:
 *   - DisciplineIcon (lines 239–280) — 5 glyphs for FrequencyRow:
 *     lift / cardio / cond / nutrition / mobility
 *   - FieldIcon (lines 982–1017) — 4 glyphs for Step5 FieldRow kickers:
 *     calendar / days / scale / barbell
 *
 * All glyphs use `currentColor` so the parent's color drives tone —
 * the prototype's IRON.accent default becomes whatever the theme's
 * accent token resolves to via R0.
 */

interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

/** Discipline kind for FrequencyRow icon repetition. */
export type DisciplineKind = "lift" | "cardio" | "cond" | "nutrition" | "mobility";

export function DisciplineIcon({
  kind,
  size = 18,
  color = "currentColor",
  style,
}: IconProps & { kind: DisciplineKind }) {
  const stroke = {
    fill: "none",
    stroke: color,
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const s = { width: size, height: size, display: "block" as const, ...style };
  if (kind === "lift") {
    return (
      <svg viewBox="0 0 24 24" style={s}>
        {/* barbell */}
        <line x1="3" y1="12" x2="21" y2="12" {...stroke} />
        <rect x="2" y="8" width="2" height="8" {...stroke} />
        <rect x="20" y="8" width="2" height="8" {...stroke} />
        <rect x="5" y="6" width="2.5" height="12" {...stroke} />
        <rect x="16.5" y="6" width="2.5" height="12" {...stroke} />
      </svg>
    );
  }
  if (kind === "cardio") {
    return (
      <svg viewBox="0 0 24 24" style={s}>
        {/* heart pulse */}
        <path d="M3 13 L7 13 L9 8 L12 18 L14 11 L16 13 L21 13" {...stroke} />
      </svg>
    );
  }
  if (kind === "cond") {
    return (
      <svg viewBox="0 0 24 24" style={s}>
        {/* kettlebell */}
        <path d="M9 5 a3 3 0 0 1 6 0" {...stroke} />
        <path d="M7 7 L17 7 L19 19 a2 2 0 0 1 -2 2 L7 21 a2 2 0 0 1 -2 -2 Z" {...stroke} />
      </svg>
    );
  }
  if (kind === "nutrition") {
    return (
      <svg viewBox="0 0 24 24" style={s}>
        {/* fork + knife */}
        <path d="M8 3 L8 11 M6 3 L6 7 M10 3 L10 7 M8 11 L8 21" {...stroke} />
        <path d="M16 3 C 14 5 14 9 16 11 L16 21" {...stroke} />
      </svg>
    );
  }
  // mobility
  return (
    <svg viewBox="0 0 24 24" style={s}>
      {/* stretching figure */}
      <circle cx="12" cy="5" r="2" {...stroke} />
      <path d="M12 7 L12 14 M12 14 L7 20 M12 14 L17 20 M5 11 L19 11" {...stroke} />
    </svg>
  );
}

/** Field kind for Step5 FieldRow icons. */
export type FieldKind = "calendar" | "days" | "scale" | "barbell";

export function FieldIcon({
  kind,
  size = 14,
  color = "currentColor",
  style,
}: IconProps & { kind: FieldKind }) {
  const stroke = {
    fill: "none",
    stroke: color,
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const s = { width: size, height: size, display: "block" as const, ...style };
  if (kind === "calendar") {
    return (
      <svg viewBox="0 0 24 24" style={s}>
        <rect x="3" y="5" width="18" height="16" {...stroke} />
        <line x1="3" y1="10" x2="21" y2="10" {...stroke} />
        <line x1="8" y1="3" x2="8" y2="7" {...stroke} />
        <line x1="16" y1="3" x2="16" y2="7" {...stroke} />
      </svg>
    );
  }
  if (kind === "days") {
    return (
      <svg viewBox="0 0 24 24" style={s}>
        <rect x="3" y="6" width="4" height="12" {...stroke} />
        <rect x="10" y="6" width="4" height="12" {...stroke} />
        <rect x="17" y="6" width="4" height="12" {...stroke} />
      </svg>
    );
  }
  if (kind === "scale") {
    return (
      <svg viewBox="0 0 24 24" style={s}>
        <rect x="3" y="4" width="18" height="16" {...stroke} />
        <circle cx="12" cy="12" r="4" {...stroke} />
        <line x1="12" y1="10" x2="14" y2="8" {...stroke} />
      </svg>
    );
  }
  // barbell
  return (
    <svg viewBox="0 0 24 24" style={s}>
      <line x1="3" y1="12" x2="21" y2="12" {...stroke} />
      <rect x="2" y="8" width="2" height="8" {...stroke} />
      <rect x="20" y="8" width="2" height="8" {...stroke} />
      <rect x="5" y="6" width="2.5" height="12" {...stroke} />
      <rect x="16.5" y="6" width="2.5" height="12" {...stroke} />
    </svg>
  );
}
