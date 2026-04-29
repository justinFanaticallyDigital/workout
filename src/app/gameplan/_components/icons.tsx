"use client";

/**
 * Goal-pulse stencil glyphs — verbatim port of
 * gameplan-active.jsx#GoalIcon (lines 973–1049). Five kinds:
 *   weight   — stencil scale + dial
 *   bench    — barbell with plates + knurl
 *   sleep    — crescent moon + zz
 *   bolt     — lightning (stress)
 *   protein  — drumstick silhouette
 *
 * All glyphs use `currentColor` so the parent's color drives tone.
 *
 * Re-exports from R2/R3/R4 are at the bottom for completeness.
 */

interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

export type GoalIconKind = "weight" | "bench" | "sleep" | "bolt" | "protein";

export function GoalIcon({
  kind,
  size = 22,
  color = "currentColor",
  style,
}: IconProps & { kind: GoalIconKind }) {
  const s = size;
  const stroke = color;
  const wrap = { display: "block" as const, ...style };

  if (kind === "weight") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" style={wrap}>
        <g fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="9" width="18" height="11" rx="1.5" />
          <path d="M3 13 L21 13" />
          <circle cx="12" cy="16" r="2.4" fill={stroke} stroke="none" />
          <path d="M6 11 L6 12 M9 11 L9 12 M12 11 L12 12 M15 11 L15 12 M18 11 L18 12" strokeWidth="1.2" />
          <path d="M5 20 L5 22 M19 20 L19 22" />
        </g>
      </svg>
    );
  }
  if (kind === "bench") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" style={wrap}>
        <g fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12 L22 12" strokeWidth="2" />
          <rect x="1" y="9" width="2.5" height="6" rx=".4" fill={stroke} stroke="none" />
          <rect x="20.5" y="9" width="2.5" height="6" rx=".4" fill={stroke} stroke="none" />
          <rect x="4.5" y="6" width="3" height="12" rx=".5" fill={stroke} stroke="none" />
          <rect x="16.5" y="6" width="3" height="12" rx=".5" fill={stroke} stroke="none" />
          <path d="M8.5 10 L8.5 14 M15.5 10 L15.5 14" strokeWidth="1.2" />
        </g>
      </svg>
    );
  }
  if (kind === "sleep") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" style={wrap}>
        <g fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M16.5 14.5 A 7 7 0 1 1 9.5 4.5 A 5.5 5.5 0 0 0 16.5 14.5 Z"
            fill={stroke}
            stroke="none"
          />
          <path d="M17 5 L20 5 L17 8 L20 8" strokeWidth="1.4" />
          <path d="M14 3 L16 3 L14 5 L16 5" strokeWidth="1.2" opacity=".7" />
        </g>
      </svg>
    );
  }
  if (kind === "bolt") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" style={wrap}>
        <path
          d="M13 2 L4 14 L11 14 L10 22 L20 9 L13 9 Z"
          fill={stroke}
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  // protein
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" style={wrap}>
      <g fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M14.5 3 C 19 3 22 6 22 10 C 22 13 20 15 17.5 15 C 16.5 15 16 14.5 15.5 14 L 13.5 16 L 11 18.5 L 9 20.5 C 8 21.5 6.5 21.5 5.5 20.5 C 4.5 19.5 4.5 18 5.5 17 L 7.5 15 L 10 12.5 L 12 10.5 C 11.5 10 11 9.5 11 8.5 C 11 6 13 3 14.5 3 Z"
          fill={stroke}
          stroke="none"
        />
        <circle cx="6" cy="19" r="1.5" fill={stroke} stroke="none" />
        <circle cx="7.5" cy="20.5" r="1.2" fill={stroke} stroke="none" />
      </g>
    </svg>
  );
}

// Re-exports for callers that import everything from one barrel.
// R2 → IconBarbell, IconFlame, IconMoon (different shapes from GoalIcon).
// R3 → IconChevron / IconTarget / IconFlameLogger (logger-only).
// R4 → DisciplineIcon × 5 / FieldIcon × 4.
//
// The prototype's GoalIcon glyphs (weight/bench/sleep/bolt/protein) are
// distinct from those families and live alongside the others. Pull
// from this barrel for goal-pulse contexts; pull from the source
// barrels for their native contexts.
