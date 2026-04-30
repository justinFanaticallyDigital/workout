// src/lib/goal-engine/rules/deload-shift.ts
// ============================================================================
// Deload shift — spec §8.4.
//
// Trigger: this week's adherence ratio < 0.7 AND the next block in
// the program has phase="deload" AND that block starts within ≤7 days.
//
// Spec wording: "adherence-low fires in week before scheduled deload"
// → "Push deload earlier / use this week as deload."
//
// Output: severity warning. `suggestedField` is "block.deloadWeek"
// which isn't in the apply dispatcher; UI falls back to Open in
// Planning Mode where the user can drag the deload boundary.
// ============================================================================

import type { EngineState, RecommendationDraft } from "../types";

const ADHERENCE_THRESHOLD = 0.7;
const DELOAD_WINDOW_DAYS = 7;

export function deloadShift(state: EngineState): RecommendationDraft | null {
  const { adherence, nextBlock, today } = state;
  if (adherence.scheduled7d === 0) return null;
  if (adherence.ratio >= ADHERENCE_THRESHOLD) return null;
  if (!nextBlock || nextBlock.phase !== "deload" || !nextBlock.startDate) return null;

  const start = new Date(nextBlock.startDate);
  if (Number.isNaN(start.getTime())) return null;
  const daysUntil = Math.floor((start.getTime() - today.getTime()) / 86400000);
  if (daysUntil > DELOAD_WINDOW_DAYS || daysUntil < 0) return null;

  const completed = adherence.completed7d;
  const scheduled = adherence.scheduled7d;
  return {
    kind: "deload_shift",
    severity: "warning",
    title: `Pull the deload forward — ${completed}/${scheduled} sessions this week`,
    body: [
      `Adherence is low and a deload block is queued ${daysUntil === 0 ? "tomorrow" : `in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`}.`,
      `Use this week as the deload instead — body's already telling you to back off, the calendar might as well agree.`,
    ].join(" "),
    suggestedField: "block.deloadWeek",
    suggestedValue: JSON.stringify({
      shiftEarlierBy: daysUntil + 7,
      reason: "adherence_low_pre_deload",
    }),
    snapshotData: {
      thisWeek: { completed, scheduled, ratio: adherence.ratio },
      nextDeloadStart: nextBlock.startDate,
      daysUntilDeload: daysUntil,
    },
  };
}
