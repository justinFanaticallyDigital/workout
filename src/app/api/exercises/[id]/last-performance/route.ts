import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id: exerciseId } = await params;

  // Find the most recent workout exercise for this exercise
  const lastSession = await prisma.workoutExercise.findFirst({
    where: {
      exerciseId,
      workout: { userId },
    },
    include: {
      sets: { orderBy: { setNumber: "asc" } },
      workout: { select: { date: true } },
    },
    orderBy: { workout: { date: "desc" } },
  });

  if (!lastSession) {
    return NextResponse.json({ lastPerformance: null });
  }

  const workSets = lastSession.sets
    .filter((s) => !s.isWarmup)
    .map((s) => ({
      weight: s.weight ? Number(s.weight) : null,
      reps: s.reps,
      rir: s.rir,
    }));

  return NextResponse.json({
    lastPerformance: {
      date: lastSession.workout.date.toISOString().split("T")[0],
      sets: workSets,
    },
  });
}
