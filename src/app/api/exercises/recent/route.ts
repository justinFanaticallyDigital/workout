import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/exercises/recent
 * Returns the user's most-used exercises (last 10 distinct exercises logged).
 */
export async function GET() {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;

  // Get the most recently used exercises
  const recentWorkoutExercises = await prisma.workoutExercise.findMany({
    where: { workout: { userId } },
    select: {
      exerciseId: true,
      exercise: {
        select: { id: true, name: true, primaryMuscle: true, movementPattern: true },
      },
    },
    orderBy: { workout: { date: "desc" } },
    take: 100, // fetch enough to get distinct
  });

  // Deduplicate and count
  const seen = new Map<string, { exercise: typeof recentWorkoutExercises[0]["exercise"]; count: number }>();
  for (const we of recentWorkoutExercises) {
    const existing = seen.get(we.exerciseId);
    if (existing) {
      existing.count++;
    } else {
      seen.set(we.exerciseId, { exercise: we.exercise, count: 1 });
    }
  }

  // Sort by count descending, take top 10
  const results = Array.from(seen.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((item) => ({
      ...item.exercise,
      sessionCount: item.count,
    }));

  return NextResponse.json({ exercises: results });
}
