"use client";

/**
 * PLANNING MODE rotated stencil — verbatim port of
 * planning-screens.jsx#PlanningStamp (lines 143–159).
 *
 * Distinct from `@/components/ui/PlanningSection.tsx#PlanningStamp`
 * (R1 shared placeholder badge) — the planning route's own stamp
 * carries the prototype's chrome-branched border weight (1.5px on
 * blueprint, 1px on others) and the `small` size variant used inside
 * `ApplyModal`.
 */

import { useTheme } from "@/providers/ThemeProvider";

export function PlanningModeStamp({ small }: { small?: boolean }) {
  const { chrome } = useTheme();
  const fs = small ? 8 : 10;
  const onBlueprint = chrome === "blueprint";
  // Rotation only renders on graffiti via the prototype's stripTilt
  // contract — every other chrome flattens to level baseline.
  const transform = chrome === "graffiti" ? "rotate(-3deg)" : "none";
  return (
    <div
      className="font-display"
      style={{
        display: "inline-block",
        border: onBlueprint
          ? "1.5px solid rgb(var(--ft-accent-border))"
          : "1px solid rgb(var(--ft-accent-border))",
        color: "rgb(var(--ft-accent))",
        padding: small ? "2px 6px" : "4px 9px",
        fontSize: fs,
        letterSpacing: ".22em",
        transform,
        background: "rgb(var(--ft-accent-faint))",
        whiteSpace: "nowrap",
      }}
    >
      PLANNING MODE
    </div>
  );
}
