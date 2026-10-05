import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { DAY_EXERCISE_SELECT } from "@/lib/training";
import DayDetail, { type DayDetailExercise } from "./_components/DayDetail";

export const dynamic = "force-dynamic";

/** Day detail — full exercise list with each exercise's last performance. */
export default async function DayDetailPage({ params }: { params: Promise<{ planId: string; dayId: string }> }) {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");
  const { planId, dayId } = await params;

  const day = await prisma.blockDay.findFirst({
    where: { id: dayId, block: { programId: planId, program: { userId } } },
    include: {
      block: { select: { id: true, name: true, program: { select: { id: true, name: true, blocks: { select: { id: true } } } }, days: { select: { id: true }, orderBy: { sortOrder: "asc" } } } },
      exercises: { orderBy: { sortOrder: "asc" }, select: DAY_EXERCISE_SELECT },
    },
  });
  if (!day) notFound();

  const exerciseIds = day.exercises.map((e) => e.exerciseId);
  const last = exerciseIds.length
    ? await prisma.workoutExercise.findMany({
        where: { exerciseId: { in: exerciseIds }, workout: { userId, endTime: { not: null } } },
        distinct: ["exerciseId"],
        orderBy: [{ workout: { date: "desc" } }, { id: "desc" }],
        select: { exerciseId: true, workout: { select: { date: true } }, sets: { where: { isWarmup: false }, orderBy: { setNumber: "asc" }, select: { weight: true, reps: true, isPr: true } } },
      })
    : [];
  const lastByExercise = new Map(last.map((l) => [l.exerciseId, l]));

  const exercises: DayDetailExercise[] = day.exercises.map((e) => {
    const l = lastByExercise.get(e.exerciseId);
    let lastLine: string | null = null;
    let pr = false;
    if (l && l.sets.length) {
      const best = l.sets.reduce((a, b) => (Number(b.weight ?? 0) > Number(a.weight ?? 0) || (Number(b.weight ?? 0) === Number(a.weight ?? 0) && (b.reps ?? 0) > (a.reps ?? 0)) ? b : a));
      const w = Number(best.weight ?? 0);
      lastLine = `${l.sets.length} × ${best.reps ?? "—"} @ ${w > 0 ? `${w % 1 === 0 ? w : w.toFixed(1)} lb` : "BW"}`;
      pr = l.sets.some((s) => s.isPr);
    }
    return {
      id: e.id,
      exerciseId: e.exerciseId,
      name: e.exercise.name,
      targetSets: e.targetSets,
      targetRepRange: e.targetRepRange,
      targetRpe: e.targetRpe,
      lastDate: l ? l.workout.date.toISOString() : null,
      lastLine,
      pr,
    };
  });

  const index = day.block.days.findIndex((d) => d.id === day.id) + 1;

  return (
    <DayDetail
      planId={planId}
      planName={day.block.program.name}
      blockName={day.block.program.blocks.length > 1 ? day.block.name : null}
      day={{ id: day.id, name: day.name, index }}
      exercises={exercises}
    />
  );
}
