/**
 * Exercise categories — derived from `Exercise.movementPattern` (26 seeded
 * values) with `primaryMuscle` as the label for isolation patterns.
 *
 *   group  → the colour: push / pull / legs / core, or `other` (neutral)
 *   label  → what the UI prints next to the dot ("Vertical Pull", "Biceps")
 *
 * The category picker edits `movementPattern`; `CATEGORY_OPTIONS` is the list
 * it offers, grouped. Keep this the single source of truth — no per-screen
 * colour maps.
 */

export type CategoryGroup = "push" | "pull" | "legs" | "core" | "other";

export interface Category {
  group: CategoryGroup;
  label: string;
  /** The stored movementPattern value this label came from (null if unknown). */
  pattern: string | null;
}

const GROUP_OF: Record<string, CategoryGroup> = {
  "Horizontal Push": "push",
  "Vertical Push": "push",
  "Shoulder Isolation": "push",
  "Elbow Extension": "push",
  "Horizontal Pull": "pull",
  "Vertical Pull": "pull",
  "Elbow Flexion": "pull",
  "Scapular Elevation": "pull",
  Squat: "legs",
  Lunge: "legs",
  Step: "legs",
  "Hip Hinge": "legs",
  "Hip Extension": "legs",
  "Hip Abduction": "legs",
  "Hip Adduction": "legs",
  "Knee Extension": "legs",
  "Knee Flexion": "legs",
  "Plantar Flexion": "legs",
  "Core Stability": "core",
  "Core Flexion": "core",
  "Core Extension": "core",
  "Core Rotation": "core",
  Carry: "core",
  Power: "other",
  Cardio: "other",
  Stretch: "other",
};

/** Isolation patterns read better as the muscle they train. */
const MUSCLE_LABEL: Record<string, string> = {
  "Shoulder Isolation": "Shoulders",
  "Elbow Extension": "Triceps",
  "Elbow Flexion": "Biceps",
  "Scapular Elevation": "Traps",
  "Knee Extension": "Quads",
  "Knee Flexion": "Hamstrings",
  "Plantar Flexion": "Calves",
  "Hip Abduction": "Abductors",
  "Hip Adduction": "Adductors",
  "Hip Extension": "Glutes",
};

/** Legacy short tags some rows carry ("push" / "pull" / "legs" / "core"). */
const LEGACY_GROUP: Record<string, CategoryGroup> = { push: "push", pull: "pull", legs: "legs", core: "core" };

export function categoryFor(movementPattern: string | null | undefined, primaryMuscle?: string | null): Category {
  const pattern = movementPattern?.trim() || null;
  if (!pattern) {
    return { group: "other", label: primaryMuscle?.trim() || "Exercise", pattern: null };
  }
  const legacy = LEGACY_GROUP[pattern.toLowerCase()];
  if (legacy) return { group: legacy, label: primaryMuscle?.trim() || cap(pattern), pattern };
  const group = GROUP_OF[pattern] ?? "other";
  const muscle = MUSCLE_LABEL[pattern];
  const label = muscle ? (pattern === "Shoulder Isolation" && primaryMuscle ? primaryMuscle : muscle) : pattern;
  return { group, label, pattern };
}

/** The picker's options, in display order, grouped. */
export const CATEGORY_OPTIONS: { group: CategoryGroup; patterns: string[] }[] = [
  { group: "push", patterns: ["Horizontal Push", "Vertical Push", "Shoulder Isolation", "Elbow Extension"] },
  { group: "pull", patterns: ["Horizontal Pull", "Vertical Pull", "Elbow Flexion", "Scapular Elevation"] },
  {
    group: "legs",
    patterns: ["Squat", "Lunge", "Step", "Hip Hinge", "Hip Extension", "Hip Abduction", "Hip Adduction", "Knee Extension", "Knee Flexion", "Plantar Flexion"],
  },
  { group: "core", patterns: ["Core Stability", "Core Flexion", "Core Extension", "Core Rotation", "Carry"] },
  { group: "other", patterns: ["Power", "Cardio", "Stretch"] },
];

export const GROUP_LABEL: Record<CategoryGroup, string> = {
  push: "Push",
  pull: "Pull",
  legs: "Legs",
  core: "Core",
  other: "Other",
};

/** Tailwind class fragments per group (bg / text / dot). */
export const GROUP_BG: Record<CategoryGroup, string> = {
  push: "bg-ft-push",
  pull: "bg-ft-pull",
  legs: "bg-ft-legs",
  core: "bg-ft-core",
  other: "bg-ft-dim",
};
export const GROUP_TEXT: Record<CategoryGroup, string> = {
  push: "text-ft-push",
  pull: "text-ft-pull",
  legs: "text-ft-legs",
  core: "text-ft-core",
  other: "text-ft-dim",
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
