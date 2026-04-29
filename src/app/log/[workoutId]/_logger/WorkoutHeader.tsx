"use client";

import Link from "next/link";
import { useTheme } from "@/providers/ThemeProvider";

/**
 * Session header — block/day name + week badge + per-chrome ornament.
 *
 * Ports `ThemeHeader` from logger-app.jsx (lines 67–157) verbatim with
 * 5 explicit chrome branches (iron / lab / notebook / arcade) plus the
 * shared fallback that handles blueprint / cyberpunk / graffiti via
 * theme tokens.
 *
 * Per-chrome attestations:
 *   iron      → IRON · CHALK stamp, brass hairline divider, stencil display
 *   lab       → SPECIMEN · ID-stamp, white surface, mini barcode
 *   notebook  → handwritten margin scribble + "log!" angled badge, 40px left padding
 *   arcade    → 1P / HI 999999 stamps + LOG SESSION center, neon dividers
 *   blueprint → DWG · LOG stamp, lowercase day, 16px display
 *   cyberpunk → SYS://LOG stamp, tracked-out caps
 *   graffiti  → FRESH stamp, marker display
 *
 * Back-link + sticky positioning preserved from the live header that
 * this replaces (page.tsx lines 928–966).
 */
export default function WorkoutHeader({
  blockName,
  dayName,
  currentWeekIdx,
  totalWeeks,
  dateLabel,
  backHref = "/log",
  backLabel = "Back",
  rightSlot,
}: {
  blockName: string | null;
  dayName: string;
  /** Zero-indexed; UI shows currentWeekIdx + 1. */
  currentWeekIdx: number;
  /** Total weeks in the block; UI shows " / N". Falls back to the higher of (idx+1, 4). */
  totalWeeks?: number | null;
  dateLabel?: string | null;
  backHref?: string;
  backLabel?: string;
  /** Optional right-side slot (e.g. workout timer). */
  rightSlot?: React.ReactNode;
}) {
  const { chrome } = useTheme();
  const wkN = (totalWeeks ?? Math.max(currentWeekIdx + 1, 4));
  const wkOf = `${currentWeekIdx + 1}/${wkN}`;
  const block = (blockName ?? "").trim();
  const day = dayName.trim();

  // ─── iron ───────────────────────────────────────────────────────
  if (chrome === "iron") {
    return (
      <Header backHref={backHref} backLabel={backLabel} rightSlot={rightSlot}>
        <div
          style={{
            padding: "14px 16px 12px",
            borderBottom: "1px solid rgb(var(--ft-accent) / 0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              className="font-display"
              style={{
                fontSize: 20,
                lineHeight: 1,
                color: "rgb(var(--ft-text-primary))",
                textTransform: "uppercase",
              }}
            >
              {day}
            </div>
            <div
              className="font-body"
              style={{
                fontSize: 11,
                letterSpacing: ".22em",
                color: "rgb(var(--ft-text-tertiary))",
                marginTop: 4,
                textTransform: "uppercase",
              }}
            >
              {block ? `${block} · W${currentWeekIdx + 1}` : `W${currentWeekIdx + 1}`}
            </div>
          </div>
          <span className="ft-stamp">IRON · CHALK</span>
        </div>
      </Header>
    );
  }

  // ─── lab ────────────────────────────────────────────────────────
  if (chrome === "lab") {
    return (
      <Header backHref={backHref} backLabel={backLabel} rightSlot={rightSlot}>
        <div
          style={{
            padding: "14px 16px 12px",
            borderBottom: "1px solid rgb(var(--ft-border))",
            background: "rgb(var(--ft-surface))",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <span className="ft-stamp" style={{ marginBottom: 4, display: "inline-block" }}>
              SPECIMEN · FT-{new Date().toISOString().slice(0, 10).replace(/-/g, "")}-01
            </span>
            <div
              className="font-display"
              style={{ fontSize: 18, lineHeight: 1.15, color: "rgb(var(--ft-text-primary))" }}
            >
              {day}
            </div>
            <div
              className="font-data"
              style={{
                fontSize: 11,
                color: "rgb(var(--ft-text-tertiary))",
                marginTop: 3,
              }}
            >
              {block ? `${block} · ` : ""}week {currentWeekIdx + 1}/{wkN}
              {dateLabel ? ` · ${dateLabel}` : ""}
            </div>
          </div>
          <MiniBarcode width={64} />
        </div>
      </Header>
    );
  }

  // ─── notebook ───────────────────────────────────────────────────
  if (chrome === "notebook") {
    const dayShort = day.split("·")[0].trim() || day;
    return (
      <Header backHref={backHref} backLabel={backLabel} rightSlot={rightSlot}>
        <div style={{ padding: "18px 16px 10px 52px", position: "relative" }}>
          <div
            className="font-display"
            style={{ fontSize: 32, lineHeight: 1, color: "rgb(var(--ft-accent))" }}
          >
            {dayShort}
          </div>
          <div
            style={{
              fontSize: 15,
              color: "rgb(var(--ft-text-secondary))",
              marginTop: 2,
              fontFamily: "Patrick Hand, var(--ft-font-body)",
            }}
          >
            {block ? `${block} — ` : ""}week {currentWeekIdx + 1} of {wkN}
            {dateLabel ? ` · ${dateLabel}` : ""}
          </div>
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 14,
              fontFamily: "Caveat, var(--ft-font-display)",
              fontSize: 20,
              color: "rgb(var(--ft-accent))",
              transform: "rotate(-4deg)",
              border: "1.5px solid rgb(var(--ft-accent))",
              padding: "1px 10px 2px",
              borderRadius: 20,
            }}
          >
            log!
          </div>
        </div>
      </Header>
    );
  }

  // ─── arcade ─────────────────────────────────────────────────────
  if (chrome === "arcade") {
    return (
      <Header backHref={backHref} backLabel={backLabel} rightSlot={rightSlot}>
        <div
          style={{
            padding: "12px 14px 10px",
            borderBottom: "1px solid rgb(var(--ft-accent) / 0.4)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span className="ft-stamp" style={{ color: "rgb(var(--ft-info-fg))" }}>
              1P
            </span>
            <div
              className="font-display"
              style={{ fontSize: 12, color: "rgb(var(--ft-text-primary))" }}
            >
              LOG SESSION
            </div>
            <span className="ft-stamp" style={{ color: "rgb(var(--ft-accent))" }}>
              HI 999999
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <div
              className="font-data"
              style={{ fontSize: 14, color: "rgb(var(--ft-info-fg))" }}
            >
              {day.toUpperCase().replace(/·/g, "//")}
            </div>
            <div
              className="font-data"
              style={{ fontSize: 13, color: "rgb(var(--ft-accent))" }}
            >
              WK {wkOf}
            </div>
          </div>
        </div>
      </Header>
    );
  }

  // ─── blueprint / cyberpunk / graffiti — token-driven fallback ──
  const stamp =
    chrome === "blueprint" ? "DWG · LOG"
    : chrome === "cyberpunk" ? "SYS://LOG"
    : "FRESH";
  const dayDisplay = chrome === "blueprint" ? day.toLowerCase() : day;
  return (
    <Header backHref={backHref} backLabel={backLabel} rightSlot={rightSlot}>
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: "1px solid rgb(var(--ft-border) / 0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            className="font-display"
            style={{
              fontSize: chrome === "blueprint" ? 16 : 18,
              color: "rgb(var(--ft-text-primary))",
              lineHeight: 1.1,
            }}
          >
            {dayDisplay}
          </div>
          <div
            className="font-data"
            style={{
              fontSize: 10,
              color: "rgb(var(--ft-text-tertiary))",
              marginTop: 4,
              letterSpacing: ".18em",
              textTransform: "uppercase",
            }}
          >
            {block ? `${block} · ` : ""}WK {wkOf}
            {dateLabel ? ` · ${dateLabel}` : ""}
          </div>
        </div>
        <span className="ft-stamp">{stamp}</span>
      </div>
    </Header>
  );
}

/** Shared sticky-header chrome (back link + status pill + main slot). */
function Header({
  children,
  backHref,
  backLabel,
  rightSlot,
}: {
  children: React.ReactNode;
  backHref: string;
  backLabel: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div
      className="sticky top-0 z-10"
      style={{ background: "rgb(var(--ft-bg))" }}
    >
      <div
        className="px-4 pt-3 pb-1 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgb(var(--ft-border) / 0.35)" }}
      >
        <Link
          href={backHref}
          className="font-body text-sm"
          style={{ color: "rgb(var(--ft-text-tertiary))" }}
        >
          ← {backLabel}
        </Link>
        <div className="flex items-center gap-2">
          <span
            className="ft-stamp"
            style={{
              borderColor: "rgb(var(--ft-success-fg) / 0.5)",
              color: "rgb(var(--ft-success-fg))",
            }}
          >
            LOGGING
          </span>
          {rightSlot}
        </div>
      </div>
      {children}
    </div>
  );
}

/** Static SVG mini-barcode used in the lab header. */
function MiniBarcode({ width = 64 }: { width?: number }) {
  // Fixed bar pattern so SSR/hydration match.
  const bars = [1.2, 0.6, 1.8, 0.5, 1.0, 0.8, 1.4, 0.6, 1.6, 0.7, 1.2, 0.9, 1.0, 1.5];
  let pos = 0;
  return (
    <div
      style={{
        width,
        height: 24,
        background: "#fff",
        border: "1px solid rgb(var(--ft-border))",
        borderRadius: 2,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 24" preserveAspectRatio="none">
        {bars.map((w, i) => {
          const x = pos;
          pos += w + 0.7;
          return <rect key={i} x={(x * 5).toFixed(1)} y="2" width={(w * 5).toFixed(1)} height="20" fill="#0a0e16" />;
        })}
      </svg>
    </div>
  );
}
