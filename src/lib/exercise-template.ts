/**
 * Exercise template — the structured vocabulary behind "New exercise".
 *
 * A custom exercise is assembled from fields instead of typed as free prose, so
 * it lands in the library with the same shape as the 367 seeded rows:
 *
 *   "<Movement> - <Position> <Grip> <Tempo> <Equipment>"
 *   e.g. "Bench Press - Incline Neutral Grip Dumbbell", "Squat - Low Bar Paused Barbell"
 *
 * `inferCategory` guesses the movementPattern + primaryMuscle from the movement
 * text so the category chip is usually right before the user touches it.
 * Keep this the single source of truth for modifier lists — the sheet, the
 * /exercises/new page and the API all read from here.
 */

export type ModifierGroupKey = "position" | "grip" | "tempo";

export interface ModifierGroup {
  key: ModifierGroupKey;
  label: string;
  options: string[];
}

/** Angle / stance / support. Multi-select. */
export const POSITION_OPTIONS = [
  "Flat",
  "Incline",
  "Decline",
  "Standing",
  "Seated",
  "Lying",
  "Kneeling",
  "Half Kneeling",
  "Bent Over",
  "Chest Supported",
  "Preacher",
  "Heel Elevated",
  "Deficit",
  "Single Arm",
  "Single Leg",
  "Alternating",
  "Sumo",
  "Conventional",
] as const;

/** Bar placement / hand position. Multi-select. */
export const GRIP_OPTIONS = [
  "High Bar",
  "Low Bar",
  "Front Rack",
  "Safety Bar",
  "Zercher",
  "Wide Grip",
  "Close Grip",
  "Neutral Grip",
  "Overhand",
  "Underhand",
  "Reverse Grip",
  "Mixed Grip",
  "Rope",
  "Straight Bar",
] as const;

/** Rep execution. Multi-select. */
export const TEMPO_OPTIONS = ["Explosive", "Paused", "Tempo", "Eccentric", "1.5 Rep", "Partial", "Isometric", "Pin", "Dead Stop"] as const;

/** Loading implement. Single-select — stored on `Exercise.equipment`. */
export const EQUIPMENT_OPTIONS = [
  "Barbell",
  "Dumbbell",
  "Kettlebell",
  "Cable",
  "Machine",
  "Plate Lever",
  "Smith Machine",
  "EZ Bar",
  "Hex Bar",
  "Resistance Band",
  "TRX",
  "Medicine Ball",
  "Plate",
  "Weighted",
  "Bodyweight",
] as const;

/** Short hint under the equipment label where the gym term differs. */
export const EQUIPMENT_HINT: Partial<Record<(typeof EQUIPMENT_OPTIONS)[number], string>> = {
  Machine: "pin loaded",
  "Plate Lever": "plate loaded",
};

export const MODIFIER_GROUPS: ModifierGroup[] = [
  { key: "position", label: "Position · angle", options: [...POSITION_OPTIONS] },
  { key: "grip", label: "Grip · bar", options: [...GRIP_OPTIONS] },
  { key: "tempo", label: "Tempo", options: [...TEMPO_OPTIONS] },
];

/** Primary muscles in the seed, in picker order. */
export const PRIMARY_MUSCLES = [
  "Chest",
  "Shoulders",
  "Rear Delts",
  "Triceps",
  "Lats",
  "Biceps",
  "Forearms",
  "Traps",
  "Quadriceps",
  "Hamstrings",
  "Glutes",
  "Adductors",
  "Abductors",
  "Calves",
  "Hip Flexors",
  "Core",
  "Obliques",
  "Lower Back",
  "Full Body",
] as const;

export interface ExerciseTemplate {
  movement: string;
  position: string[];
  grip: string[];
  tempo: string[];
  equipment: string | null;
  movementPattern: string | null;
  primaryMuscle: string | null;
}

export const EMPTY_TEMPLATE: ExerciseTemplate = {
  movement: "",
  position: [],
  grip: [],
  tempo: [],
  equipment: null,
  movementPattern: null,
  primaryMuscle: null,
};

/** Ordered modifier words, position → grip → tempo, in the order each list defines them. */
export function modifierWords(t: Pick<ExerciseTemplate, "position" | "grip" | "tempo">): string[] {
  const ordered = (picked: string[], all: readonly string[]) => all.filter((o) => picked.includes(o));
  return [...ordered(t.position, POSITION_OPTIONS), ...ordered(t.grip, GRIP_OPTIONS), ...ordered(t.tempo, TEMPO_OPTIONS)];
}

/** "<Movement> - <modifiers> <Equipment>" — the seed's naming convention. Empty movement → "". */
export function buildExerciseName(t: ExerciseTemplate): string {
  const movement = t.movement.trim().replace(/\s+/g, " ");
  if (!movement) return "";
  const tail = [...modifierWords(t), ...(t.equipment ? [t.equipment] : [])].join(" ");
  return tail ? `${movement} - ${tail}` : movement;
}

/**
 * Guess category + muscle from the movement text. First matching rule wins, so
 * specific phrases sit above generic ones ("Leg Curl" before "Curl").
 */
const INFER_RULES: { test: RegExp; pattern: string; muscle: string | null }[] = [
  { test: /\b(leg|hamstring|nordic)\b.*\bcurl\b|\bcurl\b.*\b(leg|hamstring)\b|\bnordic\b/i, pattern: "Knee Flexion", muscle: "Hamstrings" },
  { test: /\bleg extension\b|\bknee extension\b/i, pattern: "Knee Extension", muscle: "Quadriceps" },
  { test: /\bcalf\b|\bcalves\b/i, pattern: "Plantar Flexion", muscle: "Calves" },
  { test: /\bhip thrust\b|\bglute bridge\b|\bglute kickback\b|\bback extension\b|\bhyperextension\b|\breverse hyper/i, pattern: "Hip Extension", muscle: "Glutes" },
  { test: /\babduct/i, pattern: "Hip Abduction", muscle: "Abductors" },
  { test: /\badduct/i, pattern: "Hip Adduction", muscle: "Adductors" },
  { test: /\bdeadlift\b|\brdl\b|\bromanian\b|\bgood morning\b|\bhinge\b|\bswing\b|\bpull[- ]?through\b/i, pattern: "Hip Hinge", muscle: "Hamstrings" },
  { test: /\bsplit squat\b|\blunge\b|\bbulgarian\b|\bcurtsy\b/i, pattern: "Lunge", muscle: "Quadriceps" },
  { test: /\bstep[- ]?(up|down)\b|\bbox jump\b/i, pattern: "Step", muscle: "Quadriceps" },
  { test: /\bsquat\b|\bleg press\b|\bhack\b|\bpendulum\b|\bbelt squat\b|\bpistol\b/i, pattern: "Squat", muscle: "Quadriceps" },
  { test: /\bshrug\b/i, pattern: "Scapular Elevation", muscle: "Traps" },
  { test: /\bcarry\b|\bfarmer/i, pattern: "Carry", muscle: "Core" },
  { test: /\bplank\b|\bpallof\b|\bdead bug\b|\bbird dog\b|\bhollow\b|\banti[- ]/i, pattern: "Core Stability", muscle: "Core" },
  { test: /\bcrunch\b|\bsit[- ]?up\b|\bleg raise\b|\bknee raise\b|\bab wheel\b|\brollout\b|\bv[- ]?up\b/i, pattern: "Core Flexion", muscle: "Core" },
  { test: /\btwist\b|\bwood\s?chop\b|\brotation\b|\boblique\b/i, pattern: "Core Rotation", muscle: "Obliques" },
  { test: /\bsuperman\b|\bbird dog\b/i, pattern: "Core Extension", muscle: "Lower Back" },
  { test: /\bpulldown\b|\bpull[- ]?down\b|\bpull[- ]?up\b|\bchin[- ]?up\b|\bpullover\b/i, pattern: "Vertical Pull", muscle: "Lats" },
  { test: /\brow\b|\bface pull\b|\brear delt\b|\breverse fly\b|\breverse flye\b|\bpull apart\b/i, pattern: "Horizontal Pull", muscle: "Lats" },
  { test: /\b(hammer|bicep|biceps|preacher|concentration|spider|bayesian|cable|dumbbell|barbell|ez)?\s*curl\b/i, pattern: "Elbow Flexion", muscle: "Biceps" },
  { test: /\bpushdown\b|\bpress[- ]?down\b|\bskull\s?crusher\b|\btricep\b|\btriceps\b|\bkickback\b|\boverhead extension\b|\bjm press\b|\bdip\b/i, pattern: "Elbow Extension", muscle: "Triceps" },
  { test: /\blateral raise\b|\bfront raise\b|\bside raise\b|\by raise\b|\bupright row\b/i, pattern: "Shoulder Isolation", muscle: "Shoulders" },
  { test: /\boverhead press\b|\bshoulder press\b|\bmilitary\b|\bohp\b|\bpush press\b|\barnold\b|\blandmine press\b|\bhandstand\b|\bpike push/i, pattern: "Vertical Push", muscle: "Shoulders" },
  { test: /\bbench\b|\bchest press\b|\bpush[- ]?up\b|\bfly\b|\bflye\b|\bflys\b|\bflyes\b|\bpec deck\b|\bcrossover\b|\bfloor press\b|\bpress\b/i, pattern: "Horizontal Push", muscle: "Chest" },
  { test: /\bclean\b|\bsnatch\b|\bjerk\b|\bslam\b|\bthrow\b|\bjump\b|\bsled\b/i, pattern: "Power", muscle: "Full Body" },
  { test: /\brun\b|\brow(ing|er)\b|\bbike\b|\bcycle\b|\bski\b|\bwalk\b|\bstair\b|\btreadmill\b|\bjump rope\b|\bburpee\b/i, pattern: "Cardio", muscle: null },
  { test: /\bstretch\b|\bmobility\b|\bfoam roll/i, pattern: "Stretch", muscle: null },
];

/** Default primary muscle per pattern when the movement text gives no better hint. */
export const PATTERN_MUSCLE: Record<string, string> = {
  "Horizontal Push": "Chest",
  "Vertical Push": "Shoulders",
  "Shoulder Isolation": "Shoulders",
  "Elbow Extension": "Triceps",
  "Horizontal Pull": "Lats",
  "Vertical Pull": "Lats",
  "Elbow Flexion": "Biceps",
  "Scapular Elevation": "Traps",
  Squat: "Quadriceps",
  Lunge: "Quadriceps",
  Step: "Quadriceps",
  "Hip Hinge": "Hamstrings",
  "Hip Extension": "Glutes",
  "Hip Abduction": "Abductors",
  "Hip Adduction": "Adductors",
  "Knee Extension": "Quadriceps",
  "Knee Flexion": "Hamstrings",
  "Plantar Flexion": "Calves",
  "Core Stability": "Core",
  "Core Flexion": "Core",
  "Core Extension": "Lower Back",
  "Core Rotation": "Obliques",
  Carry: "Core",
  Power: "Full Body",
};

export function inferCategory(movement: string): { movementPattern: string; primaryMuscle: string | null } | null {
  const text = movement.trim();
  if (!text) return null;
  for (const rule of INFER_RULES) {
    if (rule.test.test(text)) return { movementPattern: rule.pattern, primaryMuscle: rule.muscle };
  }
  return null;
}
