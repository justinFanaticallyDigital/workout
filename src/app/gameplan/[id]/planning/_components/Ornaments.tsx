"use client";

/**
 * Planning-specific ornaments — verbatim ports of planning-screens.jsx
 * `Dashed` (lines 81–91) + `DashedV` (92–103) + `DWGStrip` (106–137).
 *
 * The 6px-cadence `Dashed` is distinct from R5's 12px `DashedDivider`;
 * keeping them separate so the two design vocabularies don't fight.
 *
 * `DWGStrip` is iron/blueprint-style chrome — gated to blueprint
 * chrome only, per the prototype's `isBlueprint()` check inside
 * `StickyApplyBar`.
 */

import type { CSSProperties } from "react";
import { useTheme } from "@/providers/ThemeProvider";

/** 6px-cadence horizontal divider. */
export function PlanningDashed({
  color = "rgb(var(--ft-border-strong))",
  style,
}: {
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      style={{
        height: 1,
        backgroundImage: `linear-gradient(90deg, ${color} 50%, transparent 50%)`,
        backgroundSize: "6px 1px",
        backgroundRepeat: "repeat-x",
        ...style,
      }}
    />
  );
}

/** 6px-cadence vertical divider. */
export function PlanningDashedV({
  color = "rgb(var(--ft-border-strong))",
  style,
}: {
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      style={{
        width: 1,
        backgroundImage: `linear-gradient(0deg, ${color} 50%, transparent 50%)`,
        backgroundSize: "1px 6px",
        backgroundRepeat: "repeat-y",
        ...style,
      }}
    />
  );
}

/**
 * Blueprint-only DWG title-block strip — bottom-edge metadata grid
 * (DWG / USER / DATE / SHT). Renders `null` on every other chrome.
 */
export function DWGStrip({
  vNum = "v2",
  user = "USR-7723",
  date,
}: {
  vNum?: string;
  user?: string;
  date?: string;
}) {
  const { chrome } = useTheme();
  if (chrome !== "blueprint") return null;
  const isoDate = date ?? new Date().toISOString().slice(0, 10);
  return (
    <div
      style={{
        borderTop: "1px solid rgb(var(--ft-border-strong))",
        background: "rgb(var(--ft-bg-alt))",
        fontSize: 7,
        letterSpacing: ".12em",
        color: "rgb(var(--ft-text-on-bg))",
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 1fr .7fr",
        lineHeight: 1.3,
      }}
      className="font-body"
    >
      <div style={{ padding: "4px 8px", borderRight: "1px solid rgb(var(--ft-border-strong))" }}>
        <div style={{ opacity: 0.55, fontSize: 6 }}>DWG</div>
        <div style={{ fontWeight: 700 }}>GAMEPLAN-DRAFT-{vNum}</div>
      </div>
      <div style={{ padding: "4px 8px", borderRight: "1px solid rgb(var(--ft-border-strong))" }}>
        <div style={{ opacity: 0.55, fontSize: 6 }}>USER</div>
        <div style={{ fontWeight: 700 }}>{user}</div>
      </div>
      <div style={{ padding: "4px 8px", borderRight: "1px solid rgb(var(--ft-border-strong))" }}>
        <div style={{ opacity: 0.55, fontSize: 6 }}>DATE</div>
        <div style={{ fontWeight: 700 }}>{isoDate}</div>
      </div>
      <div style={{ padding: "4px 8px", textAlign: "right" }}>
        <div style={{ opacity: 0.55, fontSize: 6 }}>SHT</div>
        <div style={{ fontWeight: 700 }}>1/1</div>
      </div>
    </div>
  );
}
