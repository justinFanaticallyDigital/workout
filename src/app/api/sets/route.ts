import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUserId } from "@/lib/demo-user";

export async function POST(request: NextRequest) {
  const userId = await getDemoUserId();
  const body = await request.json();

  // Get the next set number
  const last = await prisma.set.findFirst({
    where: { workoutExerciseId: body.workoutExerciseId },
    orderBy: { setNumber: "desc" },
    select: { setNumber: true },
  });
  const setNumber = (last?.setNumber ?? 0) + 1;

  // Check if this is a PR (weight PR)
  let isPr = false;
  let exerciseId: string | null = null;

  if (body.weight && body.reps && !body.isWarmup) {
    const workoutExercise = await prisma.workoutExercise.findUnique({
      where: { id: body.workoutExerciseId },
      select: { exerciseId: true },
    });

    if (workoutExercise) {
      exerciseId = workoutExercise.exerciseId;
      const currentPr = await prisma.exercisePr.findFirst({
        where: {
          userId,
          exerciseId: workoutExercise.exerciseId,
          prType: "weight",
        },
        orderBy: { value: "desc" },
      });

      if (!currentPr || Number(body.weight) > Number(currentPr.value)) {
        isPr = true;
      }
    }
  }

  const set = await prisma.set.create({
    data: {
      workoutExerciseId: body.workoutExerciseId,
      setNumber,
      weight: body.weight ?? null,
      reps: body.reps ?? null,
      rir: body.rir ?? null,
      rpe: body.rpe ?? null,
      isWarmup: body.isWarmup ?? false,
      isPr,
      notes: body.notes ?? null,
    },
  });

  // Record PR if applicable
  if (isPr && exerciseId) {
    await prisma.exercisePr.create({
      data: {
        userId,
        exerciseId,
        prType: "weight",
        value: body.weight,
        repsAtWeight: body.reps,
        setId: set.id,
      },
    });
  }

  return NextResponse.json({ ...set, isPr }, { status: 201 });
}
