// src/lib/goal-engine/rules/plateau-detected.ts
// ============================================================================
// Rule: plateau-detected
//
// Spec §8.4: "Lift PR goal: e1RM hasn't moved in N sessions".
// Output: "Accumulate volume / change progression scheme / extend block".
// ============================================================================

import type { EngineState, RecommendationDraft, RuleFn } from "../types";

const MIN_DATAPOINTS = 3;
/** Plateau if rolling-3 e1RM hasn't moved more than this fraction of
 *  the rolling-3 average (1.5%). Adjustable per-lift later. */
const PLATEAU_THRESHOLD_PCT = 0.015;

export const plateauDetected: RuleFn = (state: EngineState): RecommendationDraft | null => {
  const goal = state.goals.find(
    (g) => g.kind === "strength" || g.kind === "powerlifting",
  );
  if (!goal) return null;
  // Only daily history points that aren't pure carry-forward count —
  // we use rolling7 length as the proxy. Need at least MIN_DATAPOINTS.
  const series = goal.series.daily;
  if (series.length < MIN_DATAPOINTS) return null;

  // Take the last N e1RM values. If max - min is within the threshold,
  // call it a plateau.
  const tail = series.slice(-MIN_DATAPOINTS);
  const min = Math.min(...tail);
  const max = Math.max(...tail);
  const avg = tail.reduce((s, v) => s + v, 0) / tail.length;
  const range = max - min;
  if (avg <= 0) return null;
  if (range / avg > PLATEAU_THRESHOLD_PCT) return null;

  const movedPct = ((range / avg) * 100).toFixed(2);

  return {
    kind: "plateau_detected",
    severity: "warning",
    title: `${goal.goalTitle} — plateau over last ${tail.length} sessions`,
    body: `e1RM has moved ${movedPct}% over the last ${tail.length} logged sessions (avg ${avg.toFixed(1)} ${goal.unit ?? "lb"}). Suggestion: accumulate volume for one more block, swap the progression scheme (linear → wave / RPE-based), or extend the current block by a week.`,
    goalId: goal.goalId,
    suggestedField: "block.extend",
    suggestedValue: JSON.stringify({ extraWeeks: 1, progressionType: "wave" }),
    snapshotData: {
      tail,
      range,
      avg,
      thresholdPct: PLATEAU_THRESHOLD_PCT,
    },
  };
};
