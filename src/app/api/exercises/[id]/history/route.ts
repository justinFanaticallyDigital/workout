import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuthUserId();
  const { id } = await params;

  const workoutExercises = await prisma.workoutExercise.findMany({
    where: {
      exerciseId: id,
      workout: { userId },
    },
    include: {
      sets: { orderBy: { setNumber: "asc" } },
      workout: { select: { date: true } },
    },
    orderBy: { workout: { date: "desc" } },
  });

  const history = workoutExercises.map((we) => ({
    date: we.workout.date.toISOString().split("T")[0],
    sets: we.sets.map((s) => ({
      weight: s.weight ? Number(s.weight) : null,
      reps: s.reps,
      rpe: s.rpe ? Number(s.rpe) : null,
      rir: s.rir,
      isWarmup: s.isWarmup,
      isPr: s.isPr,
    })),
  }));

  return NextResponse.json({ exerciseId: id, history });
}
