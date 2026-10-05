import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { DAY_EXERCISE_SELECT, mapPlan } from "@/lib/training";
import { startOfIsoWeek } from "@/lib/dates";
import TrainingView from "./_components/TrainingView";

export const dynamic = "force-dynamic";

/**
 * Training tab — one section per active plan (day-card strip, Start on the
 * card), the Frames row, + New plan, and Show archived. Plans are sequences:
 * nothing here is bound to today's date except the header stamp.
 */
export default async function TrainingPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");

  const [programs, frames, weekWorkouts] = await Promise.all([
    prisma.program.findMany({
      where: { userId },
      include: {
        blocks: {
          orderBy: { blockNumber: "asc" },
          include: { days: { orderBy: { sortOrder: "asc" }, include: { exercises: { orderBy: { sortOrder: "asc" }, select: DAY_EXERCISE_SELECT } } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.workoutFrame.findMany({
      where: { userId },
      select: { id: true, name: true, focus: true, _count: { select: { exercises: true, workouts: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.workout.findMany({
      where: { userId, blockDayId: { not: null }, endTime: { not: null }, date: { gte: startOfIsoWeek() } },
      select: { blockDayId: true, date: true },
      orderBy: { date: "desc" },
    }),
  ]);

  const completedByDay: Record<string, string> = {};
  for (const w of weekWorkouts) {
    if (w.blockDayId && !completedByDay[w.blockDayId]) completedByDay[w.blockDayId] = w.date.toISOString();
  }

  return (
    <TrainingView
      plans={programs.map(mapPlan)}
      frames={frames.map((f) => ({ id: f.id, name: f.name, focus: f.focus, exerciseCount: f._count.exercises, used: f._count.workouts }))}
      completedByDay={completedByDay}
    />
  );
}
