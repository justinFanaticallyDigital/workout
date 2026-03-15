import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const workoutExercises = await prisma.workoutExercise.findMany({
    where: { exerciseId: id },
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
