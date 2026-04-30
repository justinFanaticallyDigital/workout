/**
 * R7 — Planning Mode sandbox types.
 *
 * `PlanningDraft` mirrors the live data shape (Program + Blocks +
 * Days + Exercises + Targets + LifestyleTargets) so editors can
 * mutate it as normal React state. Diff is computed by deep-compare
 * against the original snapshot.
 */

export type GoalKind = "weight" | "bodyweight" | "strength" | "powerlifting" | "competition" | "frequency" | "bodycomp" | "custom";

export interface DraftGoal {
  id: string;
  type: GoalKind;
  title: string;
  metric: string | null;
  startValue: number | null;
  targetValue: number | null;
  targetUnit: string | null;
  targetDate: string | null;
}

export interface DraftExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetSets: number | null;
  targetRepRange: string | null;
  targetRpe: string | null;
  progressionType: string;
}

export interface DraftDay {
  id: string;
  blockId: string;
  name: string;
  dayNumber: number;
  dayType: string;
  exercises: DraftExercise[];
}

export interface DraftBlock {
  id: string;
  programId: string;
  name: string;
  blockNumber: number;
  durationWeeks: number | null;
  phase: string | null;
  startDate: string | null;
  refeedWeeks: number[];
  days: DraftDay[];
}

export interface DraftProgram {
  id: string;
  name: string;
  durationWeeks: number | null;
  startDate: string | null;
}

export interface DraftNutritionTarget {
  id: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export interface DraftLifestyleTarget {
  id: string | null;
  programId: string | null;
  key: string;
  value: number;
  unit: string;
  comparator: "gte" | "lte" | "eq";
}

export interface DraftScheduleOverride {
  /** Local id for tracking newly added overrides (UUID before persist). */
  localId: string;
  programId: string;
  blockId: string;
  scope: "TODAY_ONLY" | "THIS_WEEK" | "THIS_WEEK_FORWARD";
  action: "SKIP" | "SWAP" | "REPLACE" | "REDUCE_DAYS";
  weekNumber: number;
  dayOfWeek: number | null;
  payload: Record<string, unknown>;
}

export interface PlanningDraft {
  program: DraftProgram;
  blocks: DraftBlock[];
  goals: DraftGoal[];
  nutritionTarget: DraftNutritionTarget;
  lifestyleTargets: DraftLifestyleTarget[];
  /** New overrides queued during this session — written on Apply. */
  newOverrides: DraftScheduleOverride[];
}

/**
 * Diff entry — one per changed entity. Used to render the
 * `DiffSummaryStrip` chip row + `ApplyModal` line items + walk the
 * Apply orchestration sequentially.
 */
export type DiffEntry =
  | { kind: "program"; field: string; oldValue: unknown; newValue: unknown }
  | { kind: "block"; blockId: string; blockName: string; field: string; oldValue: unknown; newValue: unknown }
  | { kind: "day"; dayId: string; dayName: string; field: string; oldValue: unknown; newValue: unknown }
  | {
      kind: "exercise";
      dayId: string;
      exerciseId: string;
      exerciseName: string;
      field: string;
      oldValue: unknown;
      newValue: unknown;
    }
  | { kind: "goal"; goalId: string; goalTitle: string; field: string; oldValue: unknown; newValue: unknown }
  | { kind: "nutrition"; field: string; oldValue: unknown; newValue: unknown }
  | { kind: "lifestyle"; key: string; field: string; oldValue: unknown; newValue: unknown }
  | { kind: "override-new"; localId: string; summary: string };

/** Section tab id. */
export type SectionTab = "goals" | "timeline" | "nutrition" | "training" | "lifestyle";

/** Live-projection sub-tab id. */
export type ProjectionTab = "trajectory" | "daily" | "volume";
