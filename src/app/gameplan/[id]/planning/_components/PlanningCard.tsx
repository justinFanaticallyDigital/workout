"use client";

/**
 * Card chrome with 4 crosshair corner marks + optional top-edge
 * label. Verbatim port of planning-screens.jsx#BPCard (lines 49–78).
 *
 * Iron chrome layers on the R4 BrassRib for ornament parity; every
 * other chrome relies on the global `.ft-card` chrome from
 * `globals.css [data-theme="X"]`.
 */

import type { CSSProperties, ReactNode } from "react";
import { Crosshair } from "./Crosshair";
import { BrassRib } from "@/app/gameplan/new/_picker/Ornaments";

export function PlanningCard({
  children,
  style,
  label,
  accent,
}: {
  children: ReactNode;
  style?: CSSProperties;
  /** Optional top-edge embedded label text. */
  label?: string;
  /** When true, adds an inset-accent ring (used to highlight pre-staged fields). */
  accent?: boolean;
}) {
  return (
    <div
      className="ft-card"
      style={{
        position: "relative",
        background: "rgb(var(--ft-surface))",
        border: "1px solid rgb(var(--ft-border))",
        color: "rgb(var(--ft-text-primary))",
        padding: "14px 14px 12px",
        ...(accent
          ? {
              boxShadow:
                "inset 0 0 0 1px rgb(var(--ft-accent-border)), 0 0 0 1px rgb(var(--ft-accent-faint))",
            }
          : {}),
        ...style,
      }}
    >
      {/* Iron-only brass rib for chrome parity with R4/R5 cards. */}
      <BrassRib />
      <Crosshair style={{ top: -5, left: -5 }} />
      <Crosshair style={{ top: -5, right: -5 }} />
      <Crosshair style={{ bottom: -5, left: -5 }} />
      <Crosshair style={{ bottom: -5, right: -5 }} />
      {label ? (
        <div
          className="font-body"
          style={{
            position: "absolute",
            top: -8,
            left: 12,
            background: "rgb(var(--ft-surface))",
            fontSize: 8,
            letterSpacing: ".18em",
            padding: "0 6px",
            color: "rgb(var(--ft-text-secondary))",
          }}
        >
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}
