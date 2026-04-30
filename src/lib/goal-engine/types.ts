// src/lib/goal-engine/types.ts
// ============================================================================
// Goal Engine — Type Definitions
//
// Pure types — no Prisma imports. Math modules (rate-math, feasibility,
// series) all consume these types directly so the same code runs in
// the browser (Planning Mode + dashboard cards) and on the server
// (engine entry-point in /api/checkins).
// ============================================================================

/** R8 — goal kinds the engine reasons about. Mirrors Prisma GoalType
 *  but with bodyweight + weight folded ("weight" was the legacy alias). */
export type GoalKind =
  | "weight"
  | "bodyweight"
  | "strength"
  | "powerlifting"
  | "competition"
  | "frequency"
  | "bodycomp"
  | "custom";

/** R8 — recommendation kinds. Mirrors Prisma RecommendationKind enum. */
export type RecommendationKind =
  | "behind_target"
  | "ahead_target"
  | "adherence_low"
  | "plateau_detected";

/** R8 — recommendation severity, drives card tone. */
export type RecommendationSeverity = "info" | "warning" | "urgent";

/** R8 — feasibility band tier (spec §8.3). */
export type FeasibilityStatus = "sustainable" | "aggressive" | "unrealistic";

export interface FeasibilityBand {
  status: FeasibilityStatus;
  /** Sustainable rate floor (per week, in goal units). */
  min: number;
  /** Sustainable rate ceiling. */
  max: number;
  /** The actual computed rate per week for this goal. */
  ratePerWeek: number;
  /** Optional warning string per spec §8.4 examples. */
  warning?: string;
}

/** R8 — body-metric history point (BodyMetric model). */
export interface MetricPoint {
  /** ISO YYYY-MM-DD. */
  date: string;
  value: number;
}

/** R8 — daily series consumed by MiniTrajectory + TrajectoryGraph. */
export interface DailySeries {
  /** Raw daily values from BodyMetric / e1RM history. Empty before any logs. */
  daily: number[];
  /** 7-day rolling average — same length as daily. */
  rolling7: number[];
  /** Linear expected line from start → target across totalDays. */
  expected: number[];
  /** Index of "today" within the series (clamped to [0, totalDays]). */
  currentDay: number;
  /** Total day count (typically = durationWeeks * 7). */
  totalDays: number;
}

/** R8 — goal snapshot fed to rules. */
export interface GoalSnapshot {
  goalId: string;
  goalTitle: string;
  kind: GoalKind;
  /** Goal target unit (e.g. "lb", "kg"). */
  unit: string | null;
  /** Body-weight goal start value. */
  startValue: number;
  /** Body-weight goal target value. */
  targetValue: number;
  /** ISO YYYY-MM-DD start date. */
  startDate: string;
  /** ISO YYYY-MM-DD target date. */
  targetDate: string;
  /** Latest derived "current" value from the series (rolling7 last point). */
  currentValue: number | null;
  /** Engine-derived rolling-avg / expected / actuals series. */
  series: DailySeries;
  /** Feasibility band status. */
  feasibility: FeasibilityBand;
}

/** R8 — adherence snapshot for the lifestyle / training rules. */
export interface AdherenceSnapshot {
  /** Scheduled lifting sessions in past 7 days (from active block.days). */
  scheduled7d: number;
  /** Completed lifting sessions in past 7 days (from Workout.endTime). */
  completed7d: number;
  /** Adherence ratio 0..1. */
  ratio: number;
}

/** R8 — engine state. Pre-fetched at the entry-point so rules are
 *  pure functions over plain data (no Prisma in rule modules). */
export interface EngineState {
  userId: string;
  programId: string | null;
  /** Per-goal snapshots. */
  goals: GoalSnapshot[];
  /** Lifting adherence over past 7 days. */
  adherence: AdherenceSnapshot;
  /** Optional triggering CheckIn id (when running from POST /api/checkins). */
  checkInId?: string | null;
  /** Today's date — passed in for determinism in tests. */
  today: Date;
}

/** R8 — recommendation draft produced by a rule. The entry-point
 *  serializes drafts → DB rows. Drafts are pure data; rules don't
 *  do any Prisma writes themselves. */
export interface RecommendationDraft {
  kind: RecommendationKind;
  severity: RecommendationSeverity;
  title: string;
  body: string;
  /** Optional goal scope. */
  goalId?: string | null;
  /** Optional pre-staged Planning Mode field path (e.g. "nutrition.calories"). */
  suggestedField?: string | null;
  /** JSON-stringified suggested value. */
  suggestedValue?: string | null;
  /** Engine state slice for diagnostics. */
  snapshotData?: Record<string, unknown>;
}

/** R8 — rule function signature. Pure: state in, draft out. */
export type RuleFn = (state: EngineState) => RecommendationDraft | null;

/** R8 — engine output. */
export interface EngineRunResult {
  drafts: RecommendationDraft[];
  /** Engine state captured at run time, for snapshotData persistence. */
  state: EngineState;
}
