import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";
import { estimated1RM } from "@/lib/progression";

/**
 * GET /api/exercises/[id]/estimated-1rm
 * Returns the estimated 1RM based on the heaviest working set.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuthUserId();
  const { id: exerciseId } = await params;

  // Find the heaviest non-warmup set for this exercise
  const sets = await prisma.set.findMany({
    where: {
      workoutExercise: {
        exerciseId,
        workout: { userId },
      },
      isWarmup: false,
      weight: { not: null },
      reps: { not: null, gt: 0 },
    },
    select: {
      weight: true,
      reps: true,
      workoutExercise: {
        select: {
          workout: { select: { date: true } },
        },
      },
    },
    orderBy: { weight: "desc" },
    take: 50,
  });

  if (sets.length === 0) {
    return NextResponse.json({ estimated1RM: null, basedOn: null });
  }

  // Find the set that produces the highest estimated 1RM
  let best1RM = 0;
  let bestSet = sets[0];

  for (const s of sets) {
    const e1rm = estimated1RM(Number(s.weight), s.reps ?? 0);
    if (e1rm > best1RM) {
      best1RM = e1rm;
      bestSet = s;
    }
  }

  return NextResponse.json({
    estimated1RM: best1RM,
    basedOn: {
      weight: Number(bestSet.weight),
      reps: bestSet.reps,
      date: bestSet.workoutExercise.workout.date,
    },
  });
}
