"use client";

/**
 * Lab Report icon system — monochrome, currentColor, ~16px native viewBox.
 * Ported verbatim from design-prototypes/checkin-icons.jsx.
 *
 * Used across snapshot tiles, recommendation pills, history strip,
 * breakdown table.
 */

interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

export function IconWeight({ size = 16, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "block", ...style }}>
      <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3.5" width="12" height="9" rx="1.2" />
        <path d="M5 8.5 A 3 3 0 0 1 11 8.5" />
        <line x1="8" y1="5.8" x2="8" y2="8.5" />
        <circle cx="8" cy="8.5" r=".7" fill={color} stroke="none" />
        <line x1="4.2" y1="11" x2="11.8" y2="11" />
      </g>
    </svg>
  );
}

export function IconBarbell({ size = 16, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "block", ...style }}>
      <g fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round">
        <rect x="0.5" y="6" width="1.5" height="4" rx=".3" />
        <rect x="2.5" y="4" width="2" height="8" rx=".4" />
        <rect x="11.5" y="4" width="2" height="8" rx=".4" />
        <rect x="14" y="6" width="1.5" height="4" rx=".3" />
        <rect x="4.5" y="7.3" width="7" height="1.4" rx=".2" />
      </g>
    </svg>
  );
}

export function IconFlame({ size = 16, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "block", ...style }}>
      <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 1.5 C 9 4 11 5 11 8 C 11 10.8 9.5 13 8 13 C 6.5 13 5 10.8 5 8.5 C 5 7 5.8 6.2 6.5 6 C 6.2 4.5 7.2 3 8 1.5 Z" />
        <path d="M8 9 C 8.5 10 9 10.5 9 11.5 C 9 12.3 8.5 13 8 13" opacity=".55" />
      </g>
    </svg>
  );
}

export function IconMoon({ size = 16, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "block", ...style }}>
      <path
        d="M11.5 9.5 A 5.2 5.2 0 1 1 6.5 3 A 4 4 0 0 0 11.5 9.5 Z"
        fill="none"
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSteps({ size = 16, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "block", ...style }}>
      <g fill={color}>
        <ellipse cx="5.5" cy="4.5" rx="2" ry="2.5" />
        <ellipse cx="4" cy="9" rx="1" ry="1.2" opacity=".7" />
        <ellipse cx="6.2" cy="9.4" rx="1" ry="1.2" opacity=".7" />
        <ellipse cx="10.5" cy="11.5" rx="2" ry="2.5" />
        <ellipse cx="9" cy="7" rx="1" ry="1.2" opacity=".7" />
        <ellipse cx="11.2" cy="7.4" rx="1" ry="1.2" opacity=".7" />
      </g>
    </svg>
  );
}

export function IconPulse({ size = 16, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "block", ...style }}>
      <path
        d="M1 8 L4 8 L5.5 4 L7.5 12 L9.5 6 L11 8 L15 8"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCalendar({ size = 16, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "block", ...style }}>
      <g fill="none" stroke={color} strokeWidth="1.3" strokeLinejoin="round">
        <rect x="2" y="3.5" width="12" height="10.5" rx="1.2" />
        <line x1="2" y1="6.5" x2="14" y2="6.5" />
        <line x1="5" y1="2" x2="5" y2="5" />
        <line x1="11" y1="2" x2="11" y2="5" />
        <rect x="5.5" y="9" width="1.8" height="1.8" fill={color} stroke="none" />
        <rect x="8.5" y="9" width="1.8" height="1.8" fill={color} stroke="none" />
      </g>
    </svg>
  );
}

export function IconGauge({ size = 16, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "block", ...style }}>
      <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 11 A 6 6 0 0 1 14 11" />
        <line x1="8" y1="11" x2="11.5" y2="6.5" />
        <circle cx="8" cy="11" r=".9" fill={color} stroke="none" />
        <line x1="3.5" y1="11" x2="3" y2="11" />
        <line x1="12.5" y1="11" x2="13" y2="11" />
      </g>
    </svg>
  );
}

export function IconInfo({ size = 16, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "block", ...style }}>
      <circle cx="8" cy="8" r="6.5" fill="none" stroke={color} strokeWidth="1.3" />
      <circle cx="8" cy="5" r=".9" fill={color} />
      <line x1="8" y1="7.5" x2="8" y2="11.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconWarn({ size = 16, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "block", ...style }}>
      <path d="M8 1.5 L14.5 13 L1.5 13 Z" fill="none" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
      <line x1="8" y1="6" x2="8" y2="9.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.9" fill={color} />
    </svg>
  );
}

export function IconCheckCircle({ size = 16, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "block", ...style }}>
      <circle cx="8" cy="8" r="6.5" fill={color} />
      <path
        d="M5 8.2 L7 10.2 L11 6"
        fill="none"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** ▲ ahead, ◆ monitor, ▼ behind, ◯ neutral */
export function StatusGlyph({
  tone = "green",
  size = 10,
  style,
}: {
  tone?: "green" | "yellow" | "red" | "blue";
  size?: number;
  style?: React.CSSProperties;
}) {
  const color =
    tone === "green" ? "rgb(var(--ft-success-fg))"
    : tone === "yellow" ? "rgb(var(--ft-warn-fg))"
    : tone === "red" ? "rgb(var(--ft-danger-fg))"
    : "rgb(var(--ft-info-fg))";
  if (tone === "green")
    return (
      <svg width={size} height={size} viewBox="0 0 10 10" style={{ display: "block", ...style }}>
        <path d="M5 1.5 L9 8.5 L1 8.5 Z" fill={color} />
      </svg>
    );
  if (tone === "red")
    return (
      <svg width={size} height={size} viewBox="0 0 10 10" style={{ display: "block", ...style }}>
        <path d="M5 8.5 L9 1.5 L1 1.5 Z" fill={color} />
      </svg>
    );
  if (tone === "yellow")
    return (
      <svg width={size} height={size} viewBox="0 0 10 10" style={{ display: "block", ...style }}>
        <path d="M5 1 L9 5 L5 9 L1 5 Z" fill={color} />
      </svg>
    );
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={{ display: "block", ...style }}>
      <circle cx="5" cy="5" r="3.2" fill="none" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}

/** Signed value with arrowhead. `value` is "+0.3" / "−1.1" / "0". */
export function DeltaToken({
  value,
  unit,
  tone = "red",
  size = 11,
  style,
}: {
  value: string;
  unit?: string;
  tone?: "red" | "yellow" | "green" | "neutral";
  size?: number;
  style?: React.CSSProperties;
}) {
  const color =
    tone === "red" ? "rgb(var(--ft-danger-fg))"
    : tone === "yellow" ? "rgb(var(--ft-warn-fg))"
    : tone === "green" ? "rgb(var(--ft-success-fg))"
    : "rgb(var(--ft-text-secondary))";
  const sign = value.startsWith("+") ? "up" : value.startsWith("−") || value.startsWith("-") ? "down" : "flat";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color, ...style }}>
      <svg width={size - 2} height={size - 2} viewBox="0 0 8 8" style={{ display: "block" }}>
        {sign === "up" && <path d="M4 1.5 L7 6 L1 6 Z" fill={color} />}
        {sign === "down" && <path d="M4 6.5 L7 2 L1 2 Z" fill={color} />}
        {sign === "flat" && <rect x="1" y="3.5" width="6" height="1.4" fill={color} />}
      </svg>
      <span
        className="font-data tabular-nums"
        style={{ fontSize: size, fontWeight: 600, letterSpacing: ".01em" }}
      >
        {value}
        {unit ? ` ${unit}` : ""}
      </span>
    </span>
  );
}
