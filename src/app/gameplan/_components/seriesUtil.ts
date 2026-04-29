/**
 * 16-week trajectory series synthesizer.
 *
 * Verbatim port of gameplan-active.jsx#buildSeries (lines 605–633) and
 * isAheadOf (lines 636–640). The prototype generates a 112-day daily
 * series (16 weeks) with a deterministic noise seed so the chart looks
 * organic without depending on real data.
 *
 * This util IS NOT a placeholder for live data — it's a stub strategy
 * flagged for **R8** (Goal Engine ships daily series). When the engine
 * lands a `/api/progress/{metric}/series` endpoint, callers should
 * pass the engine-provided series in directly and bypass this util.
 */

export interface SeriesInput {
  start: number;
  target: number;
  currentValue: number;
  /** Noise amplitude for the deterministic jitter. */
  noise?: number;
  /** Seed for the LCG so each goal gets a stable wobble. */
  seed?: number;
  /** Display unit (passed through to GoalCard). */
  unit?: string;
  /** Decimal places for rendered values. */
  decimals?: number;
}

export interface Series {
  daily: number[];
  rolling7: number[];
  expected: number[];
  currentDay: number;
  totalDays: number;
}

const TOTAL_DAYS = 112; // 16 weeks
const CURRENT_DAY = 38; // ~week 6 day 3

export function buildSeries({
  start,
  target,
  currentValue,
  noise = 0.5,
  seed = 1,
}: SeriesInput): Series {
  // Deterministic noise — LCG with the same coefficients the prototype uses.
  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  // Expected: linear from start → target over TOTAL_DAYS.
  const expected: number[] = [];
  for (let i = 0; i <= TOTAL_DAYS; i++) {
    expected.push(start + (target - start) * (i / TOTAL_DAYS));
  }

  // Daily logged data up to currentDay; actual trajectory ends at currentValue.
  // Path: start → currentValue with smooth-step interpolation + noise.
  const daily: number[] = [];
  for (let i = 0; i <= CURRENT_DAY; i++) {
    const t = i / CURRENT_DAY;
    const ease = t * t * (3 - 2 * t);
    const base = start + (currentValue - start) * ease;
    daily.push(base + (rand() - 0.5) * 2 * noise);
  }

  // 7-day rolling average over the daily series.
  const rolling7 = daily.map((_, i) => {
    const w = daily.slice(Math.max(0, i - 6), i + 1);
    return w.reduce((a, b) => a + b, 0) / w.length;
  });

  return { daily, rolling7, expected, currentDay: CURRENT_DAY, totalDays: TOTAL_DAYS };
}

/**
 * Returns true when the actual value is on the "ahead" side of the
 * expected trajectory. Direction depends on whether the goal target
 * is below the start (cutting body weight = lower is ahead) or above
 * (gaining strength = higher is ahead).
 */
export function isAheadOf(actual: number, expected: number, target: number, start: number): boolean {
  if (target < start) return actual <= expected;
  return actual >= expected;
}
