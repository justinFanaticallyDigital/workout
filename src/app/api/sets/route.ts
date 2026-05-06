import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const body = await request.json();

  if (!body.workoutExerciseId) {
    return NextResponse.json({ error: "workoutExerciseId is required" }, { status: 400 });
  }

  try {
    // Verify ownership through workout → user chain
    const workoutExercise = await prisma.workoutExercise.findUnique({
      where: { id: body.workoutExerciseId },
      select: { exerciseId: true, workout: { select: { userId: true } } },
    });

    if (!workoutExercise || workoutExercise.workout.userId !== userId) {
      return NextResponse.json({ error: "Workout exercise not found" }, { status: 404 });
    }

    // Get the next set number
    const last = await prisma.set.findFirst({
      where: { workoutExerciseId: body.workoutExerciseId },
      orderBy: { setNumber: "desc" },
      select: { setNumber: true },
    });
    const setNumber = (last?.setNumber ?? 0) + 1;

    // Check if this is a PR (weight PR)
    let isPr = false;
    const exerciseId = workoutExercise.exerciseId;

    if (body.weight && body.reps && !body.isWarmup) {
      const currentPr = await prisma.exercisePr.findFirst({
        where: {
          userId,
          exerciseId,
          prType: "weight",
        },
        orderBy: { value: "desc" },
      });

      if (!currentPr || Number(body.weight) > Number(currentPr.value)) {
        isPr = true;
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
    if (isPr) {
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
  } catch (err) {
    console.error("[POST /api/sets] failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to log set", detail: message },
      { status: 500 },
    );
  }
}
