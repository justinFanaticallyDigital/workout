// src/lib/goal-engine/rules/ahead-target.ts
// ============================================================================
// Rule: ahead-target
//
// Spec §8.4: "Body-metric goal projection >0.5×rate ahead".
// Output: "You're ahead — maintain or pull target in by N weeks?"
// ============================================================================

import type { EngineState, RecommendationDraft, RuleFn } from "../types";
import { actualWeeklyRate, weeklyRate, driftFromExpected, projectedHitDate } from "../rate-math";

export const aheadTarget: RuleFn = (state: EngineState): RecommendationDraft | null => {
  const goal = state.goals.find(
    (g) => g.kind === "weight" || g.kind === "bodyweight",
  );
  if (!goal) return null;
  if (goal.currentValue == null) return null;

  const prescribedRate = weeklyRate(
    goal.startValue,
    goal.targetValue,
    goal.startDate,
    goal.targetDate,
  );
  const actualRate = actualWeeklyRate(goal.series.rolling7);
  if (prescribedRate === 0) return null;

  const expectedNow = goal.series.expected[goal.series.currentDay];
  if (expectedNow == null) return null;
  const drift = driftFromExpected(goal.currentValue, expectedNow);
  const cutting = goal.targetValue < goal.startValue;
  // Direction-aware "ahead": cutting = drift below expected (less weight
  // = ahead); bulking = drift above expected (more weight = ahead).
  const isAhead = cutting ? drift < 0 : drift > 0;
  if (!isAhead) return null;

  const weeksElapsed = goal.series.currentDay / 7;
  const threshold = Math.abs(0.5 * prescribedRate * Math.max(1, weeksElapsed));
  if (Math.abs(drift) <= threshold) return null;

  // Suggest pulling the target date in. Use actual rate to project hit.
  const todayIso = state.today.toISOString().slice(0, 10);
  const newTargetDate = projectedHitDate(
    goal.currentValue,
    goal.targetValue,
    actualRate,
    todayIso,
  );
  const driftDisplay = `${drift > 0 ? "+" : "−"}${Math.abs(drift).toFixed(1)} ${goal.unit ?? "lb"}`;

  return {
    kind: "ahead_target",
    severity: "info",
    title: `${goal.goalTitle} — ahead of plan by ${driftDisplay}`,
    body: newTargetDate
      ? `7-day rolling avg is tracking faster than prescribed. Want to pull the target date in to ${newTargetDate}, or maintain current pace?`
      : `7-day rolling avg is tracking faster than prescribed. Maintain current pace or revise the target.`,
    goalId: goal.goalId,
    suggestedField: newTargetDate ? "goal.targetDate" : null,
    suggestedValue: newTargetDate ? JSON.stringify({ goalId: goal.goalId, targetDate: newTargetDate }) : null,
    snapshotData: {
      drift,
      actualRate,
      prescribedRate,
      threshold,
      currentValue: goal.currentValue,
      expectedNow,
      newTargetDate,
    },
  };
};
