// src/lib/gameplan-templates.ts
// ============================================================================
// Gameplan Template Registry — spec §3.1.
//
// 8 canonical Gameplans the user can pick at program creation. Each
// is a thin overlay on the program-engine's existing template set:
//
//   - `key` becomes Program.gameplanKind, used by:
//       refeed_due (engine rule, R11) — gates on "lean_out"
//       /gameplan Header (kind label below program name)
//   - `defaultLifestylePicks` is seeded as 3 LifestyleTarget rows
//     when the program is created with this kind (spec §7 picks)
//   - `defaultRefeedCadence` (Lean Out only) seeds Block.refeedWeeks
//     so the refeed_due rule has a "last refeed" anchor
//   - `programEngineTemplateIds` lists the program-engine template
//     ids that fit this gameplan kind. Used to *infer* gameplanKind
//     from the picker's chosen template — keeps the existing 5-step
//     flow intact while still tagging the resulting Program.
//
// Pure data — no Prisma, no React. Same pattern as
// `goal-engine/lifestyle-variables.ts`.
// ============================================================================

export type GameplanKind =
  | "first_90_days"
  | "size_strength"
  | "lean_out"
  | "powerbuilder"
  | "busy_parent"
  | "athletic_foundations"
  | "comeback"
  | "longevity";

export interface GameplanLifestylePick {
  /** LifestyleVariable.key from goal-engine/lifestyle-variables.ts. */
  key: string;
  /** Default target value seeded when the gameplan is chosen. */
  value: number;
  /** Unit string matching the lifestyle variable's unit. */
  unit: string;
  /** Comparator for the meets-target check. */
  comparator: "gte" | "lte" | "eq";
}

export interface GameplanTemplate {
  key: GameplanKind;
  displayName: string;
  tagline: string;
  /** Short "what's the emphasis" pills shown on cards / preview. */
  keyEmphasisTags: string[];
  /** Preferred days/wk band — informational, not enforced. */
  daysPerWeekRange: [number, number];
  /** Preferred duration (weeks). */
  durationWeeksDefault: number;
  /** 3 lifestyle picks per spec §7's per-gameplan defaults. Seeded
   *  as LifestyleTarget rows server-side after the program lands. */
  defaultLifestylePicks: [GameplanLifestylePick, GameplanLifestylePick, GameplanLifestylePick];
  /** Refeed cadence in weeks (e.g. [4, 8, 12] for every-4-weeks).
   *  Only Lean Out ships a default; others rely on the program-engine
   *  block scheduling. Used by refeed_due (R11). */
  defaultRefeedCadence: number[] | null;
  /** Suggested goal kind the picker pre-fills. */
  suggestedGoalKind: "weight" | "strength" | "powerlifting" | "frequency" | "bodycomp" | "custom";
  /** Program-engine template ids that map onto this gameplan kind.
   *  Picker-side inference: when a user picks one of these engine
   *  templates, we tag the resulting Program with this kind. */
  programEngineTemplateIds: string[];
}

export const GAMEPLAN_TEMPLATES: readonly GameplanTemplate[] = [
  {
    key: "first_90_days",
    displayName: "First 90 Days",
    tagline: "Foundation block — show up, build the habit, learn the lifts.",
    keyEmphasisTags: ["Beginner-friendly", "Habit-first", "Compound lifts"],
    daysPerWeekRange: [3, 4],
    durationWeeksDefault: 12,
    defaultLifestylePicks: [
      { key: "sleep_duration", value: 7, unit: "hours", comparator: "gte" },
      { key: "steps", value: 7000, unit: "steps", comparator: "gte" },
      { key: "sessions_completed", value: 3, unit: "sessions", comparator: "gte" },
    ],
    defaultRefeedCadence: null,
    suggestedGoalKind: "frequency",
    programEngineTemplateIds: ["beginner-strength", "beginner-muscle", "minimalist"],
  },
  {
    key: "size_strength",
    displayName: "Size & Strength",
    tagline: "Mass + barbell numbers in equal measure — the classic intermediate plan.",
    keyEmphasisTags: ["Hypertrophy", "Compound strength", "Progressive overload"],
    daysPerWeekRange: [4, 5],
    durationWeeksDefault: 16,
    defaultLifestylePicks: [
      { key: "sleep_duration", value: 7.5, unit: "hours", comparator: "gte" },
      { key: "stress", value: 3, unit: "scale", comparator: "lte" },
      { key: "protein_hits", value: 4, unit: "meals", comparator: "gte" },
    ],
    defaultRefeedCadence: null,
    suggestedGoalKind: "strength",
    programEngineTemplateIds: ["upper-lower-power", "ppl-hypertrophy", "bodybuilding-offseason"],
  },
  {
    key: "lean_out",
    displayName: "Lean Out",
    tagline: "Structured deficit + retention training — drop fat without losing the work.",
    keyEmphasisTags: ["Fat loss", "Muscle retention", "Refeed cadence"],
    daysPerWeekRange: [4, 5],
    durationWeeksDefault: 12,
    defaultLifestylePicks: [
      { key: "steps", value: 8000, unit: "steps", comparator: "gte" },
      { key: "sleep_duration", value: 7.5, unit: "hours", comparator: "gte" },
      { key: "protein_hits", value: 4, unit: "meals", comparator: "gte" },
    ],
    // Refeed at week 4, 8, 12 within each block — seed gives refeed_due
    // a "last refeed end" anchor so the rule has data to fire on.
    defaultRefeedCadence: [4, 8],
    suggestedGoalKind: "weight",
    programEngineTemplateIds: ["cut-program", "bikini-prep"],
  },
  {
    key: "powerbuilder",
    displayName: "Powerbuilder",
    tagline: "Strength + hypertrophy hybrid — barbell numbers and a build that shows them.",
    keyEmphasisTags: ["Strength", "Hypertrophy", "RPE-driven"],
    daysPerWeekRange: [4, 5],
    durationWeeksDefault: 16,
    defaultLifestylePicks: [
      { key: "sleep_duration", value: 7.5, unit: "hours", comparator: "gte" },
      { key: "stress", value: 3, unit: "scale", comparator: "lte" },
      { key: "mobility_minutes", value: 10, unit: "min", comparator: "gte" },
    ],
    defaultRefeedCadence: null,
    suggestedGoalKind: "strength",
    programEngineTemplateIds: ["upper-lower-power", "powerlifting-meet"],
  },
  {
    key: "busy_parent",
    displayName: "Busy Parent / Pro",
    tagline: "Time-budget plan that survives a 60-hour week and a kid who won't sleep.",
    keyEmphasisTags: ["Efficient sessions", "2–3 days/wk", "Recovery-aware"],
    daysPerWeekRange: [2, 3],
    durationWeeksDefault: 12,
    defaultLifestylePicks: [
      { key: "steps", value: 6000, unit: "steps", comparator: "gte" },
      { key: "sleep_duration", value: 6.5, unit: "hours", comparator: "gte" },
      { key: "sessions_completed", value: 2, unit: "sessions", comparator: "gte" },
    ],
    defaultRefeedCadence: null,
    suggestedGoalKind: "frequency",
    programEngineTemplateIds: ["minimalist", "home-dumbbell"],
  },
  {
    key: "athletic_foundations",
    displayName: "Athletic Foundations",
    tagline: "Move well, get strong, train the energy systems — for the field, not the mirror.",
    keyEmphasisTags: ["Power", "Conditioning", "Mobility"],
    daysPerWeekRange: [3, 4],
    durationWeeksDefault: 12,
    defaultLifestylePicks: [
      { key: "sleep_duration", value: 8, unit: "hours", comparator: "gte" },
      { key: "hrv", value: 50, unit: "ms", comparator: "gte" },
      { key: "daily_readiness", value: 2, unit: "scale", comparator: "gte" },
    ],
    defaultRefeedCadence: null,
    suggestedGoalKind: "custom",
    programEngineTemplateIds: ["athletic-performance"],
  },
  {
    key: "comeback",
    displayName: "Comeback",
    tagline: "Returning from injury or a long layoff — re-introduce load deliberately.",
    keyEmphasisTags: ["Pain-aware", "Recovery", "Gradual ramp"],
    daysPerWeekRange: [2, 3],
    durationWeeksDefault: 8,
    defaultLifestylePicks: [
      { key: "daily_readiness", value: 2, unit: "scale", comparator: "gte" },
      { key: "pain_check", value: 3, unit: "scale", comparator: "lte" },
      { key: "sleep_quality", value: 3, unit: "scale", comparator: "gte" },
    ],
    defaultRefeedCadence: null,
    suggestedGoalKind: "frequency",
    programEngineTemplateIds: ["beginner-muscle", "minimalist"],
  },
  {
    key: "longevity",
    displayName: "Longevity",
    tagline: "Strength + zone-2 + balance — the plan that's still working at 70.",
    keyEmphasisTags: ["Zone 2", "Balance", "Daily mobility"],
    daysPerWeekRange: [3, 4],
    durationWeeksDefault: 16,
    defaultLifestylePicks: [
      { key: "sleep_duration", value: 7.5, unit: "hours", comparator: "gte" },
      { key: "z2_minutes", value: 150, unit: "min", comparator: "gte" },
      { key: "balance_minutes", value: 20, unit: "min", comparator: "gte" },
    ],
    defaultRefeedCadence: null,
    suggestedGoalKind: "custom",
    programEngineTemplateIds: ["recomp-4day", "athletic-performance"],
  },
];

const BY_KEY = new Map(GAMEPLAN_TEMPLATES.map((t) => [t.key, t]));
const BY_ENGINE_TEMPLATE = new Map<string, GameplanTemplate>();
for (const t of GAMEPLAN_TEMPLATES) {
  for (const id of t.programEngineTemplateIds) {
    // First-write wins so the most-specific gameplan (e.g. lean_out
    // for cut-program) takes precedence over generic ones.
    if (!BY_ENGINE_TEMPLATE.has(id)) BY_ENGINE_TEMPLATE.set(id, t);
  }
}

export function gameplanTemplate(key: string | null | undefined): GameplanTemplate | null {
  if (!key) return null;
  return BY_KEY.get(key as GameplanKind) ?? null;
}

/**
 * Map a program-engine template id (e.g. "cut-program") onto its
 * gameplan kind (e.g. "lean_out"). Used by the picker's create flow
 * to auto-tag the new Program.
 */
export function inferGameplanKindFromTemplate(
  programEngineTemplateId: string | null | undefined,
): GameplanKind | null {
  if (!programEngineTemplateId) return null;
  return BY_ENGINE_TEMPLATE.get(programEngineTemplateId)?.key ?? null;
}

export function isValidGameplanKind(key: string): key is GameplanKind {
  return BY_KEY.has(key as GameplanKind);
}
