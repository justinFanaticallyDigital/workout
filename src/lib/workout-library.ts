// src/lib/workout-library.ts
// ============================================================================
// R15 — Single-workout library registry per spec §6.5.
//
// 8 curated one-offs the user can run without committing to a program.
// Useful for travel, equipment-limited days, rest-day cravings, or just
// when the plan calls for something else.
//
// Each entry references exercises by name; resolution against the live
// Exercise library happens at run-time (POST /api/workouts/from-library
// resolves names → ids and silently skips any that don't match, so a
// missing exercise degrades to a thinner workout rather than a 500).
//
// Pure data — no Prisma, no React. Same pattern as
// `program-templates/index.ts` and `goal-engine/lifestyle-variables.ts`.
// ============================================================================

export type LibraryEquipment = "none" | "dumbbells" | "full_gym" | "any";

export interface LibrarySlot {
  /** Exact Exercise.name from the seeded library — matched
   *  case-insensitive at run-time. Slots that don't resolve are
   *  silently skipped on Workout creation. */
  exerciseName: string;
  /** Target sets to render on the logger. */
  targetSets: number;
  /** Target rep range string ("8-12" / "10" / "AMRAP"). */
  targetRepRange: string;
  /** Optional RPE target (string-form to match the schema column). */
  targetRpe?: string;
  /** Optional human-readable note rendered above the set rows. */
  notes?: string;
}

export interface WorkoutLibraryEntry {
  /** Stable kebab-case id used in URLs + the from-library endpoint. */
  id: string;
  name: string;
  description: string;
  durationMin: number;
  equipment: LibraryEquipment;
  /** Display chips on the list card. */
  tags: string[];
  /** Ordered slots — sortOrder flows from index. */
  slots: LibrarySlot[];
}

export const WORKOUT_LIBRARY: readonly WorkoutLibraryEntry[] = [
  {
    id: "full-body-dumbbell-30",
    name: "30-min Full Body Dumbbell",
    description:
      "Five-move full-body session in a single piece of equipment. Keeps tempo brisk; works as a hotel-room or garage default.",
    durationMin: 30,
    equipment: "dumbbells",
    tags: ["Full body", "Travel", "Beginner-friendly"],
    slots: [
      { exerciseName: "Goblet Squat", targetSets: 3, targetRepRange: "10-12" },
      { exerciseName: "Bench Press - Dumbbell", targetSets: 3, targetRepRange: "10-12" },
      { exerciseName: "Bent Over Row - Dumbbell", targetSets: 3, targetRepRange: "10-12" },
      { exerciseName: "Romanian Deadlift - Dumbbell", targetSets: 3, targetRepRange: "10-12" },
      { exerciseName: "Plank", targetSets: 3, targetRepRange: "30s" },
    ],
  },
  {
    id: "upper-push-45",
    name: "45-min Upper Push",
    description:
      "Chest / shoulders / triceps focused session for a missed push day. Compound first, isolation finishers.",
    durationMin: 45,
    equipment: "full_gym",
    tags: ["Upper", "Push", "Intermediate"],
    slots: [
      { exerciseName: "Bench Press - Flat Barbell", targetSets: 4, targetRepRange: "6-8", targetRpe: "8" },
      { exerciseName: "Overhead Press - Barbell", targetSets: 3, targetRepRange: "8-10", targetRpe: "8" },
      { exerciseName: "Bench Press - Incline Dumbbell", targetSets: 3, targetRepRange: "10-12" },
      { exerciseName: "Lateral Raise - Dumbbell", targetSets: 3, targetRepRange: "12-15" },
      { exerciseName: "Tricep Pushdown - Cable", targetSets: 3, targetRepRange: "12-15" },
    ],
  },
  {
    id: "upper-pull-45",
    name: "45-min Upper Pull",
    description:
      "Back + biceps session. Heavy row + chinup, then arms. Good when a pull day got skipped.",
    durationMin: 45,
    equipment: "full_gym",
    tags: ["Upper", "Pull", "Intermediate"],
    slots: [
      { exerciseName: "Pull Up", targetSets: 4, targetRepRange: "6-10", targetRpe: "8" },
      { exerciseName: "Bent Over Row - Barbell", targetSets: 4, targetRepRange: "6-8", targetRpe: "8" },
      { exerciseName: "Lat Pulldown", targetSets: 3, targetRepRange: "10-12" },
      { exerciseName: "Face Pull - Cable", targetSets: 3, targetRepRange: "12-15" },
      { exerciseName: "Bicep Curl - Dumbbell", targetSets: 3, targetRepRange: "10-12" },
    ],
  },
  {
    id: "lower-compound-60",
    name: "Lower Compound 60-min",
    description:
      "Squat / hinge focused. Two compounds, two accessories. Heavier session — bring a partner if you're going for top sets.",
    durationMin: 60,
    equipment: "full_gym",
    tags: ["Lower", "Strength", "Intermediate"],
    slots: [
      { exerciseName: "Squat - Back Barbell", targetSets: 4, targetRepRange: "5", targetRpe: "8" },
      { exerciseName: "Romanian Deadlift - Barbell", targetSets: 4, targetRepRange: "6-8", targetRpe: "8" },
      { exerciseName: "Leg Press", targetSets: 3, targetRepRange: "10-12" },
      { exerciseName: "Hip Thrust - Barbell", targetSets: 3, targetRepRange: "10-12" },
      { exerciseName: "Calf Raise - Standing", targetSets: 4, targetRepRange: "12-15" },
    ],
  },
  {
    id: "cardio-finisher-20",
    name: "Cardio Finisher 20-min",
    description:
      "Short conditioning piece — tack on at the end of a lift or run alone. Pick your modality; the structure stays the same.",
    durationMin: 20,
    equipment: "any",
    tags: ["Cardio", "Conditioning"],
    slots: [
      { exerciseName: "Burpee", targetSets: 5, targetRepRange: "10", notes: "1 min on / 1 min off" },
      { exerciseName: "Mountain Climber", targetSets: 5, targetRepRange: "30s" },
    ],
  },
  {
    id: "stretch-mobility-25",
    name: "Stretch & Mobility 25-min",
    description:
      "Active recovery flow. Pair with a Z2 walk or run alone on rest days when the joints feel cranky.",
    durationMin: 25,
    equipment: "none",
    tags: ["Mobility", "Recovery"],
    slots: [
      { exerciseName: "Hip Flexor Stretch", targetSets: 2, targetRepRange: "30s" },
      { exerciseName: "Pigeon Pose", targetSets: 2, targetRepRange: "30s" },
      { exerciseName: "Cat-Cow", targetSets: 2, targetRepRange: "10" },
      { exerciseName: "Thoracic Rotation", targetSets: 2, targetRepRange: "10" },
      { exerciseName: "Childs Pose", targetSets: 2, targetRepRange: "30s" },
    ],
  },
  {
    id: "bodyweight-emom-30",
    name: "Bodyweight EMOM 30-min",
    description:
      "Every-minute-on-the-minute circuit, four moves rotating through six rounds. No equipment, no excuses.",
    durationMin: 30,
    equipment: "none",
    tags: ["Bodyweight", "Conditioning", "Travel"],
    slots: [
      { exerciseName: "Push Up", targetSets: 6, targetRepRange: "12" },
      { exerciseName: "Bodyweight Squat", targetSets: 6, targetRepRange: "15" },
      { exerciseName: "Pull Up", targetSets: 6, targetRepRange: "5-8" },
      { exerciseName: "Plank", targetSets: 6, targetRepRange: "30s" },
    ],
  },
  {
    id: "glutes-core-20",
    name: "Quick Glutes & Core 20-min",
    description:
      "Twenty-minute targeted session — useful as a finisher or a standalone on a busy morning. No barbell needed.",
    durationMin: 20,
    equipment: "dumbbells",
    tags: ["Lower", "Core", "Quick"],
    slots: [
      { exerciseName: "Hip Thrust - Dumbbell", targetSets: 3, targetRepRange: "10-12" },
      { exerciseName: "Glute Bridge", targetSets: 3, targetRepRange: "12-15" },
      { exerciseName: "Plank", targetSets: 3, targetRepRange: "45s" },
      { exerciseName: "Russian Twist", targetSets: 3, targetRepRange: "20" },
    ],
  },
];

const BY_ID = new Map(WORKOUT_LIBRARY.map((w) => [w.id, w]));

export function getLibraryEntry(id: string): WorkoutLibraryEntry | null {
  return BY_ID.get(id) ?? null;
}
