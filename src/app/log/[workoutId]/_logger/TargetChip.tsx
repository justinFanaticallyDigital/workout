"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { IconTarget } from "./icons";

/**
 * Target chip — "3×8-10" with crosshair icon, shown in the Lane
 * header. Per the prototype, the notebook chrome drops the dashed
 * border and uses larger Caveat type so it reads as a marginal
 * scribble rather than a clinical tag.
 *
 * Per-chrome branches (verbatim from logger-app.jsx#TargetChip):
 *   lab        → 3px radius dashed border, tracked digits
 *   notebook   → no border, larger Caveat, no tracking
 *   iron/arcade/blueprint/cyberpunk/graffiti → sharp dashed border, tracked digits
 */
export default function TargetChip({
  targetSets,
  targetRepRange,
}: {
  targetSets: number | null | undefined;
  targetRepRange: string | null | undefined;
}) {
  const { chrome } = useTheme();
  if (!targetSets || !targetRepRange) return null;
  const isNotebook = chrome === "notebook";
  const isLab = chrome === "lab";
  const isArcade = chrome === "arcade";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: isNotebook ? 0 : "2px 6px",
        border: isNotebook ? "none" : "1px dashed rgb(var(--ft-border) / 0.7)",
        borderRadius: isLab ? 3 : 0,
        color: "rgb(var(--ft-text-tertiary))",
        flexShrink: 0,
      }}
    >
      <IconTarget size={isNotebook ? 13 : 12} />
      <span
        className="font-data tabular-nums"
        style={{
          fontSize: isNotebook ? 15 : 11,
          fontWeight: 600,
          letterSpacing: isArcade ? 0 : ".02em",
        }}
      >
        {targetSets}×{targetRepRange}
      </span>
    </div>
  );
}
