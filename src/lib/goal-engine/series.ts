// src/lib/goal-engine/series.ts
// ============================================================================
// Goal Engine — Daily series builder.
//
// Replaces the R5 synthesis in `gameplan/_components/seriesUtil.ts`.
// Reads from BodyMetric (body-weight goals) or computes Epley e1RM
// from Sets (strength goals) and produces the same `DailySeries`
// shape MiniTrajectory / TrajectoryGraph / GoalCard already consume.
//
// Pure — no Prisma. Caller fetches raw rows and passes them in.
// ============================================================================

import type { DailySeries, GoalKind, MetricPoint } from "./types";
import { rollingAvg } from "./rate-math";

interface SeriesBuildInput {
  kind: GoalKind;
  /** Goal start value. */
  startValue: number;
  /** Goal target value. */
  targetValue: number;
  /** ISO YYYY-MM-DD goal start. */
  startDate: string;
  /** ISO YYYY-MM-DD goal target. */
  targetDate: string;
  /** Today's date — passed in for determinism in tests. */
  today: Date;
  /** Raw history points — body-weight rows or per-session e1RM. */
  history: MetricPoint[];
}

/**
 * R8 — build a DailySeries for a goal from its raw history.
 *
 * Empty `history` returns a series with empty `daily` + `rolling7`
 * arrays and a populated `expected` line so the chart can still
 * render the prescribed trajectory and the empty-state callout.
 */
export function buildDailySeries(input: SeriesBuildInput): DailySeries {
  const start = new Date(input.startDate).getTime();
  const target = new Date(input.targetDate).getTime();
  const todayMs = input.today.getTime();
  if (!Number.isFinite(start) || !Number.isFinite(target) || target <= start) {
    return emptyExpected(input);
  }
  const totalDays = Math.max(1, Math.round((target - start) / 86400000));
  const currentDay = Math.max(0, Math.min(totalDays, Math.round((todayMs - start) / 86400000)));

  // Build expected (linear start → target) — always populated.
  const expected: number[] = [];
  for (let i = 0; i <= totalDays; i++) {
    expected.push(input.startValue + (input.targetValue - input.startValue) * (i / totalDays));
  }

  // Build daily — index by day-offset from start. Where no point
  // exists for a day, carry forward the last known value (LOCF). The
  // rolling7 then averages over the last 7 days.
  const daily: number[] = [];
  let lastKnown: number | null = null;
  // Sort history by date ascending.
  const sorted = [...input.history].sort((a, b) => a.date.localeCompare(b.date));
  const byDay = new Map<number, number>();
  for (const p of sorted) {
    const ms = new Date(p.date).getTime();
    if (!Number.isFinite(ms)) continue;
    const day = Math.round((ms - start) / 86400000);
    if (day < 0 || day > totalDays) continue;
    byDay.set(day, p.value);
  }
  // Walk every day up to today; LOCF where missing.
  for (let i = 0; i <= Math.min(currentDay, totalDays); i++) {
    const v = byDay.get(i);
    if (v !== undefined) {
      lastKnown = v;
      daily.push(v);
    } else if (lastKnown !== null) {
      daily.push(lastKnown);
    } else {
      // No history yet at this offset — carry the start value as the
      // best-known prior (matches user's mental model: "I started here").
      daily.push(input.startValue);
    }
  }

  const rolling7 = rollingAvg(daily, 7);

  return { daily, rolling7, expected, currentDay, totalDays };
}

function emptyExpected(input: SeriesBuildInput): DailySeries {
  // Degenerate case (no/invalid window) — return a single-point line.
  return {
    daily: [],
    rolling7: [],
    expected: [input.startValue, input.targetValue],
    currentDay: 0,
    totalDays: 1,
  };
}

/**
 * R8 — Epley e1RM history for a strength goal. Caller pulls Sets for
 * the goal's `metric` (an exerciseId) and we fold to one point per
 * day (the best e1RM that day).
 *
 * Imported from rate-math elsewhere; co-located here for the
 * caller-friendly "I have raw sets" shape.
 */
export function setsToE1RMSeries(
  sets: Array<{ date: string; weight: number; reps: number }>,
): MetricPoint[] {
  const byDay = new Map<string, number>();
  for (const s of sets) {
    if (!s.weight || !s.reps) continue;
    const e = s.reps === 1 ? s.weight : s.weight * (1 + s.reps / 30);
    const prior = byDay.get(s.date);
    if (prior === undefined || e > prior) byDay.set(s.date, e);
  }
  return Array.from(byDay.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
