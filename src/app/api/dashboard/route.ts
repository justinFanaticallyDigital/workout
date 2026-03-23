import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;

  // Current active program
  const currentProgram = await prisma.program.findFirst({
    where: { userId, status: "active" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, startDate: true, durationWeeks: true },
  });

  // Recent workouts (last 7 days for weekly volume)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const recentWorkouts = await prisma.workout.findMany({
    where: { userId, date: { gte: weekAgo } },
    include: {
      exercises: {
        include: {
          sets: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  // Calculate weekly volume (sum of weight × reps for all sets)
  let weeklyVolume = 0;
  for (const w of recentWorkouts) {
    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        if (s.weight && s.reps && !s.isWarmup) {
          weeklyVolume += Number(s.weight) * s.reps;
        }
      }
    }
  }

  // Workout streak (consecutive days with a workout, counting backwards)
  const allWorkouts = await prisma.workout.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: "desc" },
  });

  let streak = 0;
  if (allWorkouts.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const workoutDates = new Set(
      allWorkouts.map((w) => w.date.toISOString().split("T")[0])
    );
    const checkDate = new Date(today);
    // Allow today or yesterday as the start
    if (!workoutDates.has(checkDate.toISOString().split("T")[0])) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (workoutDates.has(checkDate.toISOString().split("T")[0])) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Most recent PR
  const recentPR = await prisma.exercisePr.findFirst({
    where: { userId },
    include: { exercise: { select: { name: true } } },
    orderBy: { achievedAt: "desc" },
  });

  return NextResponse.json({
    currentProgram,
    weeklyVolume,
    streak,
    recentWorkouts: recentWorkouts.length,
    recentPR: recentPR
      ? {
          exercise: recentPR.exercise.name,
          weight: Number(recentPR.value),
          reps: recentPR.repsAtWeight,
          date: recentPR.achievedAt.toISOString().split("T")[0],
        }
      : null,
  });
}
