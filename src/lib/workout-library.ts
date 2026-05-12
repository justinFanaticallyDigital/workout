// src/lib/workout-library.ts
// ============================================================================
// R15 — Single-workout library registry per spec §6.5.
//
// Curated one-offs the user can run without committing to a program.
// Useful for travel, equipment-limited days, rest-day cravings, or just
// when the plan calls for something else.
//
// Each entry references exercises by name; resolution against the live
// Exercise library happens at run-time (POST /api/workouts/from-library
// resolves names → ids and silently skips any that don't match, so a
// missing exercise degrades to a thinner workout rather than a 500).
//
// Slot shape: `exerciseOptions` is always an array (length 1+). When the
// array has more than one entry, the start screen renders a picker so
// the user chooses which exercise to log; the optional `category` label
// describes the movement family ("Horizontal Push", etc.).
//
// Pure data — no Prisma, no React. Same pattern as
// `program-templates/index.ts` and `goal-engine/lifestyle-variables.ts`.
// ============================================================================

export type LibraryEquipment = "none" | "dumbbells" | "full_gym" | "any";

export interface LibrarySlot {
  /** Ordered exercise choices for this slot. The first entry is the
   *  default; the start screen surfaces a picker when there are 2+. Names
   *  must match `Exercise.name` from the seeded library (case-insensitive).
   *  Unresolved names are silently skipped on Workout creation. */
  exerciseOptions: string[];
  /** Optional movement-family label rendered above the slot when the
   *  user is choosing between options (e.g., "Horizontal Push"). */
  category?: string;
  /** Target sets to render on the logger. */
  targetSets: number;
  /** Target rep range string ("8-12" / "10" / "AMRAP" / "30s"). */
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
  // ─── Existing curated one-offs (original 8) ────────────────────────────
  {
    id: "full-body-dumbbell-30",
    name: "30-min Full Body Dumbbell",
    description:
      "Five-move full-body session in a single piece of equipment. Keeps tempo brisk; works as a hotel-room or garage default.",
    durationMin: 30,
    equipment: "dumbbells",
    tags: ["Full body", "Travel", "Beginner-friendly"],
    slots: [
      { exerciseOptions: ["Squat - Goblet Dumbbell"], targetSets: 3, targetRepRange: "10-12" },
      { exerciseOptions: ["Bench Press - Flat Dumbbell"], targetSets: 3, targetRepRange: "10-12" },
      { exerciseOptions: ["Row - Bent Over Dumbbell"], targetSets: 3, targetRepRange: "10-12" },
      { exerciseOptions: ["Deadlift - Romanian Dumbbell"], targetSets: 3, targetRepRange: "10-12" },
      { exerciseOptions: ["Plank - Standard Bodyweight"], targetSets: 3, targetRepRange: "30s" },
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
      { exerciseOptions: ["Bench Press - Flat Barbell"], targetSets: 4, targetRepRange: "6-8", targetRpe: "8" },
      { exerciseOptions: ["Overhead Press - Standing Barbell"], targetSets: 3, targetRepRange: "8-10", targetRpe: "8" },
      { exerciseOptions: ["Bench Press - Incline Dumbbell"], targetSets: 3, targetRepRange: "10-12" },
      { exerciseOptions: ["Raise - Lateral Dumbbell"], targetSets: 3, targetRepRange: "12-15" },
      { exerciseOptions: ["Tricep Pressdown - Cable"], targetSets: 3, targetRepRange: "12-15" },
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
      { exerciseOptions: ["Pull Up - Bodyweight"], targetSets: 4, targetRepRange: "6-10", targetRpe: "8" },
      { exerciseOptions: ["Row - Bent Over Barbell"], targetSets: 4, targetRepRange: "6-8", targetRpe: "8" },
      { exerciseOptions: ["Pulldown - Lat Cable"], targetSets: 3, targetRepRange: "10-12" },
      { exerciseOptions: ["Face Pull - Cable"], targetSets: 3, targetRepRange: "12-15" },
      { exerciseOptions: ["Curl - Dumbbell"], targetSets: 3, targetRepRange: "10-12" },
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
      { exerciseOptions: ["Squat - Low Bar Barbell"], targetSets: 4, targetRepRange: "5", targetRpe: "8" },
      { exerciseOptions: ["Deadlift - Romanian Barbell"], targetSets: 4, targetRepRange: "6-8", targetRpe: "8" },
      { exerciseOptions: ["Leg Press - Machine"], targetSets: 3, targetRepRange: "10-12" },
      { exerciseOptions: ["Hip Thrust - Barbell"], targetSets: 3, targetRepRange: "10-12" },
      { exerciseOptions: ["Calf Raise - Standing Machine"], targetSets: 4, targetRepRange: "12-15" },
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
      { exerciseOptions: ["Burpee - Bodyweight"], targetSets: 5, targetRepRange: "10", notes: "1 min on / 1 min off" },
      { exerciseOptions: ["Mountain Climber - Bodyweight"], targetSets: 5, targetRepRange: "30s" },
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
      { exerciseOptions: ["Deep Split Squat Stretch"], targetSets: 2, targetRepRange: "30s" },
      { exerciseOptions: ["Forward Fold"], targetSets: 2, targetRepRange: "30s" },
      { exerciseOptions: ["Cactus Arms"], targetSets: 2, targetRepRange: "10" },
      { exerciseOptions: ["Standing Lunge Twist"], targetSets: 2, targetRepRange: "10" },
      { exerciseOptions: ["Reverse Prayer Pose"], targetSets: 2, targetRepRange: "30s" },
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
      { exerciseOptions: ["Push Up - Standard Bodyweight"], targetSets: 6, targetRepRange: "12" },
      { exerciseOptions: ["Squat - Box Bodyweight"], targetSets: 6, targetRepRange: "15" },
      { exerciseOptions: ["Pull Up - Bodyweight"], targetSets: 6, targetRepRange: "5-8" },
      { exerciseOptions: ["Plank - Standard Bodyweight"], targetSets: 6, targetRepRange: "30s" },
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
      { exerciseOptions: ["Hip Thrust - Dumbbell"], targetSets: 3, targetRepRange: "10-12" },
      { exerciseOptions: ["Glute Bridge - Bodyweight"], targetSets: 3, targetRepRange: "12-15" },
      { exerciseOptions: ["Plank - Standard Bodyweight"], targetSets: 3, targetRepRange: "45s" },
      { exerciseOptions: ["Russian Twist - Bodyweight"], targetSets: 3, targetRepRange: "20" },
    ],
  },

  // ─── New: FitTrack sample workouts (10 multi-option entries) ───────────
  {
    id: "push-day-cst",
    name: "Push Day — Chest/Shoulders/Triceps",
    description:
      "Single-day push split: chest + shoulders + triceps, strength → hypertrophy structure with isolation finishers.",
    durationMin: 60,
    equipment: "full_gym",
    tags: ["Push", "Chest", "Shoulders", "Triceps"],
    slots: [
      {
        category: "Horizontal Push",
        exerciseOptions: [
          "Bench Press - Flat Barbell",
          "Bench Press - Flat Dumbbell",
          "Bench Press - Incline Dumbbell",
        ],
        targetSets: 4,
        targetRepRange: "6-8",
      },
      {
        category: "Vertical Push",
        exerciseOptions: [
          "Overhead Press - Seated Dumbbell",
          "Overhead Press - Seated Barbell",
          "Landmine Press - Standing",
        ],
        targetSets: 3,
        targetRepRange: "8-10",
      },
      {
        category: "Horizontal Push",
        exerciseOptions: [
          "Bench Press - Incline Dumbbell",
          "Bench Press - Incline Smith Machine",
        ],
        targetSets: 3,
        targetRepRange: "10-12",
      },
      {
        category: "Shoulder Isolation",
        exerciseOptions: [
          "Raise - Lateral Dumbbell",
          "Raise - Lateral Cable",
          "Raise - Lateral Resistance Band",
        ],
        targetSets: 3,
        targetRepRange: "12-15",
      },
      {
        category: "Elbow Extension",
        exerciseOptions: [
          "Skull Crusher - EZ Bar",
          "Tricep Extension - Overhead Cable",
          "Skull Crusher - Dumbbell",
        ],
        targetSets: 3,
        targetRepRange: "10-12",
      },
      {
        category: "Elbow Extension",
        exerciseOptions: ["Tricep Dip - Machine", "Tricep Kickback - Dumbbell"],
        targetSets: 3,
        targetRepRange: "12-15",
      },
    ],
  },
  {
    id: "pull-day-back-biceps",
    name: "Pull Day — Back/Biceps",
    description:
      "Single-day pull split: back, biceps, and rear delts. Heavy vertical/horizontal pull followed by curl volume.",
    durationMin: 60,
    equipment: "full_gym",
    tags: ["Pull", "Back", "Biceps", "Rear Delts"],
    slots: [
      {
        category: "Vertical Pull",
        exerciseOptions: [
          "Pull Up - Bodyweight",
          "Pull Up - Weighted Bodyweight",
          "Pull Up - Assisted Machine",
        ],
        targetSets: 4,
        targetRepRange: "6-8",
      },
      {
        category: "Horizontal Pull",
        exerciseOptions: [
          "Row - Bent Over Barbell",
          "Row - Chest Supported Dumbbell",
          "Row - Seated Cable",
        ],
        targetSets: 4,
        targetRepRange: "8-10",
      },
      {
        category: "Vertical Pull",
        exerciseOptions: [
          "Pulldown - Lat Cable",
          "Pulldown - Close Grip Cable",
          "Pulldown - Reverse Grip Cable",
        ],
        targetSets: 3,
        targetRepRange: "10-12",
      },
      {
        category: "Shoulder Isolation",
        exerciseOptions: [
          "Face Pull - Cable",
          "Fly - Rear Delt Dumbbell",
          "Fly - Rear Delt Machine",
        ],
        targetSets: 3,
        targetRepRange: "12-15",
      },
      {
        category: "Elbow Flexion",
        exerciseOptions: ["Curl - Barbell", "Curl - EZ Bar", "Curl - Dumbbell"],
        targetSets: 3,
        targetRepRange: "8-10",
      },
      {
        category: "Elbow Flexion",
        exerciseOptions: [
          "Curl - Hammer Dumbbell",
          "Curl - Cable",
          "Curl - Incline Dumbbell",
        ],
        targetSets: 3,
        targetRepRange: "12-15",
      },
    ],
  },
  {
    id: "leg-day-strength",
    name: "Leg Day — Strength Focus",
    description:
      "Lower body strength session — heavy squat + deadlift, then accessory work for hamstrings, calves, and core.",
    durationMin: 75,
    equipment: "full_gym",
    tags: ["Lower", "Strength", "Squat", "Deadlift"],
    slots: [
      {
        category: "Squat",
        exerciseOptions: [
          "Squat - Low Bar Barbell",
          "Squat - High Bar Barbell",
          "Squat - Front Barbell",
        ],
        targetSets: 5,
        targetRepRange: "3-5",
      },
      {
        category: "Hip Hinge",
        exerciseOptions: [
          "Deadlift - Conventional Barbell",
          "Deadlift - Hex Bar",
          "Deadlift - Romanian Barbell",
        ],
        targetSets: 4,
        targetRepRange: "5-6",
      },
      {
        category: "Lunge",
        exerciseOptions: [
          "Lunge - Bulgarian Split Squat Dumbbell",
          "Lunge - Walking Dumbbell",
          "Lunge - Reverse Dumbbell",
        ],
        targetSets: 3,
        targetRepRange: "8-10",
      },
      {
        category: "Knee Flexion",
        exerciseOptions: [
          "Leg Curl - Machine",
          "Leg Curl - Seated Machine",
          "Leg Curl - Prone Machine",
        ],
        targetSets: 3,
        targetRepRange: "8-12",
      },
      {
        category: "Plantar Flexion",
        exerciseOptions: [
          "Calf Raise - Standing Machine",
          "Calf Raise - Seated Machine",
          "Calf Raise - Smith Machine",
        ],
        targetSets: 4,
        targetRepRange: "10-15",
      },
      {
        category: "Core Stability",
        exerciseOptions: [
          "Plank - Standard Bodyweight",
          "Pallof Press - Cable",
          "Dead Bug - Bodyweight",
        ],
        targetSets: 3,
        targetRepRange: "30-60s",
      },
    ],
  },
  {
    id: "upper-hypertrophy",
    name: "Upper Body — Hypertrophy",
    description:
      "Full upper body pump day. Moderate weight, higher reps, balanced push/pull with isolation finishers.",
    durationMin: 60,
    equipment: "full_gym",
    tags: ["Upper", "Hypertrophy", "Pump"],
    slots: [
      {
        category: "Horizontal Push",
        exerciseOptions: ["Bench Press - Incline Dumbbell", "Bench Press - Flat Dumbbell"],
        targetSets: 4,
        targetRepRange: "8-12",
      },
      {
        category: "Horizontal Pull",
        exerciseOptions: [
          "Row - Chest Supported Dumbbell",
          "Row - Seated Cable",
          "Row - Bent Over Dumbbell",
        ],
        targetSets: 4,
        targetRepRange: "8-12",
      },
      {
        category: "Vertical Push",
        exerciseOptions: [
          "Overhead Press - Seated Dumbbell",
          "Landmine Press - Standing",
          "Overhead Press - Arnold Dumbbell",
        ],
        targetSets: 3,
        targetRepRange: "10-12",
      },
      {
        category: "Vertical Pull",
        exerciseOptions: ["Pulldown - Lat Cable", "Pulldown - Close Grip Cable"],
        targetSets: 3,
        targetRepRange: "10-12",
      },
      {
        category: "Shoulder Isolation",
        exerciseOptions: [
          "Raise - Lateral Cable",
          "Raise - Lateral Dumbbell",
          "Fly - Rear Delt Machine",
        ],
        targetSets: 3,
        targetRepRange: "12-20",
      },
      {
        category: "Elbow Flexion",
        exerciseOptions: ["Curl - Cable", "Curl - Dumbbell", "Curl - Hammer Dumbbell"],
        targetSets: 3,
        targetRepRange: "10-15",
      },
      {
        category: "Elbow Extension",
        exerciseOptions: ["Tricep Extension - Overhead Cable", "Skull Crusher - EZ Bar"],
        targetSets: 3,
        targetRepRange: "10-15",
      },
    ],
  },
  {
    id: "lower-hypertrophy",
    name: "Lower Body — Hypertrophy",
    description:
      "Full lower body pump day. Machine and dumbbell focus — quad / hamstring / glute volume with a calf finisher.",
    durationMin: 60,
    equipment: "full_gym",
    tags: ["Lower", "Hypertrophy", "Pump"],
    slots: [
      {
        category: "Squat",
        exerciseOptions: [
          "Squat - High Bar Barbell",
          "Squat - Front Barbell",
          "Hack Squat - Plate Lever",
        ],
        targetSets: 4,
        targetRepRange: "6-10",
      },
      {
        category: "Hip Hinge",
        exerciseOptions: ["Deadlift - Romanian Barbell", "Deadlift - Romanian Dumbbell"],
        targetSets: 4,
        targetRepRange: "8-10",
      },
      {
        category: "Knee Extension",
        exerciseOptions: [
          "Leg Press - Machine",
          "Leg Extension - Machine",
          "Leg Press - Plate",
        ],
        targetSets: 3,
        targetRepRange: "10-15",
      },
      {
        category: "Knee Flexion",
        exerciseOptions: ["Leg Curl - Seated Machine", "Leg Curl - Prone Machine"],
        targetSets: 3,
        targetRepRange: "10-15",
      },
      {
        category: "Hip Extension",
        exerciseOptions: [
          "Hip Thrust - Barbell",
          "Hip Thrust - Dumbbell",
          "Glute Bridge - Dumbbell",
        ],
        targetSets: 3,
        targetRepRange: "10-12",
      },
      {
        category: "Hip Abduction",
        exerciseOptions: ["Hip Abduction - Machine", "Lateral Walk - Resistance Band"],
        targetSets: 3,
        targetRepRange: "12-20",
      },
      {
        category: "Plantar Flexion",
        exerciseOptions: ["Calf Raise - Standing Machine", "Calf Raise - Seated Machine"],
        targetSets: 4,
        targetRepRange: "12-15",
      },
    ],
  },
  {
    id: "full-body-quick-hit",
    name: "Full Body — Quick Hit",
    description:
      "~45-minute full body session. One compound per pattern, finishing with a short core hold.",
    durationMin: 45,
    equipment: "full_gym",
    tags: ["Full body", "Quick", "Compound"],
    slots: [
      {
        category: "Squat",
        exerciseOptions: [
          "Squat - High Bar Barbell",
          "Squat - Goblet Dumbbell",
          "Squat - Front Barbell",
        ],
        targetSets: 3,
        targetRepRange: "6-8",
      },
      {
        category: "Horizontal Push",
        exerciseOptions: ["Bench Press - Flat Barbell", "Bench Press - Flat Dumbbell"],
        targetSets: 3,
        targetRepRange: "6-8",
      },
      {
        category: "Horizontal Pull",
        exerciseOptions: [
          "Row - Bent Over Barbell",
          "Row - Chest Supported Dumbbell",
          "Row - Seated Cable",
        ],
        targetSets: 3,
        targetRepRange: "8-10",
      },
      {
        category: "Hip Hinge",
        exerciseOptions: ["Deadlift - Romanian Dumbbell", "Deadlift - Romanian Barbell"],
        targetSets: 3,
        targetRepRange: "8-10",
      },
      {
        category: "Vertical Push",
        exerciseOptions: ["Overhead Press - Seated Dumbbell", "Landmine Press - Standing"],
        targetSets: 3,
        targetRepRange: "10-12",
      },
      {
        category: "Core Stability",
        exerciseOptions: [
          "Plank - Standard Bodyweight",
          "Pallof Press - Cable",
          "Dead Bug - Bodyweight",
        ],
        targetSets: 3,
        targetRepRange: "30-45s",
      },
    ],
  },
  {
    id: "glute-focus-day",
    name: "Glute Focus Day",
    description:
      "Glute-targeted lower body day. Hip hinge + hip extension volume backed by abduction and step work.",
    durationMin: 60,
    equipment: "full_gym",
    tags: ["Lower", "Glutes", "Hypertrophy"],
    slots: [
      {
        category: "Hip Extension",
        exerciseOptions: [
          "Hip Thrust - Barbell",
          "Hip Thrust - Dumbbell",
          "Hip Thrust - Smith Machine",
        ],
        targetSets: 4,
        targetRepRange: "8-10",
      },
      {
        category: "Hip Hinge",
        exerciseOptions: [
          "Deadlift - Romanian Barbell",
          "Deadlift - Romanian Dumbbell",
          "Deadlift - Sumo Barbell",
        ],
        targetSets: 4,
        targetRepRange: "8-10",
      },
      {
        category: "Lunge",
        exerciseOptions: [
          "Lunge - Bulgarian Split Squat Dumbbell",
          "Lunge - Reverse Dumbbell",
          "Lunge - Walking Dumbbell",
        ],
        targetSets: 3,
        targetRepRange: "10-12",
      },
      {
        category: "Hip Abduction",
        exerciseOptions: [
          "Hip Abduction - Machine",
          "Lateral Walk - Resistance Band",
          "Clamshell - Resistance Band",
        ],
        targetSets: 3,
        targetRepRange: "12-20",
      },
      {
        category: "Hip Extension",
        exerciseOptions: ["Glute Bridge - Single Leg Dumbbell", "Glute Bridge - Dumbbell"],
        targetSets: 3,
        targetRepRange: "10-15",
      },
      {
        category: "Step",
        exerciseOptions: ["Step Up - Dumbbell", "Step Up - Lateral Dumbbell"],
        targetSets: 3,
        targetRepRange: "10-12",
      },
    ],
  },
  {
    id: "conditioning-power",
    name: "Conditioning + Power",
    description:
      "Olympic lifts, ballistics, and carries — a power and conditioning day for non-program training blocks.",
    durationMin: 50,
    equipment: "full_gym",
    tags: ["Power", "Conditioning", "Olympic"],
    slots: [
      {
        category: "Power",
        exerciseOptions: ["Clean - Kettlebell", "Clean - Barbell", "Snatch - Kettlebell"],
        targetSets: 5,
        targetRepRange: "3-5",
      },
      {
        category: "Power",
        exerciseOptions: [
          "Thruster - Dumbbell",
          "Thruster - Barbell",
          "Slam Ball - Overhead",
        ],
        targetSets: 4,
        targetRepRange: "5-8",
      },
      {
        category: "Cardio",
        exerciseOptions: [
          "Burpee - Bodyweight",
          "Battle Ropes - Alternating",
          "Jumping Jacks - Bodyweight",
        ],
        targetSets: 5,
        targetRepRange: "30-45s",
      },
      {
        category: "Carry",
        exerciseOptions: [
          "Farmer Walk - Dumbbell",
          "Farmer Walk - Kettlebell",
          "Overhead Carry - Kettlebell",
        ],
        targetSets: 3,
        targetRepRange: "40m",
      },
      {
        category: "Power",
        exerciseOptions: [
          "Medicine Ball Throw - Chest Pass",
          "Slam - Medicine Ball",
          "Medicine Ball Throw - Overhead",
        ],
        targetSets: 3,
        targetRepRange: "5-8",
      },
      {
        category: "Core Stability",
        exerciseOptions: [
          "Plank - Standard Bodyweight",
          "Plank - Side Bodyweight",
          "Hollow Body Hold - Bodyweight",
        ],
        targetSets: 3,
        targetRepRange: "30-45s",
      },
    ],
  },
  {
    id: "arms-shoulders-pump",
    name: "Arms + Shoulders Pump",
    description:
      "Direct arm and shoulder work, high volume — useful between heavy lifting days or as a deload accessory session.",
    durationMin: 55,
    equipment: "full_gym",
    tags: ["Arms", "Shoulders", "Pump"],
    slots: [
      {
        category: "Vertical Push",
        exerciseOptions: [
          "Overhead Press - Seated Dumbbell",
          "Overhead Press - Seated Barbell",
          "Overhead Press - Arnold Dumbbell",
        ],
        targetSets: 4,
        targetRepRange: "8-10",
      },
      {
        category: "Shoulder Isolation",
        exerciseOptions: ["Raise - Lateral Dumbbell", "Raise - Lateral Cable"],
        targetSets: 4,
        targetRepRange: "10-15",
      },
      {
        category: "Shoulder Isolation",
        exerciseOptions: [
          "Fly - Rear Delt Dumbbell",
          "Fly - Rear Delt Machine",
          "Face Pull - Cable",
        ],
        targetSets: 3,
        targetRepRange: "12-15",
      },
      {
        category: "Elbow Flexion",
        exerciseOptions: ["Curl - Barbell", "Curl - EZ Bar", "Curl - Dumbbell"],
        targetSets: 4,
        targetRepRange: "8-10",
      },
      {
        category: "Elbow Extension",
        exerciseOptions: [
          "Skull Crusher - EZ Bar",
          "Tricep Extension - Overhead Cable",
          "Skull Crusher - Dumbbell",
        ],
        targetSets: 4,
        targetRepRange: "8-10",
      },
      {
        category: "Elbow Flexion",
        exerciseOptions: [
          "Curl - Hammer Dumbbell",
          "Curl - Concentration Dumbbell",
          "Curl - Cable",
        ],
        targetSets: 3,
        targetRepRange: "12-15",
      },
      {
        category: "Elbow Extension",
        exerciseOptions: ["Tricep Dip - Machine", "Tricep Kickback - Dumbbell"],
        targetSets: 3,
        targetRepRange: "12-15",
      },
    ],
  },
  {
    id: "core-mobility",
    name: "Core + Mobility",
    description:
      "Core stability, flexion, rotation, and extension — pairs well with a rest day or a Z2 cardio session.",
    durationMin: 40,
    equipment: "any",
    tags: ["Core", "Mobility", "Recovery"],
    slots: [
      {
        category: "Core Stability",
        exerciseOptions: [
          "Plank - Standard Bodyweight",
          "Plank - Side Bodyweight",
          "Hollow Body Hold - Bodyweight",
        ],
        targetSets: 3,
        targetRepRange: "30-60s",
      },
      {
        category: "Core Flexion",
        exerciseOptions: [
          "Leg Raise - Hanging Bodyweight",
          "Knee Raise - Hanging Bodyweight",
          "V-Up - Bodyweight",
        ],
        targetSets: 3,
        targetRepRange: "10-15",
      },
      {
        category: "Core Rotation",
        exerciseOptions: [
          "Wood Chop - Cable",
          "Russian Twist - Medicine Ball",
          "Bicycle Crunch - Bodyweight",
        ],
        targetSets: 3,
        targetRepRange: "10-12",
      },
      {
        category: "Core Extension",
        exerciseOptions: [
          "Back Extension - 45 Degree Bodyweight",
          "Superman - Bodyweight",
          "Reverse Hyper - Machine",
        ],
        targetSets: 3,
        targetRepRange: "10-15",
      },
      {
        category: "Core Stability",
        exerciseOptions: [
          "Pallof Press - Cable",
          "Pallof Press - Resistance Band",
          "Bird Dog - Bodyweight",
        ],
        targetSets: 3,
        targetRepRange: "8-10",
      },
      {
        category: "Core Flexion",
        exerciseOptions: ["Dead Bug - Bodyweight", "Mountain Climber - Bodyweight"],
        targetSets: 3,
        targetRepRange: "30-60s",
      },
    ],
  },
];

const BY_ID = new Map(WORKOUT_LIBRARY.map((w) => [w.id, w]));

export function getLibraryEntry(id: string): WorkoutLibraryEntry | null {
  return BY_ID.get(id) ?? null;
}

/**
 * Resolve a slot's exercise name given an optional user selection index.
 * Falls back to the first option when the index is missing or out of bounds.
 */
export function resolveSlotChoice(slot: LibrarySlot, selectionIndex?: number): string {
  const options = slot.exerciseOptions;
  if (!options.length) return "";
  if (
    typeof selectionIndex === "number" &&
    Number.isInteger(selectionIndex) &&
    selectionIndex >= 0 &&
    selectionIndex < options.length
  ) {
    return options[selectionIndex];
  }
  return options[0];
}
