// src/lib/goal-engine/rules/lifestyle-streak-broken.ts
// ============================================================================
// Lifestyle streak broken — spec §8.4.
//
// Trigger: a tracked daily-cadence variable misses its target on
// 5+ of the past 7 days (where "miss" = the day's row violates the
// LifestyleTarget comparator, OR the row is missing entirely).
//
// Output: severity warning, body cites the worst-offending variable
// + miss count + how the user might revisit the target.
//
// Cap: returns at most 1 draft per run. The applyRules orchestrator
// then ranks against other rules; lifestyle is "warning" so it
// loses to urgent rules but beats info-level ahead_target.
// ============================================================================

import type { EngineState, RecommendationDraft, LifestyleSnapshot } from "../types";
import { meetsTarget } from "../lifestyle-variables";

const STREAK_WINDOW_DAYS = 7;
const MISS_THRESHOLD = 5;

export function lifestyleStreakBroken(state: EngineState): RecommendationDraft | null {
  let worst: { snap: LifestyleSnapshot; misses: number } | null = null;

  for (const snap of state.lifestyle) {
    if (snap.cadence !== "daily") continue;
    const misses = countMisses(snap);
    if (misses < MISS_THRESHOLD) continue;
    if (!worst || misses > worst.misses) {
      worst = { snap, misses };
    }
  }

  if (!worst) return null;

  const { snap, misses } = worst;
  const body = bodyFor(snap, misses);

  return {
    kind: "lifestyle_streak_broken",
    severity: "warning",
    title: `${snap.display} target missed ${misses}/${STREAK_WINDOW_DAYS} days`,
    body,
    suggestedField: `lifestyle.${snap.key}.target`,
    suggestedValue: JSON.stringify({ key: snap.key, currentTarget: snap.targetValue }),
    snapshotData: {
      key: snap.key,
      misses,
      windowDays: STREAK_WINDOW_DAYS,
      targetValue: snap.targetValue,
      comparator: snap.comparator,
    },
  };
}

/**
 * A "miss" is a day in the 7-day window whose log either:
 *   (a) doesn't exist (no LifestyleLog row for that date), or
 *   (b) exists but violates the target comparator.
 *
 * The engine pre-builds `points` ordered oldest → newest with
 * gaps already squashed (one point per logged day), so we count
 * STREAK_WINDOW_DAYS minus hits.
 */
function countMisses(snap: LifestyleSnapshot): number {
  let hits = 0;
  for (const p of snap.points) {
    if (p.value == null) continue;
    if (meetsTarget(snap.comparator, p.value, snap.targetValue)) hits += 1;
  }
  return Math.max(0, STREAK_WINDOW_DAYS - hits);
}

function bodyFor(snap: LifestyleSnapshot, misses: number): string {
  const cmpWord =
    snap.comparator === "gte"
      ? "below"
      : snap.comparator === "lte"
      ? "above"
      : "off";
  const targetStr = snap.unit ? `${snap.targetValue}${snap.unit === "hours" ? "h" : snap.unit === "min" ? "m" : ` ${snap.unit}`}` : `${snap.targetValue}`;
  return [
    `${snap.display} came in ${cmpWord} ${targetStr} on ${misses} of the last ${STREAK_WINDOW_DAYS} days.`,
    `Either the target's too aggressive for now or something's blocking adherence — revisit in Planning Mode or commit fresh this week.`,
  ].join(" ");
}
