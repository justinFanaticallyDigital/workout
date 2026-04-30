// src/lib/goal-engine/rules/adherence-low.ts
// ============================================================================
// Rule: adherence-low
//
// Spec §8.4: "<70% of scheduled sessions completed in past 7d".
// Output: "Push deload back / reduce volume / address barriers".
// ============================================================================

import type { EngineState, RecommendationDraft, RuleFn } from "../types";

export const adherenceLow: RuleFn = (state: EngineState): RecommendationDraft | null => {
  const { adherence } = state;
  if (adherence.scheduled7d === 0) return null;
  if (adherence.ratio >= 0.7) return null;

  const completedPct = Math.round(adherence.ratio * 100);
  const missed = adherence.scheduled7d - adherence.completed7d;

  return {
    kind: "adherence_low",
    severity: adherence.ratio < 0.5 ? "urgent" : "warning",
    title: `Adherence dropped to ${completedPct}%`,
    body: `${adherence.completed7d} of ${adherence.scheduled7d} scheduled sessions in the past 7 days (missed ${missed}). Suggestion: push the upcoming deload one week earlier, reduce planned volume by 20%, or revisit days/week if barriers are persistent.`,
    suggestedField: "schedule.reduce_volume",
    suggestedValue: JSON.stringify({ volumeMultiplier: 0.8 }),
    snapshotData: {
      scheduled7d: adherence.scheduled7d,
      completed7d: adherence.completed7d,
      ratio: adherence.ratio,
    },
  };
};
