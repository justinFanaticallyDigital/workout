"use client";

/**
 * Logger-only icons ported verbatim from logger-app.jsx atoms.
 * All use `currentColor` so callers control tone via parent color.
 *
 * Note: the prototype's `IconCheck` is OMITTED here — the live app
 * uses `<ThemedIcon name="check">` everywhere a completion tick is
 * needed, which gives the per-theme glyph variants (neon-line / pixel /
 * sketchy / stencil / marker / drafted / clinical). Importing
 * IconCheck here would bypass those variants.
 */

interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

/** 4-direction chevron — used by VariantDropdown OMIT note + future expanders. */
export function IconChevron({
  dir = "down",
  size = 12,
  color = "currentColor",
  style,
}: IconProps & { dir?: "up" | "down" | "left" | "right" }) {
  const d = {
    down: "M3 5 L8 10 L13 5",
    up: "M3 10 L8 5 L13 10",
    left: "M10 3 L5 8 L10 13",
    right: "M6 3 L11 8 L6 13",
  }[dir];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", ...style }}
    >
      <path d={d} />
    </svg>
  );
}

/** Concentric crosshair — used by TargetChip. */
export function IconTarget({ size = 14, color = "currentColor", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.3"
      style={{ display: "block", ...style }}
    >
      <circle cx="8" cy="8" r="6.2" />
      <circle cx="8" cy="8" r="3.3" />
      <circle cx="8" cy="8" r=".8" fill={color} stroke="none" />
    </svg>
  );
}

/** Solid flame glyph — distinct from R2's outline IconFlame. */
export function IconFlameLogger({ size = 14, color = "currentColor", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color}
      style={{ display: "block", ...style }}
    >
      <path d="M8 1.5c.5 2.2 2.5 3 2.5 5.2 0 1-.6 1.8-1.4 2.2.5-.3.8-.9.8-1.6 0-1.4-1-1.6-1.5-3.1-.3 1.3-2.2 2.3-2.2 4.8 0 2.3 1.7 3.5 3.5 3.5S13 11.1 13 8.7c0-2.9-2.6-3.7-5-7.2z" />
    </svg>
  );
}
