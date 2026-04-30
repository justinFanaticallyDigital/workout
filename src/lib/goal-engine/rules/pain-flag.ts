// src/lib/goal-engine/rules/pain-flag.ts
// ============================================================================
// Pain flag — spec §8.4 (Comeback gameplan).
//
// Trigger: pain_check log ≥6 on 2+ days in the past 7.
//
// Output: severity urgent, body suggests reducing load by ~20% and
// consulting a professional if pain persists.
//
// Per R9 hot-question 3 the spec gates this rule to the Comeback
// gameplan; the repo doesn't yet differentiate gameplan templates
// in schema, so v1 fires the rule universally — pain ≥6 logged
// 2+ days is worth surfacing regardless of program.
// OMIT-WITH-COMMENT: Comeback-only gating until gameplan tags ship.
// ============================================================================

import type { EngineState, RecommendationDraft } from "../types";

const PAIN_THRESHOLD = 6;
const DAY_THRESHOLD = 2;

export function painFlag(state: EngineState): RecommendationDraft | null {
  const painSnap = state.lifestyle.find((s) => s.key === "pain_check");
  if (!painSnap) return null;

  let highDays = 0;
  let maxValue = 0;
  for (const p of painSnap.points) {
    if (p.value == null) continue;
    if (p.value >= PAIN_THRESHOLD) {
      highDays += 1;
      if (p.value > maxValue) maxValue = p.value;
    }
  }

  if (highDays < DAY_THRESHOLD) return null;

  return {
    kind: "pain_flag",
    severity: "urgent",
    title: `Pain ≥${PAIN_THRESHOLD} logged on ${highDays} days`,
    body: [
      `Pain is hitting ${maxValue}/10 across multiple days this week.`,
      `Drop training load ~20% and consult a professional if it doesn't settle. Open Planning Mode to dial back volume.`,
    ].join(" "),
    suggestedField: "training.volumeMultiplier",
    suggestedValue: JSON.stringify({ multiplier: 0.8, reason: "pain_flag" }),
    snapshotData: {
      key: "pain_check",
      highDays,
      maxValue,
      threshold: PAIN_THRESHOLD,
    },
  };
}
