/**
 * R8: implemented in goal-engine. This file kept for caller-API
 * stability — MiniTrajectory / TrajectoryGraph / GoalCard import
 * `buildSeries` and `isAheadOf` from here. The body is now a thin
 * adapter over `goal-engine/series.buildDailySeries()` + the
 * `goal-engine/rate-math.aheadOfPlan()` helper.
 *
 * Empty-history behavior: when no live data has flowed yet (history
 * empty), the underlying engine returns a populated `expected` line
 * + empty `daily` / `rolling7` arrays. Callers handle the empty arrays
 * gracefully — TrajectoryGraph keeps the prescribed line visible
 * even before the first BodyMetric or Set lands.
 *
 * The `noise`/`seed` params stay in `SeriesInput` but are now ignored
 * — kept for caller-API stability so dashboard components don't churn.
 */

import { buildDailySeries as engineBuildDailySeries } from "@/lib/goal-engine/series";
import { aheadOfPlan as engineAheadOfPlan } from "@/lib/goal-engine/rate-math";

export interface SeriesInput {
  start: number;
  target: number;
  currentValue: number;
  /** Ignored in R8 — kept for caller-API stability (was deterministic
   *  jitter amplitude under the old synthesis). */
  noise?: number;
  /** Ignored in R8 — kept for caller-API stability. */
  seed?: number;
  /** Display unit (passed through to GoalCard). */
  unit?: string;
  /** Decimal places for rendered values. */
  decimals?: number;
  /** R8: optional history points fed into the engine. When omitted
   *  (back-compat path for callers that haven't been wired yet),
   *  we still return the expected line so the chart renders. */
  history?: Array<{ date: string; value: number }>;
  /** R8: ISO start/target dates. When omitted, the legacy 16-week
   *  window from the prototype is reconstructed (start = 16 weeks
   *  before today, target = today). Real callers pass the goal's
   *  startDate / targetDate explicitly. */
  startDate?: string;
  targetDate?: string;
}

export interface Series {
  daily: number[];
  rolling7: number[];
  expected: number[];
  currentDay: number;
  totalDays: number;
}

const TOTAL_DAYS = 112;

export function buildSeries(input: SeriesInput): Series {
  const today = new Date();
  // Derive a sensible start/target window when the caller didn't pass one.
  const startDate =
    input.startDate ?? new Date(today.getTime() - TOTAL_DAYS * 86400000).toISOString().slice(0, 10);
  const targetDate = input.targetDate ?? today.toISOString().slice(0, 10);
  const series = engineBuildDailySeries({
    kind: "bodyweight",
    startValue: input.start,
    targetValue: input.target,
    startDate,
    targetDate,
    today,
    history: input.history ?? [],
  });
  return {
    daily: series.daily,
    rolling7: series.rolling7,
    expected: series.expected,
    currentDay: series.currentDay,
    totalDays: series.totalDays,
  };
}

/**
 * R8: implemented in goal-engine — re-export for caller-API stability.
 */
export function isAheadOf(actual: number, expected: number, target: number, start: number): boolean {
  return engineAheadOfPlan(actual, expected, start, target);
}
