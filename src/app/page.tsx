import Link from "next/link";
import Card from "@/components/ui/Card";
import Stat from "@/components/ui/Stat";
import Tag from "@/components/ui/Tag";
import ProgressBar from "@/components/ui/ProgressBar";
import SectionHeader from "@/components/ui/SectionHeader";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const dynamic = "force-dynamic";

export default async function Home() {
  const userId = await getAuthUserId();

  if (!userId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-mono font-bold text-ft-white tracking-wide">
            Dashboard
          </h1>
          <p className="text-ft-dim text-sm font-mono mt-1">
            Sign in to see your training data
          </p>
        </div>
        <Link
          href="/signin"
          className="inline-block bg-ft-white text-ft-bg font-mono text-sm font-bold px-6 py-3 rounded-lg hover:bg-ft-light transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Fetch data in parallel
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    currentProgram,
    recentWorkouts,
    allWorkoutDates,
    recentPRs,
    latestBodyWeight,
  ] = await Promise.all([
    prisma.program.findFirst({
      where: { userId, status: "active" },
      include: {
        blocks: {
          where: { status: "active" },
          select: { name: true, blockNumber: true, durationWeeks: true },
          orderBy: { blockNumber: "asc" },
          take: 1,
        },
      },
    }),
    prisma.workout.findMany({
      where: { userId, date: { gte: weekAgo } },
      include: {
        exercises: {
          include: { sets: true, exercise: { select: { name: true, primaryMuscle: true } } },
        },
        blockDay: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    }),
    prisma.workout.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: "desc" },
    }),
    prisma.exercisePr.findMany({
      where: { userId },
      include: { exercise: { select: { name: true } } },
      orderBy: { achievedAt: "desc" },
      take: 5,
    }),
    prisma.bodyMetric.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
      select: { weight: true },
    }),
  ]);

  // Fetch benchmarks for active program (if any)
  const programBenchmarks = currentProgram
    ? await prisma.programBenchmark.findMany({
        where: { programId: currentProgram.id },
        include: { block: { select: { name: true, blockNumber: true } } },
        orderBy: { targetDate: "asc" },
        take: 4,
      })
    : [];

  // Calculate weekly volume
  let weeklyVolume = 0;
  const muscleVolumeMap: Record<string, number> = {};
  for (const w of recentWorkouts) {
    for (const ex of w.exercises) {
      let exVolume = 0;
      for (const s of ex.sets) {
        if (s.weight && s.reps && !s.isWarmup) {
          exVolume += Number(s.weight) * s.reps;
        }
      }
      weeklyVolume += exVolume;
      const muscle = ex.exercise.primaryMuscle || "Other";
      muscleVolumeMap[muscle] = (muscleVolumeMap[muscle] || 0) + exVolume;
    }
  }

  // Calculate streak
  let streak = 0;
  if (allWorkoutDates.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const workoutDateSet = new Set(
      allWorkoutDates.map((w) => w.date.toISOString().split("T")[0])
    );
    const checkDate = new Date(today);
    if (!workoutDateSet.has(checkDate.toISOString().split("T")[0])) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (workoutDateSet.has(checkDate.toISOString().split("T")[0])) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Build week view (Mon-Sun of current week)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const workoutDateSet = new Set(
    recentWorkouts.map((w) => w.date.toISOString().split("T")[0])
  );

  const weekDays = DAY_LABELS.map((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      day,
      completed: workoutDateSet.has(d.toISOString().split("T")[0]),
    };
  });

  const sessionsThisWeek = weekDays.filter((d) => d.completed).length;

  // Muscle volume for display (top 6)
  const muscleVolume = Object.entries(muscleVolumeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([group, vol]) => ({
      group,
      volume: vol.toLocaleString(),
      raw: vol,
    }));
  const maxMuscleVol = Math.max(...muscleVolume.map((m) => m.raw), 1);

  const activeBlock = currentProgram?.blocks[0];
  const bodyWeight = latestBodyWeight?.weight
    ? Number(latestBodyWeight.weight)
    : null;

  // Next workout hint
  const lastWorkout = recentWorkouts[0];
  const nextDayName = lastWorkout?.blockDay?.name || "Workout";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-mono font-bold text-ft-white tracking-wide">
          Dashboard
        </h1>
        <p className="text-ft-dim text-sm font-mono mt-1">
          {activeBlock
            ? `${activeBlock.name} · Block ${activeBlock.blockNumber}`
            : currentProgram
            ? currentProgram.name
            : "No active program"}
        </p>
      </div>

      {/* Onboarding banner for new users */}
      {!currentProgram && allWorkoutDates.length === 0 && (
        <Card className="border-ft-accent/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-ft-white font-mono font-bold text-base mb-1">
                Welcome to FitTrack
              </h2>
              <p className="text-ft-dim text-sm font-mono">
                Get started by creating a training program or jumping straight into a workout.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/programs/new"
                className="bg-ft-accent text-ft-bg font-mono text-sm font-bold px-4 py-2 rounded hover:opacity-90 transition-colors whitespace-nowrap"
              >
                Create Program
              </Link>
              <Link
                href="/log"
                className="border border-ft-border text-ft-light font-mono text-sm px-4 py-2 rounded hover:border-ft-dim transition-colors whitespace-nowrap"
              >
                Quick Workout
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <Stat label="This Week" value={`${sessionsThisWeek}`} sub="sessions" />
        </Card>
        <Card>
          <Stat
            label="Week Volume"
            value={weeklyVolume > 0 ? weeklyVolume.toLocaleString() : "—"}
            sub="lbs"
          />
        </Card>
        <Card>
          <Stat
            label="Streak"
            value={streak > 0 ? `${streak}d` : "—"}
            sub="consecutive"
          />
        </Card>
        <Card>
          <Stat
            label="Body Weight"
            value={bodyWeight ? `${bodyWeight}` : "—"}
            sub="lbs"
          />
        </Card>
      </div>

      {/* Week View + Quick Log */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Week View */}
        <Card className="col-span-2">
          <SectionHeader title="Week View" />
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map(({ day, completed }) => (
              <div
                key={day}
                className={`flex flex-col items-center gap-2 py-3 rounded-md border ${
                  completed
                    ? "border-ft-light bg-ft-card"
                    : "border-ft-border bg-ft-surface"
                }`}
              >
                <span className="text-ft-dim text-[10px] font-mono uppercase">
                  {day}
                </span>
                <span
                  className={`text-lg ${
                    completed ? "text-ft-white" : "text-ft-muted"
                  }`}
                >
                  {completed ? "\u2713" : "\u2013"}
                </span>
              </div>
            ))}
          </div>
          <ProgressBar
            value={sessionsThisWeek}
            max={5}
            label="Sessions"
            showValues
          />
        </Card>

        {/* Quick Log */}
        <Link href="/log" className="block">
          <Card className="h-full flex flex-col items-center justify-center text-center hover:border-ft-dim transition-colors cursor-pointer">
            <span className="text-5xl text-ft-dim mb-3">+</span>
            <span className="text-ft-white font-mono font-bold text-lg">
              Log Workout
            </span>
            <span className="text-ft-dim text-xs font-mono mt-1">
              Next: {nextDayName}
            </span>
          </Card>
        </Link>
      </div>

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 && (
        <Card>
          <SectionHeader
            title="Recent Workouts"
            action={
              <Link
                href="/history"
                className="text-ft-dim text-xs font-mono hover:text-ft-light transition-colors"
              >
                View All &rarr;
              </Link>
            }
          />
          <div className="space-y-2">
            {recentWorkouts.slice(0, 5).map((w) => {
              const vol = w.exercises.reduce((sum, ex) => {
                return sum + ex.sets.reduce((s, set) => {
                  if (set.weight && set.reps && !set.isWarmup) {
                    return s + Number(set.weight) * set.reps;
                  }
                  return s;
                }, 0);
              }, 0);
              const setCount = w.exercises.reduce(
                (sum, ex) => sum + ex.sets.filter((s) => !s.isWarmup).length,
                0
              );
              return (
                <Link key={w.id} href={`/history/${w.id}`} className="block">
                  <div className="flex items-center justify-between py-2 border-b border-ft-border last:border-0 hover:bg-ft-surface/50 rounded px-2 -mx-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-ft-white text-sm font-mono font-bold">
                        {w.date.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {w.blockDay && (
                        <Tag>{w.blockDay.name}</Tag>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <span className="text-ft-dim text-xs font-mono">
                        {setCount} sets
                      </span>
                      <span className="text-ft-dim text-xs font-mono">
                        {vol > 0 ? `${vol.toLocaleString()} lbs` : "—"}
                      </span>
                      <span className="text-ft-muted text-sm">&rarr;</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent PRs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Recent PRs" />
          {recentPRs.length === 0 ? (
            <p className="text-ft-muted text-sm font-mono">No PRs recorded yet</p>
          ) : (
            <div className="space-y-3">
              {recentPRs.map((pr) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between py-2 border-b border-ft-border last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="text-ft-white text-sm font-mono font-bold">
                      {pr.exercise.name}
                    </span>
                    <span className="text-ft-dim text-xs font-mono">
                      {pr.achievedAt.toISOString().split("T")[0]}
                    </span>
                  </div>
                  <Tag variant="success">
                    {Number(pr.value)}&times;{pr.repsAtWeight ?? "—"}
                  </Tag>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Block Benchmarks */}
        <Card>
          <SectionHeader
            title="Block Benchmarks"
            action={
              currentProgram ? (
                <Link
                  href={`/programs/${currentProgram.id}`}
                  className="text-ft-dim text-xs font-mono hover:text-ft-light transition-colors"
                >
                  {currentProgram.name} &rarr;
                </Link>
              ) : undefined
            }
          />
          {programBenchmarks.length > 0 ? (
            <div className="space-y-3">
              {programBenchmarks.map((bm) => {
                const target = Number(bm.targetValue);
                const actual = bm.actualValue ? Number(bm.actualValue) : null;
                const pct = actual && target > 0 ? Math.min(100, (actual / target) * 100) : 0;
                return (
                  <div key={bm.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-ft-light text-sm font-mono">{bm.label}</span>
                      <span className="text-ft-dim text-xs font-mono">
                        {actual != null ? actual : "—"} / {target} {bm.targetUnit}
                      </span>
                    </div>
                    <ProgressBar value={pct} max={100} />
                    {bm.block && (
                      <span className="text-ft-muted text-[10px] font-mono">
                        {bm.block.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <ProgressBar
                value={sessionsThisWeek}
                max={5}
                label="Weekly Frequency"
                showValues
              />
              {currentProgram ? (
                <p className="text-ft-muted text-xs font-mono text-center">
                  Add benchmarks on your{" "}
                  <Link href={`/programs/${currentProgram.id}`} className="text-ft-dim hover:text-ft-light">
                    program page
                  </Link>
                </p>
              ) : (
                <p className="text-ft-muted text-sm font-mono">
                  No active program
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Weekly Volume by Muscle */}
      {muscleVolume.length > 0 && (
        <Card>
          <SectionHeader title="Weekly Volume by Muscle" />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {muscleVolume.map(({ group, volume, raw }) => (
              <div
                key={group}
                className="flex flex-col items-center gap-2 py-3 rounded-md bg-ft-card border border-ft-border"
                style={{ opacity: 0.3 + (raw / maxMuscleVol) * 0.7 }}
              >
                <span className="text-ft-dim text-[10px] font-mono uppercase tracking-wider">
                  {group}
                </span>
                <span className="text-ft-white font-mono font-bold text-sm">
                  {volume}
                </span>
                <span className="text-ft-dim text-[10px] font-mono">lbs</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
