import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { categoryFor, type CategoryGroup } from "@/lib/categories";
import { fmtMonthYear, fmtStamp } from "@/lib/dates";
import { num } from "@/lib/nutrition-math";
import { bucketIndex, dayKey, fmtPr, isBodyweight, monthBuckets } from "@/lib/stats";
import StatsView, { type StatsData } from "./_components/StatsView";

export const dynamic = "force-dynamic";

/** Group order on the split bar keeps push and pull apart (the two closest hues). */
const SPLIT_ORDER: CategoryGroup[] = ["push", "legs", "pull", "core", "other"];

/** Stats tab — this month's days trained and volume, 30-day body weight, recent PRs and photos. */
export default async function StatsPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");

  const now = new Date();
  const buckets = monthBuckets(now);
  const monthStart = buckets[0].start;
  const monthEnd = buckets[buckets.length - 1].end;
  const since30 = new Date(now.getTime() - 30 * 86_400_000);

  const [workouts, activities, weights, latestWeight, prs, photos] = await Promise.all([
    prisma.workout.findMany({
      where: { userId, endTime: { not: null }, date: { gte: monthStart, lt: monthEnd } },
      select: { date: true, exercises: { select: { exercise: { select: { movementPattern: true, primaryMuscle: true } }, sets: { where: { isWarmup: false }, select: { weight: true, reps: true } } } } },
    }),
    prisma.activityLog.findMany({ where: { userId, date: { gte: monthStart, lt: monthEnd } }, select: { date: true } }),
    prisma.bodyMetric.findMany({ where: { userId, weight: { not: null }, date: { gte: since30 } }, orderBy: { date: "asc" }, select: { date: true, weight: true, bodyFatPct: true } }),
    prisma.bodyMetric.findFirst({ where: { userId, weight: { not: null } }, orderBy: { date: "desc" }, select: { date: true, weight: true, bodyFatPct: true } }),
    prisma.exercisePr.findMany({ where: { userId }, orderBy: { achievedAt: "desc" }, take: 3, include: { exercise: { select: { id: true, name: true, equipment: true } }, set: { select: { weight: true, reps: true } } } }),
    prisma.progressPhoto.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 3, select: { id: true, date: true, imageUrl: true } }),
  ]);

  // Days trained: a day counts once, whether it held a workout or an activity.
  const trainedDays = new Set<string>();
  for (const w of workouts) trainedDays.add(dayKey(w.date));
  for (const a of activities) trainedDays.add(dayKey(a.date));
  const dayBars = buckets.map(() => 0);
  trainedDays.forEach((k) => {
    const i = bucketIndex(new Date(`${k}T00:00:00Z`), buckets);
    if (i >= 0) dayBars[i]++;
  });

  // Volume: weight × reps, excluding warm-ups, bucketed by week and split by category group.
  const volBars = buckets.map(() => 0);
  const byGroup: Partial<Record<CategoryGroup, number>> = {};
  let volTotal = 0;
  for (const w of workouts) {
    const i = bucketIndex(w.date, buckets);
    for (const we of w.exercises) {
      const g = categoryFor(we.exercise.movementPattern, we.exercise.primaryMuscle).group;
      for (const s of we.sets) {
        const v = num(s.weight) * (s.reps ?? 0);
        if (v <= 0) continue;
        volTotal += v;
        if (i >= 0) volBars[i] += v;
        byGroup[g] = (byGroup[g] ?? 0) + v;
      }
    }
  }
  const split = SPLIT_ORDER.filter((g) => (byGroup[g] ?? 0) > 0).map((g) => ({ g, pct: Math.round(((byGroup[g] ?? 0) / volTotal) * 100) }));

  // Body weight: latest reading, 30-day trend, change over the window.
  const headline = weights.length ? weights[weights.length - 1] : latestWeight;
  const weightPts = weights.map((w) => num(w.weight));

  const data: StatsData = {
    monthLabel: fmtMonthYear(now),
    monthAbbr: fmtMonthYear(now).slice(0, 3).toUpperCase(),
    bucketLabels: buckets.map((b) => b.label),
    trainedDays: trainedDays.size,
    dayBars,
    weight: headline
      ? {
          latest: num(headline.weight),
          pts: weightPts,
          delta: weightPts.length > 1 ? weightPts[weightPts.length - 1] - weightPts[0] : null,
          bf: headline.bodyFatPct != null ? num(headline.bodyFatPct) : null,
          entries: weights.length,
          lastStamp: fmtStamp(headline.date),
        }
      : null,
    volume: { total: volTotal, bars: volBars, split },
    prs: prs.map((pr) => ({
      id: pr.id,
      exerciseId: pr.exercise.id,
      name: pr.exercise.name,
      value: fmtPr({ prType: pr.prType, value: num(pr.value), repsAtWeight: pr.repsAtWeight, set: pr.set ? { weight: pr.set.weight == null ? null : num(pr.set.weight), reps: pr.set.reps } : null }, isBodyweight(pr.exercise.equipment, pr.exercise.name)),
      stamp: fmtStamp(pr.achievedAt),
    })),
    photos: photos.map((p) => ({ id: p.id, stamp: fmtStamp(p.date), src: p.imageUrl })),
  };

  return <StatsView data={data} />;
}
