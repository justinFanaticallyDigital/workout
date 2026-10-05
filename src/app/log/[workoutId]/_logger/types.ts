/** Shared shapes for the lane-based logger. */

export interface SetData {
  set: number;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  done: boolean;
}

export interface LastSet {
  weight: number | null;
  reps: number | null;
  rir: number | null;
}

export interface Suggestion {
  weight: number;
  hint: string; // "+5" · "Same weight, try +1 rep"
  reps?: number;
  sets?: number;
}

export interface ProgressionInfo {
  estimated1RM: number | null;
  progressionStatus: "stalled" | "progressing" | "insufficient_data" | null;
  stalledSessions: number;
}

export const EMPTY_PROGRESSION: ProgressionInfo = { estimated1RM: null, progressionStatus: null, stalledSessions: 0 };

export interface ExerciseData {
  /** Row id — a BlockDayExercise id, or a client id for added / frame exercises. */
  id: string;
  exerciseId: string;
  name: string;
  movementPattern: string | null;
  primaryMuscle: string | null;
  targetSets: number;
  targetRepRange: string;
  /** Decimal in the DB; string here for the SetSheet's RPE hint. */
  targetRpe: string | null;
  progressionType: string;
  progressionIncrement: number | null;
  sets: SetData[];
  notes: string;
  lastSets: LastSet[];
  suggestedWeight: Suggestion | null;
  progressionInfo: ProgressionInfo;
}

export interface ActiveCell {
  exerciseIdx: number;
  setIdx: number;
}

/** The localStorage draft under `workout-draft-<workoutId>` (2s debounce, 24h TTL). */
export interface WorkoutDraft {
  exercises: ExerciseData[];
  workoutNotes?: string;
  savedAt: number;
  frameId?: string | null;
  frameName?: string | null;
}

export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export function draftKey(workoutId: string): string {
  return `workout-draft-${workoutId}`;
}

export function blankSets(n: number): SetData[] {
  return Array.from({ length: Math.max(1, n) }, (_, i) => ({ set: i + 1, weight: null, reps: null, rir: null, done: false }));
}

export function makeExercise(input: {
  id: string;
  exerciseId: string;
  name: string;
  movementPattern?: string | null;
  primaryMuscle?: string | null;
  targetSets?: number | null;
  targetRepRange?: string | null;
  targetRpe?: string | number | null;
  progressionType?: string | null;
  progressionIncrement?: number | null;
  notes?: string | null;
}): ExerciseData {
  const targetSets = input.targetSets ?? 3;
  return {
    id: input.id,
    exerciseId: input.exerciseId,
    name: input.name,
    movementPattern: input.movementPattern ?? null,
    primaryMuscle: input.primaryMuscle ?? null,
    targetSets,
    targetRepRange: input.targetRepRange ?? "8-12",
    targetRpe: input.targetRpe != null ? String(input.targetRpe) : null,
    progressionType: input.progressionType ?? "none",
    progressionIncrement: input.progressionIncrement ?? null,
    sets: blankSets(targetSets),
    notes: input.notes ?? "",
    lastSets: [],
    suggestedWeight: null,
    progressionInfo: EMPTY_PROGRESSION,
  };
}

/** Drafts written by the previous logger carried `category` instead of `movementPattern`. */
export function normalizeDraftExercise(raw: ExerciseData & { category?: string; shortName?: string }): ExerciseData {
  return {
    ...raw,
    movementPattern: raw.movementPattern ?? (raw.category && raw.category !== "—" ? raw.category : null),
    primaryMuscle: raw.primaryMuscle ?? null,
    progressionIncrement: raw.progressionIncrement ?? null,
    lastSets: raw.lastSets ?? [],
    suggestedWeight: raw.suggestedWeight ?? null,
    progressionInfo: raw.progressionInfo ?? EMPTY_PROGRESSION,
    notes: raw.notes ?? "",
    sets: (raw.sets ?? []).map((s, i) => ({ set: s.set ?? i + 1, weight: s.weight ?? null, reps: s.reps ?? null, rir: s.rir ?? null, done: !!s.done })),
  };
}
