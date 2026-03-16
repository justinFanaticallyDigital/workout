import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";
import { detectStall } from "@/lib/progression";

/**
 * GET /api/exercises/[id]/progression-status
 * Returns progression status: stalled, progressing, or insufficient data.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuthUserId();
  const { id: exerciseId } = await params;

  // Get the top set (heaviest) from each of the last 5 sessions
  const workoutExercises = await prisma.workoutExercise.findMany({
    where: {
      exerciseId,
      workout: { userId },
    },
    include: {
      sets: {
        where: { isWarmup: false, weight: { not: null }, reps: { not: null } },
        orderBy: { weight: "desc" },
        take: 1,
      },
      workout: { select: { date: true } },
    },
    orderBy: { workout: { date: "desc" } },
    take: 5,
  });

  const sessions = workoutExercises
    .filter((we) => we.sets.length > 0)
    .map((we) => ({
      weight: Number(we.sets[0].weight),
      reps: we.sets[0].reps ?? 0,
      date: we.workout.date,
    }));

  if (sessions.length < 3) {
    return NextResponse.json({ status: "insufficient_data", sessions: sessions.length });
  }

  const stalled = detectStall(sessions);

  return NextResponse.json({
    status: stalled ? "stalled" : "progressing",
    sessions: sessions.length,
    recentSessions: sessions.slice(0, 3).map((s) => ({
      weight: s.weight,
      reps: s.reps,
      date: s.date,
    })),
  });
}
