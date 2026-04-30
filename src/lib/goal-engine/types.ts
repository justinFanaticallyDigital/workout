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

/** R8 — recommendation kinds. Mirrors Prisma RecommendationKind enum.
 *  R9 adds lifestyle_streak_broken + pain_flag.
 *  R10 adds adherence_low_streak.
 *  R11 adds refeed_due + deload_shift — engine-complete. */
export type RecommendationKind =
  | "behind_target"
  | "ahead_target"
  | "adherence_low"
  | "plateau_detected"
  | "lifestyle_streak_broken"
  | "pain_flag"
  | "adherence_low_streak"
  | "refeed_due"
  | "deload_shift";

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

/** R9 — single LifestyleLog point in the engine's last-7-day window. */
export interface LifestyleLogPoint {
  /** ISO YYYY-MM-DD. */
  date: string;
  /** Numeric value, or scale_1_5 / scale_0_10 / enum_gyr derived number. */
  value: number | null;
  /** Original textValue when present (e.g. "GREEN"). */
  textValue?: string | null;
}

/** R9 — per-tracked-variable snapshot. The engine populates one of
 *  these per LifestyleTarget row in scope; rules iterate over the
 *  set to fire lifestyle-streak-broken / pain-flag. */
export interface LifestyleSnapshot {
  /** Lifestyle variable key — see lifestyle-variables.ts registry. */
  key: string;
  /** Display label resolved from the registry. */
  display: string;
  /** Target value the user committed to (LifestyleTarget.value). */
  targetValue: number;
  /** Comparator from LifestyleTarget.comparator ("gte" / "lte" / "eq"). */
  comparator: "gte" | "lte" | "eq";
  /** Target unit (e.g. "hours", "min"). */
  unit: string;
  /** Last 7 days of logs for this variable, oldest → newest. Gaps
   *  collapse to absent points; the rule treats absence as miss for
   *  daily-cadence variables. */
  points: LifestyleLogPoint[];
  /** Cadence — daily streak rules differ from weekly. */
  cadence: "daily" | "weekly" | "as_needed";
}

/** R10 — recent recommendation row, for cross-week streak rules. */
export interface RecentRecommendation {
  kind: RecommendationKind;
  /** ISO timestamp the rec was created. */
  createdAt: string;
}

/** R11 — slice of the next block in the program. Drives deload_shift
 *  (fires when the next block is a deload starting within 7 days). */
export interface NextBlockSlice {
  /** "accumulation" / "intensification" / "peaking" / "deload" / etc. */
  phase: string | null;
  /** ISO YYYY-MM-DD of the block's start; null when unscheduled. */
  startDate: string | null;
}

/** R11 — calorie-deficit context for refeed_due. The rule reads
 *  daily calories vs maintenance and the time since the last
 *  scheduled refeed week from Block.refeedWeeks. */
export interface DeficitSlice {
  /** Active NutritionTarget calories (null when no target set). */
  caloriesPerDay: number | null;
  /** User.maintenanceCalories — TDEE estimate (null if not entered). */
  maintenanceCalories: number | null;
  /** Days since the last refeed week ended; null when no refeeds
   *  scheduled in the active block at all. */
  daysSinceLastRefeed: number | null;
}

/** R8 — engine state. Pre-fetched at the entry-point so rules are
 *  pure functions over plain data (no Prisma in rule modules).
 *  R9 adds the lifestyle slice for streak / pain rules.
 *  R10 adds recentRecommendations for cross-week streak rules.
 *  R11 adds gameplanKind + nextBlock + deficit slices for the
 *  final two rules (refeed_due + deload_shift). */
export interface EngineState {
  userId: string;
  programId: string | null;
  /** R11 — Program.gameplanKind ("lean_out" / "size_strength" / …). */
  gameplanKind: string | null;
  /** Per-goal snapshots. */
  goals: GoalSnapshot[];
  /** Lifting adherence over past 7 days. */
  adherence: AdherenceSnapshot;
  /** R9 — lifestyle variable snapshots (one per tracked LifestyleTarget). */
  lifestyle: LifestyleSnapshot[];
  /** R10 — last 21 days of fired Recommendation rows (any status).
   *  Drives adherence_low_streak (and any future cross-week rule). */
  recentRecommendations: RecentRecommendation[];
  /** R11 — phase + start of the next upcoming block, when present. */
  nextBlock: NextBlockSlice | null;
  /** R11 — calorie/refeed context for refeed_due. */
  deficit: DeficitSlice;
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
