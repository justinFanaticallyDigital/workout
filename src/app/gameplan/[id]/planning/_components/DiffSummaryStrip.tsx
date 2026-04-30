"use client";

/**
 * NEW (not in prototype): horizontal chip strip listing every pending
 * edit. Sits below the `PlanningHeader` so the user can scan all
 * pending changes at a glance without expanding `ApplyModal`.
 *
 * The prototype's pending counter shows just a number; R7 adds the
 * itemized strip per the prompt's Step 1 file layout requirement
 * (`DiffSummaryStrip.tsx`).
 */

import type { DiffEntry } from "./types";

export function DiffSummaryStrip({ diff }: { diff: DiffEntry[] }) {
  if (diff.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        padding: "8px 12px",
        borderBottom: "1px dashed rgb(var(--ft-border-faint))",
        background: "rgb(var(--ft-bg-alt))",
      }}
    >
      {diff.map((d, i) => (
        <span
          key={i}
          className="font-body"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 8px",
            border: "1px solid rgb(var(--ft-accent-border))",
            background: "rgb(var(--ft-accent-faint))",
            color: "rgb(var(--ft-accent))",
            fontSize: 9,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            borderRadius: 999,
          }}
        >
          {chipLabel(d)}
        </span>
      ))}
    </div>
  );
}

function chipLabel(d: DiffEntry): string {
  switch (d.kind) {
    case "program":
      return `Program ${d.field}`;
    case "block":
      return `${d.blockName} · ${d.field}`;
    case "day":
      return `${d.dayName} · ${d.field}`;
    case "exercise":
      return `${d.exerciseName.slice(0, 14)} · ${d.field}`;
    case "goal":
      return `${d.goalTitle} · ${d.field}`;
    case "nutrition":
      return `Nutrition · ${d.field}`;
    case "lifestyle":
      return `Lifestyle · ${d.key}`;
    case "override-new":
      return `Override · ${d.summary}`;
  }
}
