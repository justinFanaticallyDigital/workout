// src/lib/goal-engine/rules/behind-target.ts
// ============================================================================
// Rule: behind-target
//
// Spec §8.4: "Body-metric goal projection >0.5×rate behind".
// Output: "Drop calories 100/day OR extend by 2 weeks".
// ============================================================================

import type { EngineState, RecommendationDraft, RuleFn } from "../types";
import { actualWeeklyRate, weeklyRate, driftFromExpected } from "../rate-math";

export const behindTarget: RuleFn = (state: EngineState): RecommendationDraft | null => {
  // Only fires for body-weight / weight goals — strength behind-target
  // is plateau-detected territory.
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

  // Direction-aware drift. Cutting (target < start) → behind = above
  // expected. Bulking (target > start) → behind = below expected.
  const expectedNow = goal.series.expected[goal.series.currentDay];
  if (expectedNow == null) return null;
  const drift = driftFromExpected(goal.currentValue, expectedNow);
  const cutting = goal.targetValue < goal.startValue;
  const isBehind = cutting ? drift > 0 : drift < 0;
  if (!isBehind) return null;

  // "Behind" trigger: |drift| > |0.5×rate × elapsed-weeks-from-goal-start|.
  // For a 16-week goal at week 7, this lets early noise pass but flags
  // sustained gaps.
  const weeksElapsed = goal.series.currentDay / 7;
  const threshold = Math.abs(0.5 * prescribedRate * Math.max(1, weeksElapsed));
  if (Math.abs(drift) <= threshold) return null;

  // Suggested calorie tweak: 100 kcal × direction × magnitude tier.
  const magnitudeTier = Math.abs(drift) > threshold * 2 ? 200 : 100;
  const calorieDelta = cutting ? -magnitudeTier : magnitudeTier;
  const direction = cutting ? "Drop" : "Add";
  const driftDisplay = `${drift > 0 ? "+" : "−"}${Math.abs(drift).toFixed(1)} ${goal.unit ?? "lb"}`;
  const actualRateDisplay = `${actualRate >= 0 ? "+" : "−"}${Math.abs(actualRate).toFixed(2)} ${goal.unit ?? "lb"}/wk`;

  return {
    kind: "behind_target",
    severity: Math.abs(drift) > threshold * 3 ? "urgent" : "warning",
    title: `${goal.goalTitle} — behind plan by ${driftDisplay}`,
    body: `7-day rolling avg is drifting from expected (${actualRateDisplay} vs prescribed ${prescribedRate >= 0 ? "+" : "−"}${Math.abs(prescribedRate).toFixed(2)} ${goal.unit ?? "lb"}/wk). Suggestion: ${direction} calories ${magnitudeTier} kcal/day for the next two weeks, or extend the timeline.`,
    goalId: goal.goalId,
    suggestedField: "nutrition.calories",
    suggestedValue: JSON.stringify({ delta: calorieDelta }),
    snapshotData: {
      drift,
      actualRate,
      prescribedRate,
      threshold,
      currentValue: goal.currentValue,
      expectedNow,
    },
  };
};
