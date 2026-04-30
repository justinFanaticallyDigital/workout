// src/lib/goal-engine/lifestyle-variables.ts
// ============================================================================
// Lifestyle Variable Pool — static registry per spec §7.
//
// 15 variables across 6 groups. Per-Gameplan picks select 3; the
// engine reads only the variables that have a corresponding
// LifestyleTarget row in the user's program scope.
//
// `targetCadence` drives streak math:
//   - daily   — last-7-day window, miss-day = the day's row violates
//               the target's comparator (or the row is missing).
//   - weekly  — current ISO week, single roll-up against the target.
//   - as_needed — pain_check; engine treats gaps as non-misses.
//
// Pure data — no Prisma, no React. Both engine rules and UI cards
// import from here so the same key→display mapping is used app-wide.
// ============================================================================

export type LifestyleGroup =
  | "Recovery"
  | "Activity"
  | "Practices"
  | "Nutrition"
  | "Mental"
  | "Adherence";

export type LifestyleType =
  | "numeric"
  | "scale_1_5"
  | "scale_0_10"
  | "enum_gyr";

export type LifestyleCadence = "daily" | "weekly" | "as_needed";

export type LifestyleSource = "manual" | "fitbit" | "derived";

export interface LifestyleVariable {
  key: string;
  display: string;
  group: LifestyleGroup;
  type: LifestyleType;
  unit: string | null;
  targetCadence: LifestyleCadence;
  sources: LifestyleSource[];
  /**
   * Comparator the engine should use against the LifestyleTarget
   * value when computing miss-days. e.g. sleep_duration uses "gte"
   * (need at least N hours), stress uses "lte" (stay under N).
   */
  defaultComparator: "gte" | "lte" | "eq";
}

export const LIFESTYLE_VARIABLES: readonly LifestyleVariable[] = [
  {
    key: "sleep_duration",
    display: "Sleep duration",
    group: "Recovery",
    type: "numeric",
    unit: "hours",
    targetCadence: "daily",
    sources: ["manual", "fitbit"],
    defaultComparator: "gte",
  },
  {
    key: "sleep_quality",
    display: "Sleep quality",
    group: "Recovery",
    type: "scale_1_5",
    unit: null,
    targetCadence: "daily",
    sources: ["manual"],
    defaultComparator: "gte",
  },
  {
    key: "resting_hr",
    display: "Resting HR",
    group: "Recovery",
    type: "numeric",
    unit: "bpm",
    targetCadence: "daily",
    sources: ["fitbit", "manual"],
    defaultComparator: "lte",
  },
  {
    key: "hrv",
    display: "HRV",
    group: "Recovery",
    type: "numeric",
    unit: "ms",
    targetCadence: "daily",
    sources: ["fitbit"],
    defaultComparator: "gte",
  },
  {
    key: "daily_readiness",
    display: "Daily readiness",
    group: "Recovery",
    type: "enum_gyr",
    unit: null,
    targetCadence: "daily",
    sources: ["manual"],
    // GREEN beats target; engine treats GREEN/YELLOW as hit when
    // comparator is "gte" against numeric 2/3.
    defaultComparator: "gte",
  },
  {
    key: "pain_check",
    display: "Pain check",
    group: "Recovery",
    type: "scale_0_10",
    unit: null,
    targetCadence: "as_needed",
    sources: ["manual"],
    // For pain we want LOW values; comparator "lte" against e.g. 3.
    defaultComparator: "lte",
  },
  {
    key: "steps",
    display: "Steps",
    group: "Activity",
    type: "numeric",
    unit: "steps",
    targetCadence: "daily",
    sources: ["fitbit", "manual"],
    defaultComparator: "gte",
  },
  {
    key: "active_minutes",
    display: "Active minutes",
    group: "Activity",
    type: "numeric",
    unit: "min",
    targetCadence: "daily",
    sources: ["fitbit", "manual"],
    defaultComparator: "gte",
  },
  {
    key: "z2_minutes",
    display: "Zone 2 cardio",
    group: "Activity",
    type: "numeric",
    unit: "min",
    targetCadence: "weekly",
    sources: ["derived"],
    defaultComparator: "gte",
  },
  {
    key: "mobility_minutes",
    display: "Mobility minutes",
    group: "Practices",
    type: "numeric",
    unit: "min",
    targetCadence: "daily",
    sources: ["manual"],
    defaultComparator: "gte",
  },
  {
    key: "balance_minutes",
    display: "Balance practice",
    group: "Practices",
    type: "numeric",
    unit: "min",
    targetCadence: "weekly",
    sources: ["manual"],
    defaultComparator: "gte",
  },
  {
    key: "hydration",
    display: "Hydration",
    group: "Nutrition",
    type: "numeric",
    unit: "oz",
    targetCadence: "daily",
    sources: ["manual"],
    defaultComparator: "gte",
  },
  {
    key: "protein_hits",
    display: "Protein hits",
    group: "Nutrition",
    type: "numeric",
    unit: "meals",
    targetCadence: "daily",
    sources: ["derived"],
    defaultComparator: "gte",
  },
  {
    key: "stress",
    display: "Stress",
    group: "Mental",
    type: "scale_1_5",
    unit: null,
    targetCadence: "daily",
    sources: ["manual"],
    defaultComparator: "lte",
  },
  {
    key: "sessions_completed",
    display: "Sessions completed",
    group: "Adherence",
    type: "numeric",
    unit: "sessions",
    targetCadence: "weekly",
    sources: ["derived"],
    defaultComparator: "gte",
  },
];

const BY_KEY = new Map(LIFESTYLE_VARIABLES.map((v) => [v.key, v]));

export function lifestyleVariable(key: string): LifestyleVariable | null {
  return BY_KEY.get(key) ?? null;
}

/**
 * Convert a stored LifestyleLog row's value to a number for the
 * comparator check. Numeric and scale rows pass through; enum_gyr
 * maps GREEN=3 / YELLOW=2 / RED=1 (so "gte 2" = "GREEN or YELLOW").
 */
export function logValueAsNumber(
  variable: LifestyleVariable,
  numValue: number | null | undefined,
  textValue: string | null | undefined,
): number | null {
  if (variable.type === "enum_gyr") {
    if (!textValue) return null;
    const t = textValue.toUpperCase();
    if (t === "GREEN") return 3;
    if (t === "YELLOW") return 2;
    if (t === "RED") return 1;
    return null;
  }
  if (numValue == null) return null;
  return numValue;
}

/**
 * Apply a target's comparator to a value, returning whether the
 * row counts as a "hit" (meets target) or a "miss".
 */
export function meetsTarget(
  comparator: "gte" | "lte" | "eq",
  value: number,
  target: number,
): boolean {
  if (comparator === "gte") return value >= target;
  if (comparator === "lte") return value <= target;
  return Math.abs(value - target) < 1e-6;
}
