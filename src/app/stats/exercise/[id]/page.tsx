import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { categoryFor } from "@/lib/categories";
import { fmtStamp } from "@/lib/dates";
import { num } from "@/lib/nutrition-math";
import { bestSet, fmtBestSet, isBodyweight, monthLabels, sessionE1rm, sessionVolume } from "@/lib/stats";
import { plural } from "@/lib/training";
import ExerciseHistoryView, { type HistoryData } from "./_components/ExerciseHistoryView";

export const dynamic = "force-dynamic";

/** Exercise history — finished sessions only, newest first. */
export default async function ExerciseHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");
  const { id } = await params;

  const [exercise, rows] = await Promise.all([
    prisma.exercise.findUnique({ where: { id }, select: { id: true, name: true, movementPattern: true, primaryMuscle: true, equipment: true } }),
    prisma.workoutExercise.findMany({
      where: { exerciseId: id, workout: { userId, endTime: { not: null } } },
      include: { workout: { select: { id: true, date: true } }, sets: { where: { isWarmup: false }, orderBy: { setNumber: "asc" }, select: { weight: true, reps: true, isPr: true } } },
      orderBy: { workout: { date: "desc" } },
      take: 60,
    }),
  ]);
  if (!exercise) notFound();

  const bw = isBodyweight(exercise.equipment, exercise.name);
  const sessions = rows
    .map((r) => {
      const sets = r.sets.map((s) => ({ weight: s.weight == null ? null : num(s.weight), reps: s.reps, isPr: s.isPr }));
      return { id: r.id, date: r.workout.date, count: sets.length, reps: sets.reduce((a, s) => a + (s.reps ?? 0), 0), volume: sessionVolume(sets), e1rm: sessionE1rm(sets), best: bestSet(sets), pr: sets.some((s) => s.isPr) };
    })
    .filter((s) => s.count > 0);

  const asc = [...sessions].reverse();
  const recent = asc.slice(-12);
  const loaded = recent.some((s) => s.e1rm > 0);
  const allTimeBest = bestSet(sessions.map((s) => s.best).filter((b): b is NonNullable<typeof b> => b !== null));
  const cat = categoryFor(exercise.movementPattern, exercise.primaryMuscle);

  const data: HistoryData = {
    name: exercise.name,
    sub: `${cat.label}${exercise.equipment ? ` · ${exercise.equipment}` : ""} · ${plural(sessions.length, "session")} logged`,
    best: allTimeBest ? fmtBestSet(allTimeBest.weight, allTimeBest.reps, bw) : null,
    loaded,
    trendPts: recent.map((s) => (loaded ? s.e1rm : s.best?.reps ?? 0)),
    trendLabels: monthLabels(recent.map((s) => s.date)),
    volPts: asc.slice(-10).map((s) => (loaded ? s.volume : s.reps)),
    sessions: sessions.map((s) => ({ id: s.id, stamp: fmtStamp(s.date), sets: s.count, reps: s.reps, best: s.best ? fmtBestSet(s.best.weight, s.best.reps, bw) : "—", pr: s.pr })),
  };
  return <ExerciseHistoryView data={data} />;
}
