
/** Shared by the /api/frames routes (route files may only export handlers). */
export const FRAME_INCLUDE = {
  exercises: {
    orderBy: { sortOrder: "asc" as const },
    include: { exercise: { select: { id: true, name: true, movementPattern: true, primaryMuscle: true, equipment: true } } },
  },
  _count: { select: { workouts: true } },
};

interface FrameExerciseInput {
  exerciseId: string;
  targetSets?: number | null;
  targetRepRange?: string | null;
  targetRpe?: string | null;
  notes?: string | null;
}

export function normalizeExercises(raw: unknown): FrameExerciseInput[] | null {
  if (!Array.isArray(raw)) return null;
  const out: FrameExerciseInput[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object" || typeof (r as FrameExerciseInput).exerciseId !== "string") return null;
    const e = r as FrameExerciseInput;
    out.push({
      exerciseId: e.exerciseId,
      targetSets: e.targetSets == null ? null : Number(e.targetSets),
      targetRepRange: e.targetRepRange ?? null,
      targetRpe: e.targetRpe ?? null,
      notes: e.notes ?? null,
    });
  }
  return out;
}
