import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const [userId, errorRes] = await requireAuth();
  if (!userId) return errorRes!;

  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  // Core queries — these tables have always existed
  const [
    activeProgram,
    todaysWorkout,
    recentWorkouts,
    recentPR,
    latestBodyWeight,
    bodyWeights8w,
    weeklyWorkouts8w,
  ] = await Promise.all([
    prisma.program.findFirst({
      where: { userId, status: "active" },
      orderBy: { createdAt: "desc" },
      include: {
        blocks: {
          where: { status: "active" },
          orderBy: { blockNumber: "asc" },
          take: 1,
          include: {
            days: {
              orderBy: { sortOrder: "asc" },
              include: {
                exercises: {
                  orderBy: { sortOrder: "asc" },
                  include: {
                    exercise: { select: { name: true, movementPattern: true, primaryMuscle: true } },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.workout.findFirst({
      where: {
        userId,
        date: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
      },
      include: {
        exercises: {
          include: {
            sets: true,
            exercise: { select: { name: true, primaryMuscle: true, movementPattern: true } },
          },
        },
        blockDay: { select: { name: true, dayType: true } },
      },
    }),
    prisma.workout.findMany({
      where: { userId, date: { gte: weekAgo } },
      include: {
        exercises: {
          include: {
            sets: { where: { isWarmup: false } },
            exercise: { select: { name: true, primaryMuscle: true, secondaryMuscle1: true, secondaryMuscle2: true, movementPattern: true } },
          },
        },
        blockDay: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    }),
    prisma.exercisePr.findFirst({
      where: { userId },
      include: { exercise: { select: { name: true } } },
      orderBy: { achievedAt: "desc" },
    }),
    prisma.bodyMetric.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
      select: { weight: true, date: true },
    }),
    prisma.bodyMetric.findMany({
      where: { userId, date: { gte: eightWeeksAgo } },
      orderBy: { date: "asc" },
      select: { weight: true, date: true },
    }),
    prisma.workout.findMany({
      where: { userId, date: { gte: eightWeeksAgo } },
      include: {
        exercises: {
          include: { sets: { where: { isWarmup: false } } },
        },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  // New table queries — these may not exist in DB yet if user hasn't run db push
  // Wrap in try/catch so the rest of the endpoint still works
  type MetricTarget = { metricKey: string; targetValue: number; unit: string };
  type StretchRoutineResult = {
    id: string; name: string;
    items: { name: string; durationSeconds: number; bilateral: boolean }[];
  };

  let metricTargets: MetricTarget[] = [];
  let stretchRoutine: StretchRoutineResult | null = null;

  try {
    metricTargets = await prisma.userMetricTarget.findMany({ where: { userId } });
  } catch {
    // Table doesn't exist yet — that's fine
  }

  try {
    stretchRoutine = await prisma.stretchRoutine.findFirst({
      where: { userId },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
  } catch {
    // Table doesn't exist yet — that's fine
  }

  // Compute muscle heatmap from past 7 days
  const muscleSetCounts: Record<string, number> = {};
  for (const w of recentWorkouts) {
    for (const ex of w.exercises) {
      const setCount = ex.sets.length;
      const muscles = [
        ex.exercise.primaryMuscle,
        ex.exercise.secondaryMuscle1,
        ex.exercise.secondaryMuscle2,
      ].filter(Boolean) as string[];
      for (const m of muscles) {
        const key = m.toLowerCase();
        muscleSetCounts[key] = (muscleSetCounts[key] || 0) + (m === ex.exercise.primaryMuscle ? setCount : Math.ceil(setCount * 0.5));
      }
    }
  }

  // Compute weekly volume (8 weeks)
  const weeklyVolume: { week: string; volume: number }[] = [];
  const weekMap = new Map<string, number>();
  for (const w of weeklyWorkouts8w) {
    const weekStart = getWeekStart(w.date);
    const key = weekStart.toISOString().split("T")[0];
    let vol = weekMap.get(key) || 0;
    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        if (s.weight && s.reps) {
          vol += Number(s.weight) * s.reps;
        }
      }
    }
    weekMap.set(key, vol);
  }
  weekMap.forEach((volume, week) => {
    weeklyVolume.push({ week, volume });
  });

  // Get active block info
  const activeBlock = activeProgram?.blocks[0];

  // Determine today's scheduled day based on day-of-week mapping
  const dayOfWeek = (now.getDay() + 6) % 7; // 0=Mon
  const scheduledDay = activeBlock?.days[dayOfWeek % (activeBlock.days.length || 1)];

  // Goal pulse targets
  const goalPulse = metricTargets.map((t) => {
    let current: number | null = null;
    if (t.metricKey === "body_weight" && latestBodyWeight?.weight) {
      current = Number(latestBodyWeight.weight);
    }
    return {
      metricKey: t.metricKey,
      target: t.targetValue,
      unit: t.unit,
      current,
    };
  });

  return NextResponse.json({
    activeProgram: activeProgram
      ? {
          id: activeProgram.id,
          name: activeProgram.name,
          durationWeeks: activeProgram.durationWeeks,
          startDate: activeProgram.startDate,
        }
      : null,
    activeBlock: activeBlock
      ? {
          id: activeBlock.id,
          name: activeBlock.name,
          blockNumber: activeBlock.blockNumber,
          durationWeeks: activeBlock.durationWeeks,
          days: activeBlock.days.map((d) => ({
            id: d.id,
            name: d.name,
            dayNumber: d.dayNumber,
            dayType: d.dayType,
            exercises: d.exercises.map((e) => ({
              name: e.exercise.name,
              movementPattern: e.exercise.movementPattern,
              targetSets: e.targetSets,
              targetRepRange: e.targetRepRange,
            })),
          })),
        }
      : null,
    scheduledDay: scheduledDay
      ? {
          id: scheduledDay.id,
          name: scheduledDay.name,
          dayType: scheduledDay.dayType,
          exercises: scheduledDay.exercises.map((e) => ({
            name: e.exercise.name,
            movementPattern: e.exercise.movementPattern,
            targetSets: e.targetSets,
            targetRepRange: e.targetRepRange,
          })),
        }
      : null,
    todayCompleted: !!todaysWorkout,
    todaysWorkout: todaysWorkout
      ? {
          id: todaysWorkout.id,
          exercises: todaysWorkout.exercises.length,
          sets: todaysWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0),
        }
      : null,
    muscleHeatmap: muscleSetCounts,
    weeklyVolume,
    bodyWeights: bodyWeights8w.map((b) => ({
      date: b.date.toISOString().split("T")[0],
      weight: Number(b.weight),
    })),
    recentPR: recentPR
      ? {
          exercise: recentPR.exercise.name,
          value: Number(recentPR.value),
          reps: recentPR.repsAtWeight,
          date: recentPR.achievedAt.toISOString().split("T")[0],
          type: recentPR.prType,
        }
      : null,
    goalPulse,
    stretchRoutine: stretchRoutine
      ? {
          id: stretchRoutine.id,
          name: stretchRoutine.name,
          items: stretchRoutine.items.map((i) => ({
            name: i.name,
            durationSeconds: i.durationSeconds,
            bilateral: i.bilateral,
          })),
        }
      : null,
    currentWeight: latestBodyWeight?.weight ? Number(latestBodyWeight.weight) : null,
  });
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
