// src/lib/goal-engine/feasibility.ts
// ============================================================================
// Goal Engine — Feasibility band calculations.
//
// Per spec §8.3: each goal type has "reasonable" weekly rate bands.
// The engine flags aggressive or unrealistic targets for the rule set
// (behind-target / ahead-target) and surfaces inline warnings in
// Planning Mode (yellow/red text). Bands are hints; user can override.
//
// Pure — no Prisma. Browser-safe.
// ============================================================================

import type { FeasibilityBand, GoalKind } from "./types";
import { weeklyRate } from "./rate-math";

interface BandSpec {
  /** Sustainable lower bound (per week, in goal units). */
  min: number;
  /** Sustainable upper bound. */
  max: number;
  /** Aggressive upper threshold — beyond `max` but below `unrealistic`. */
  aggressiveMax: number;
  /** Optional pretty-printed unit. */
  unit: string;
}

/**
 * R8 — return per-goal feasibility band. Spec §8.3 thresholds.
 *
 * Body-weight loss/gain bands are percentage-of-bodyweight scaled,
 * so the absolute lb/wk bound depends on the start value (passed in).
 * Strength-gain bands depend on lift size; we apply a simple
 * "small/medium/large lift" heuristic via start value (≤80lb / ≤200lb
 * / >200lb) to pick the band.
 */
function bandSpecFor(kind: GoalKind, startValue: number, targetValue: number): BandSpec {
  const isLossDirection = targetValue < startValue;
  switch (kind) {
    case "weight":
    case "bodyweight": {
      // Spec §8.3: cutting ≤0.7%/wk sustainable, 0.7-1.0% aggressive,
      // >1.0% unrealistic. Lean gain: 0.25-0.5 lb/wk sustainable for
      // intermediates, 1.0-1.5 lb/wk aggressive, >1.5 lb/wk unrealistic.
      if (isLossDirection) {
        const pct = startValue || 1;
        return {
          min: -0.007 * pct,
          max: 0,
          aggressiveMax: -0.01 * pct,
          unit: "lb/wk",
        };
      }
      return {
        min: 0.25,
        max: 0.5,
        aggressiveMax: 1.5,
        unit: "lb/wk",
      };
    }
    case "strength":
    case "powerlifting": {
      // Spec §8.3 "novice 5-10 lb/wk on big lifts" — for v1 we apply
      // a single intermediate band: 1-2 lb/wk sustainable, 2-5 aggressive,
      // >5 unrealistic on a per-lift basis. Heuristic: scale to lift size.
      const liftSize = startValue;
      const sustMax = liftSize <= 80 ? 1 : liftSize <= 200 ? 2 : 3;
      return {
        min: 0,
        max: sustMax,
        aggressiveMax: sustMax * 2.5,
        unit: "lb/wk",
      };
    }
    case "frequency":
      // Frequency goals (sessions/week) — feasibility is binary, not rate.
      return { min: 0, max: 7, aggressiveMax: 8, unit: "sessions/wk" };
    case "competition":
    case "bodycomp":
    case "custom":
    default:
      return { min: 0, max: Number.POSITIVE_INFINITY, aggressiveMax: Number.POSITIVE_INFINITY, unit: "/wk" };
  }
}

/**
 * R8 — compute the feasibility band + status for a goal.
 * Replaces R7 PlanningGoalCard's inline `ratePctOfStart` math.
 */
export function feasibilityBand(input: {
  kind: GoalKind;
  startValue: number;
  targetValue: number;
  startDate: string;
  targetDate: string;
}): FeasibilityBand {
  const ratePerWeek = weeklyRate(input.startValue, input.targetValue, input.startDate, input.targetDate);
  const spec = bandSpecFor(input.kind, input.startValue, input.targetValue);
  const absRate = Math.abs(ratePerWeek);
  const absMax = Math.abs(spec.max);
  const absAgg = Math.abs(spec.aggressiveMax);
  let status: FeasibilityBand["status"];
  if (absRate <= absMax) status = "sustainable";
  else if (absRate <= absAgg) status = "aggressive";
  else status = "unrealistic";
  return {
    status,
    min: spec.min,
    max: spec.max,
    ratePerWeek,
    warning: warningFor(input.kind, ratePerWeek, status, input.startValue),
  };
}

/** R8 — warning string per spec §8.4 examples ("Rate of 1.2 lb/wk
 *  loss is aggressive at 165 lb (>0.7% per week)" etc.). */
export function warningFor(
  kind: GoalKind,
  ratePerWeek: number,
  status: FeasibilityBand["status"],
  startValue: number,
): string | undefined {
  if (status === "sustainable") return undefined;
  const absRate = Math.abs(ratePerWeek).toFixed(2);
  switch (kind) {
    case "weight":
    case "bodyweight": {
      const direction = ratePerWeek < 0 ? "loss" : "gain";
      if (status === "aggressive") {
        return `Rate of ${absRate} lb/wk ${direction} is aggressive at ${startValue} lb (>0.7% per week).`;
      }
      return `Rate of ${absRate} lb/wk ${direction} exceeds the sustainable band — extend the timeline or pull the target.`;
    }
    case "strength":
    case "powerlifting": {
      if (status === "aggressive") {
        return `+${absRate} lb/wk strength gain is aggressive — consider extending the timeline.`;
      }
      return `+${absRate} lb/wk strength gain exceeds the sustainable band — likely unrealistic without periodization changes.`;
    }
    default:
      return status === "unrealistic"
        ? "Target rate exceeds the sustainable band — review the timeline."
        : "Target rate is on the aggressive side — review the timeline.";
  }
}
