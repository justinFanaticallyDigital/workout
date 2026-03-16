import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

/**
 * POST /api/workouts/[id]/replay
 * Creates a new workout based on a previous one, copying exercises (not sets).
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuthUserId();
  const { id } = await params;

  // Fetch the original workout with exercises
  const original = await prisma.workout.findUnique({
    where: { id, userId },
    include: {
      exercises: {
        include: {
          exercise: { select: { id: true, name: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!original) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  // Create a new workout
  const newWorkout = await prisma.workout.create({
    data: {
      userId,
      date: new Date(),
      startTime: new Date(),
      blockId: original.blockId,
      blockDayId: original.blockDayId,
      notes: null,
    },
  });

  // Copy exercises (without sets)
  for (const ex of original.exercises) {
    await prisma.workoutExercise.create({
      data: {
        workoutId: newWorkout.id,
        exerciseId: ex.exerciseId,
        sortOrder: ex.sortOrder,
        notes: null,
      },
    });
  }

  return NextResponse.json({
    workoutId: newWorkout.id,
    exerciseCount: original.exercises.length,
  }, { status: 201 });
}
