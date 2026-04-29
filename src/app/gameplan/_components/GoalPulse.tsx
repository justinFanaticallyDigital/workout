"use client";

/**
 * Goal pulse — horizontal strip of `GoalCard`s + `TrajectoryModal`
 * trigger. Verbatim port of gameplan-active.jsx#GoalPulse (lines
 * 1203–1219), with the hand-coded GOALS array replaced by goals
 * derived from `/api/goals` (deferred to the parent).
 *
 * `goals` come from the page; if the user has no goals set the
 * component renders `null` (the GoalPulse simply collapses).
 */

import { useState } from "react";
import { GoalCard, type GoalPlan } from "./GoalCard";
import { TrajectoryModal } from "./TrajectoryModal";

export function GoalPulse({ goals }: { goals: GoalPlan[] }) {
  const [open, setOpen] = useState<GoalPlan | null>(null);
  if (goals.length === 0) return null;
  // Tilt alternates per card index so the strip reads as graffiti
  // tape-stack on graffiti chrome and stays flat on every other.
  const tiltFor = (i: number): number => {
    const seq = [-0.4, 0.5, -0.3, 0.4, -0.2];
    return seq[i % seq.length];
  };
  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "4px 18px 12px",
          margin: "0 -18px",
          justifyContent: "space-between",
          overflowX: "auto",
        }}
      >
        {goals.map((g, i) => (
          <GoalCard key={g.label} goal={g} tilt={tiltFor(i)} onTap={() => setOpen(g)} />
        ))}
      </div>
      {open && <TrajectoryModal goal={open} onClose={() => setOpen(null)} />}
    </>
  );
}
