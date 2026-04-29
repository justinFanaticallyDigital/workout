"use client";

import { ReactNode, useMemo } from "react";
import { useTheme } from "@/providers/ThemeProvider";

/**
 * Typography helpers — mirror checkin-screens.jsx Plex/Mono wrappers
 * but bind to R0 theme tokens via Tailwind utilities (font-body / font-data).
 */
export function Plex({
  children,
  size = 13,
  weight = 400,
  color,
  style,
  ...rest
}: {
  children: ReactNode;
  size?: number;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
  [k: string]: unknown;
}) {
  return (
    <span
      className="font-body"
      style={{
        fontWeight: weight,
        fontSize: size,
        color: color ?? "rgb(var(--ft-text-primary))",
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}

export function Mono({
  children,
  size = 13,
  weight = 500,
  color,
  style,
}: {
  children: ReactNode;
  size?: number;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className="font-data tabular-nums"
      style={{
        fontWeight: weight,
        fontSize: size,
        color: color ?? "rgb(var(--ft-text-primary))",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** Colored status dot. */
export function Dot({ tone = "green", size = 8 }: { tone?: "green" | "yellow" | "red" | "blue"; size?: number }) {
  const c =
    tone === "green" ? "rgb(var(--ft-success))"
    : tone === "yellow" ? "rgb(var(--ft-warn))"
    : tone === "red" ? "rgb(var(--ft-danger))"
    : tone === "blue" ? "rgb(var(--ft-accent))"
    : "rgb(var(--ft-text-tertiary))";
  return <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: c, flexShrink: 0 }} />;
}

/** Severity pill (uses R0 state tokens). */
export function Pill({
  children,
  tone = "neutral",
  style,
  icon: Icon,
}: {
  children: ReactNode;
  tone?: "neutral" | "blue" | "warn" | "danger" | "success";
  style?: React.CSSProperties;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
}) {
  const palette = {
    neutral: { bg: "rgb(var(--ft-bg-alt))", fg: "rgb(var(--ft-text-secondary))", br: "rgb(var(--ft-border))" },
    blue:    { bg: "rgb(var(--ft-accent-faint))", fg: "rgb(var(--ft-accent-fg))", br: "rgb(var(--ft-accent-border))" },
    warn:    { bg: "rgb(var(--ft-warn-bg))", fg: "rgb(var(--ft-warn-fg))", br: "rgb(var(--ft-warn-border))" },
    danger:  { bg: "rgb(var(--ft-danger-bg))", fg: "rgb(var(--ft-danger-fg))", br: "rgb(var(--ft-danger-border))" },
    success: { bg: "rgb(var(--ft-success-bg))", fg: "rgb(var(--ft-success-fg))", br: "rgb(var(--ft-success-border))" },
  }[tone];
  return (
    <span
      className="font-data"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 7px",
        background: palette.bg,
        border: `1px solid ${palette.br}`,
        borderRadius: 3,
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: ".10em",
        color: palette.fg,
        textTransform: "uppercase",
        ...style,
      }}
    >
      {Icon && <Icon size={11} color={palette.fg} />}
      {children}
    </span>
  );
}

/**
 * Vertical/horizontal barcode strip. Per the prototype, the
 * paper-bg variant (lab + notebook themes) renders white-paper-with-
 * black-bars; other themes get a tinted-on-surface fallback.
 */
export function BarcodeStrip({
  width = 18,
  height = "100%" as number | string,
  orientation = "vertical",
  seed = 4,
}: {
  width?: number;
  height?: number | string;
  orientation?: "vertical" | "horizontal";
  seed?: number;
}) {
  const { chrome } = useTheme();
  const isPaper = chrome === "lab" || chrome === "notebook";

  const bars = useMemo(() => {
    let s = seed * 9301 + 49297;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const out: { pos: number; w: number }[] = [];
    let pos = 0;
    while (pos < 100) {
      const w = 0.4 + rand() * 1.8;
      const gap = 0.4 + rand() * 1.6;
      out.push({ pos, w });
      pos += w + gap;
    }
    return out;
  }, [seed]);

  const barcodeBg = isPaper ? "#fff" : "rgb(var(--ft-surface-alt))";
  const barcodeInk = isPaper ? "#0a0e16" : "rgb(var(--ft-text-primary))";

  if (orientation === "vertical") {
    return (
      <div
        style={{
          position: "relative",
          width,
          height,
          background: barcodeBg,
          borderRight: "1px solid rgb(var(--ft-border-faint))",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 18 100" preserveAspectRatio="none" style={{ display: "block" }}>
          {bars.map((b, i) => (
            <rect key={i} x="3" y={b.pos} width="12" height={b.w} fill={barcodeInk} />
          ))}
        </svg>
      </div>
    );
  }
  return (
    <div style={{ width: "100%", height, background: barcodeBg, position: "relative" }}>
      <svg width="100%" height="100%" viewBox="0 0 100 18" preserveAspectRatio="none">
        {bars.map((b, i) => (
          <rect key={i} y="3" x={b.pos} height="12" width={b.w} fill={barcodeInk} />
        ))}
      </svg>
    </div>
  );
}

/**
 * 14-day mini sparkline. Renders a flat empty-state when `data` is null.
 */
export function Sparkline({
  data,
  width = 76,
  height = 22,
  color,
  target,
}: {
  data: number[] | null;
  width?: number;
  height?: number;
  color?: string;
  target?: number;
}) {
  const stroke = color ?? "rgb(var(--ft-accent))";
  if (!data || data.length === 0) {
    return (
      <svg width={width} height={height} style={{ display: "block" }}>
        <line
          x1={1} y1={height / 2}
          x2={width - 1} y2={height / 2}
          stroke="rgb(var(--ft-border-faint))"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
      </svg>
    );
  }
  const min = Math.min(...data, target ?? Infinity);
  const max = Math.max(...data, target ?? -Infinity);
  const span = max - min || 1;
  const xAt = (i: number) => (i / (data.length - 1)) * (width - 2) + 1;
  const yAt = (v: number) => height - 2 - ((v - min) / span) * (height - 4);
  const path = data.map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(" ");
  const area = `${path} L ${xAt(data.length - 1).toFixed(1)} ${height - 1} L ${xAt(0).toFixed(1)} ${height - 1} Z`;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <path d={area} fill={stroke} opacity=".10" />
      {target != null && (
        <line
          x1="0" y1={yAt(target)}
          x2={width} y2={yAt(target)}
          stroke="rgb(var(--ft-text-tertiary))"
          strokeWidth=".7"
          strokeDasharray="2 2"
          opacity=".55"
        />
      )}
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xAt(data.length - 1)} cy={yAt(data[data.length - 1])} r="2" fill="rgb(var(--ft-surface))" stroke={stroke} strokeWidth="1.2" />
    </svg>
  );
}

/**
 * Generic card with optional barcode strip. Per the prototype, the
 * barcode is gated to lab + notebook chromes only.
 */
export function Card({
  children,
  style,
  withBarcode = false,
  padding,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
  withBarcode?: boolean | number;
  padding?: number;
}) {
  const { chrome } = useTheme();
  const showBarcode = withBarcode && (chrome === "lab" || chrome === "notebook");
  const seed = typeof withBarcode === "number" ? withBarcode : 4;
  return (
    <div
      className="ft-card"
      style={{
        background: "rgb(var(--ft-surface))",
        border: "1px solid rgb(var(--ft-border))",
        borderRadius: 8,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {showBarcode && (
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 18, borderRight: "1px solid rgb(var(--ft-border-faint))" }}>
          <BarcodeStrip width={18} height="100%" seed={seed} />
        </div>
      )}
      <div style={{ padding: padding ?? 14, paddingLeft: showBarcode ? 30 : padding ?? 14 }}>
        {children}
      </div>
    </div>
  );
}

/** Section header (kicker + title + right slot). */
export function SectionH({
  kicker,
  title,
  right,
  style,
}: {
  kicker?: string;
  title?: string;
  right?: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10, ...style }}>
      <div>
        {kicker && (
          <Mono size={9} weight={600} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".18em", textTransform: "uppercase", display: "block", marginBottom: 3 }}>
            {kicker}
          </Mono>
        )}
        {title && <Plex size={15} weight={600}>{title}</Plex>}
      </div>
      {right}
    </div>
  );
}

/** Solid CTA button. */
export function PrimaryBtn({
  children,
  variant = "primary",
  style,
  onClick,
  disabled,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary";
  style?: React.CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="font-body"
      style={{
        background: isPrimary ? "rgb(var(--ft-accent))" : "transparent",
        color: isPrimary ? "rgb(var(--ft-text-on-accent))" : "rgb(var(--ft-text-secondary))",
        border: `1px solid ${isPrimary ? "rgb(var(--ft-accent))" : "rgb(var(--ft-border))"}`,
        borderRadius: 6,
        padding: "9px 14px",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: ".01em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** Small data-table for metric breakdowns. */
export function DataTable({
  rows,
}: {
  rows: { label: string; value: string; diff?: string; diffTone?: "red" | "yellow" | "green" }[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: 12,
            alignItems: "baseline",
            padding: "5px 0",
            borderBottom: i < rows.length - 1 ? "1px dashed rgb(var(--ft-border-faint))" : "none",
          }}
        >
          <Plex size={11.5} weight={500} color="rgb(var(--ft-text-secondary))">{r.label}</Plex>
          <Mono size={11.5} weight={600}>{r.value}</Mono>
          {r.diff && (
            <Mono
              size={10}
              weight={600}
              color={
                r.diffTone === "red" ? "rgb(var(--ft-danger-fg))"
                : r.diffTone === "yellow" ? "rgb(var(--ft-warn-fg))"
                : r.diffTone === "green" ? "rgb(var(--ft-success-fg))"
                : "rgb(var(--ft-text-tertiary))"
              }
            >
              {r.diff}
            </Mono>
          )}
        </div>
      ))}
    </div>
  );
}

/** Small label/value pair. */
export function SmallStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "red" | "yellow" | "green";
}) {
  const valueColor =
    tone === "red" ? "rgb(var(--ft-danger-fg))"
    : tone === "yellow" ? "rgb(var(--ft-warn-fg))"
    : tone === "green" ? "rgb(var(--ft-success-fg))"
    : "rgb(var(--ft-text-primary))";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <Mono size={9} weight={500} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em", textTransform: "uppercase" }}>
        {label}
      </Mono>
      <Mono size={13} weight={600} color={valueColor}>
        {value}
      </Mono>
    </div>
  );
}
