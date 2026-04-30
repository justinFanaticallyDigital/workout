// src/lib/goal-engine/rules/adherence-low-streak.ts
// ============================================================================
// Adherence-low streak — spec §8.4.
//
// Trigger: this week's adherence_low has fired (current ratio < 0.7)
// AND another adherence_low Recommendation row exists in the last 14
// days. The streak rule signals "this is the second week running" so
// the engine surfaces a stronger nudge than the per-week rec alone.
//
// Output: severity warning, body suggests reducing days/wk to a
// sustainable rate per spec §8.4 example copy.
//
// The rule reads `state.recentRecommendations` rather than reaching
// into Prisma — the hydrator is responsible for populating that
// window so this stays a pure function over plain data.
// ============================================================================

import type { EngineState, RecommendationDraft } from "../types";

const ADHERENCE_THRESHOLD = 0.7;
const STREAK_WINDOW_DAYS = 14;

export function adherenceLowStreak(state: EngineState): RecommendationDraft | null {
  const { adherence, recentRecommendations, today } = state;
  if (adherence.scheduled7d === 0) return null;
  if (adherence.ratio >= ADHERENCE_THRESHOLD) return null;

  const cutoff = today.getTime() - STREAK_WINDOW_DAYS * 86400000;
  const priorAdherenceLow = recentRecommendations.find((r) => {
    if (r.kind !== "adherence_low") return false;
    const t = new Date(r.createdAt).getTime();
    return t >= cutoff && t < today.getTime();
  });

  if (!priorAdherenceLow) return null;

  const completed = adherence.completed7d;
  const scheduled = adherence.scheduled7d;
  return {
    kind: "adherence_low_streak",
    severity: "warning",
    title: "Low adherence two weeks running",
    body: [
      `${completed}/${scheduled} sessions completed this week, and the engine flagged the same shortfall last week.`,
      `Consider reducing days/wk to a sustainable rate — a 4-day plan you actually run beats a 5-day plan you skip.`,
    ].join(" "),
    suggestedField: "training.daysPerWeek",
    suggestedValue: JSON.stringify({
      currentScheduled: scheduled,
      suggestedReduction: 1,
    }),
    snapshotData: {
      thisWeek: { completed, scheduled, ratio: adherence.ratio },
      priorFiredAt: priorAdherenceLow.createdAt,
      windowDays: STREAK_WINDOW_DAYS,
    },
  };
}
