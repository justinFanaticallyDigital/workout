"use client";

/**
 * GCard — alternating-tilt graffiti card with optional FreshTape stamp.
 *
 * Verbatim port of gameplan-active.jsx#GCard (lines 216–241). Tilt is
 * a graffiti-only idiom; every other chrome flattens via the
 * `chrome !== "graffiti"` gate and picks up its native `.ft-card`
 * chrome from globals.css (lab barcode, notebook spiral binding,
 * iron brass rib, arcade pixel bezel, etc.).
 *
 * Distinct from R4 `PickerCard` (which adds an iron BrassRib). GCard
 * is the graffiti-native card variant; it does NOT layer on a brass
 * rib because the prototype's gameplan canvas leans on the graffiti
 * idiom rather than iron.
 */

import type { CSSProperties, ReactNode } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { FreshTape } from "./Ornaments";

export function GCard({
  children,
  tilt = 0.4,
  accent,
  style,
  padding = 16,
  freshTape,
}: {
  children: ReactNode;
  /** Graffiti-only rotation in degrees (alternating ±). */
  tilt?: number;
  /** Optional 4px accent stripe on the left edge. */
  accent?: string;
  style?: CSSProperties;
  padding?: number;
  /** Optional FreshTape badge anchored to top-right. */
  freshTape?: string;
}) {
  const { chrome } = useTheme();
  const graffiti = chrome === "graffiti";
  const borderC = graffiti ? "rgba(255,255,255,.06)" : "rgb(var(--ft-border-faint))";
  return (
    <div
      className="ft-card"
      style={{
        position: "relative",
        background: "rgb(var(--ft-surface))",
        border: `1px solid ${borderC}`,
        borderLeft: accent ? `4px solid ${accent}` : `1px solid ${borderC}`,
        padding,
        transform: graffiti ? `rotate(${tilt}deg)` : "none",
        boxShadow: graffiti
          ? "0 2px 0 rgba(0,0,0,.35), 0 8px 18px rgba(0,0,0,.30)"
          : "0 1px 2px rgba(0,0,0,.08)",
        ...style,
      }}
    >
      {freshTape && (
        <div style={{ position: "absolute", top: -10, right: 14, zIndex: 4 }}>
          <FreshTape rotate={-7} size="sm" label={freshTape} />
        </div>
      )}
      {children}
    </div>
  );
}
