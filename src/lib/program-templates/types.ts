/**
 * Shared schema for all program templates.
 *
 * Templates are authored as TypeScript data files (one per program)
 * and seeded into the database via `scripts/seed-program-templates.ts`.
 *
 * They live under a system "template" user account and are cloned into
 * regular users' accounts via the existing `POST /api/programs/clone` endpoint.
 */

// ----- Movement taxonomy -----
// These map to the existing CategoryLaneView categories used by generated programs.
export type MovementCategory =
  | "squat"
  | "hinge"
  | "horizontal_push"
  | "horizontal_pull"
  | "vertical_push"
  | "vertical_pull"
  | "single_leg"
  | "lunge"
  | "quad"
  | "hamstring"
  | "glute"
  | "hip_extension"
  | "calf"
  | "bicep"
  | "tricep"
  | "lateral_delt"
  | "rear_delt"
  | "front_delt"
  | "core"
  | "mobility"
  | "power"
  | "conditioning";

export type ExerciseRole = "compound" | "isolation" | "accessory" | "power" | "mobility";

export type ProgressionType =
  | "linear"
  | "double" // double progression: hit top of rep range, add weight
  | "wave"
  | "rpe_based"
  | "percentage_based"
  | "none";

// What kind of session this BlockDay represents
export type DayType = "lifting" | "cardio" | "conditioning" | "mobility" | "rest";

// Phase tag, mapped from existing engine convention
export type BlockPhase =
  | "accumulation"
  | "intensification"
  | "peaking"
  | "deload"
  | "prep"
  | "peak_week"
  | "restore"
  | "rebuild"
  | "re_engage";

// ----- Slot definition -----
// A "slot" is one row on a workout day: a primary exercise plus 1-2 alternatives.
// Exercise names must match the seeded Exercise.name in the DB exactly. The seed
// script resolves these to Exercise.id at insert time and fails loudly if any
// name doesn't resolve.

export interface ExerciseSlot {
  category: MovementCategory;
  role: ExerciseRole;
  primary: string;           // exact Exercise.name from DB
  alt1?: string;
  alt2?: string;
  notes?: string;            // human-readable notes shown in workout logger
}

// ----- Per-block parameters for a slot -----
// Different blocks load the same slot differently. We store one of these per
// (block × slot) combination. All values are optional in case a slot is dropped
// in a given block.

export interface SlotParameters {
  sets: number;
  // reps can be a number (3) or a range string ("6-10") or "AMRAP"
  reps: number | string;
  rir?: number;              // 0-3
  rpe?: number;              // 6-10
  loadPercent?: number;      // % of 1RM, used with progressionType: percentage_based
  progressionType: ProgressionType;
  progressionIncrement?: number; // lb per progression event (if applicable)
  notesOverride?: string;    // overrides slot.notes for this block (e.g. "deload week")
}

// ----- A single workout day -----
// e.g., "Day A — Upper (Strength Bias)"

export interface DayTemplate {
  name: string;              // "Day A — Upper (Strength Bias)"
  type: DayType;             // usually "lifting"
  // Index keyed by slot index — slots[0] is the first exercise, slots[1] is the second, etc.
  slots: ExerciseSlot[];
  // For each block in the program, parameters for each slot.
  // perBlockParams[blockIndex][slotIndex] = parameters for that slot in that block.
  perBlockParams: SlotParameters[][];
}

// ----- Block definition -----

export interface BlockTemplate {
  name: string;              // "Block 1 — Accumulation"
  weekStart: number;         // 1-indexed within the program
  weekEnd: number;
  phase: BlockPhase;
  description?: string;
  // Optional: nutrition target scoped to this block
  nutritionTarget?: NutritionTarget;
  // Optional: benchmarks scoped to this block (created as ProgramBenchmark records)
  benchmarks?: BenchmarkTarget[];
  // Optional: deload week structure within this block
  // (e.g., week 4 of 4 is a deload — drives volume reduction in the workout logger)
  deloadWeeks?: number[];    // weeks within the program that are deload (50% volume / 70% intensity)
}

// ----- Nutrition / benchmarks / customization -----

export interface NutritionTarget {
  // Either calories+macros are set, or only protein floor (qualitative blocks)
  calories?: number | "maintenance" | "maintenance+200" | "maintenance-15%" | "maintenance-18%" | "maintenance-20%";
  proteinPerLb?: number;     // e.g. 1.0 = 1 g per lb bodyweight
  carbsPerLb?: number;
  fatPerLb?: number;
  notes?: string;            // qualitative — e.g. "Mediterranean framework, 5+ veg/day"
}

export interface BenchmarkTarget {
  label: string;             // "Squat 1RM"
  metric: "weight" | "reps" | "time" | "distance" | "bodyweight" | "custom";
  unit: string;              // "lb", "reps", "seconds", "miles", "lb_added"
  targetValue?: number;      // numeric goal, if any
  targetDescription?: string; // e.g. "+5-10% from start"
}

// ----- Customization input definition -----
// These drive the onboarding form when a user selects this template.
// The clone API doesn't need to consume these directly — they're metadata for the UI.

export interface CustomizationInput {
  key: string;
  label: string;
  type: "select" | "multi_select" | "number" | "text" | "boolean" | "date";
  required: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | number | boolean;
  helpText?: string;
}

// ----- Engine warnings -----
// Conditions that surface a warning at onboarding (e.g., "you might want X program instead")

export interface EngineWarning {
  trigger: string;           // human-readable description of trigger condition
  message: string;
  severity: "info" | "warning" | "error";
}

// ----- R13: Lifestyle picks + refeed cadence (folded from R12 registry) -----
// Each gameplan declares 3 default LifestyleTarget rows seeded server-side
// after clone (per spec §7's per-template picks table). Lean Out additionally
// declares a refeed cadence that's seeded as Block.refeedWeeks.

export interface GameplanLifestylePick {
  /** LifestyleVariable.key from goal-engine/lifestyle-variables.ts. */
  key: string;
  /** Default target value (e.g. 7.5 hours of sleep). */
  value: number;
  /** Unit string matching the variable's unit (e.g. "hours", "min"). */
  unit: string;
  /** Comparator for the meets-target check. */
  comparator: "gte" | "lte" | "eq";
}

// ----- The full template -----

export interface ProgramTemplate {
  // Identity
  slug: string;              // "size-and-strength" — used for upserts
  name: string;
  tagline: string;
  description: string;       // shown on /programs/new/templates

  // Audience & metadata
  experienceLevel: "beginner" | "intermediate" | "advanced" | "any";
  durationWeeks: number;
  defaultDaysPerWeek: number;
  daysPerWeekRange: [number, number];
  sessionLengthMin: number;
  sessionLengthMax: number;
  equipment: "full_gym" | "home_dumbbells" | "minimal";
  periodization: string;     // "Block periodization", "Linear", "DUP", etc.
  goalWeighting: { [goal: string]: number }; // e.g. { strength: 40, muscle: 40, aesthetic: 20 }

  // Structure
  blocks: BlockTemplate[];
  days: DayTemplate[];       // The set of distinct workout days. Blocks reuse these.

  // Layered prescriptions (informational; UI shows these but engine doesn't enforce all)
  cardioGuidance?: string;
  conditioningGuidance?: string;
  mobilityGuidance?: string;
  lifestyleGuidance?: string;

  // Customization & guardrails
  customizationInputs?: CustomizationInput[];
  engineWarnings?: EngineWarning[];

  // Variants — alternative day counts (e.g. "3-day variant")
  variantNotes?: string;

  // R13: 3 default LifestyleTarget rows per spec §7 per-gameplan picks.
  // Seeded server-side after clone. Tuple of exactly 3.
  defaultLifestylePicks: [GameplanLifestylePick, GameplanLifestylePick, GameplanLifestylePick];

  // R13: refeed cadence in weeks (e.g. [4, 8] for every-4-weeks within
  // a block). Lean Out only ships a default; null elsewhere. Seeded as
  // Block.refeedWeeks per block (trimmed to block.durationWeeks).
  defaultRefeedCadence: number[] | null;
}
