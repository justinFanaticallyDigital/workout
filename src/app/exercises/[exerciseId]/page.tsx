import Link from "next/link";
import { Card, SectionHeader, Stat, Tag } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
  });

  if (!exercise) {
    return (
      <div className="min-h-screen bg-ft-bg p-6">
        <Link
          href="/exercises"
          className="text-ft-dim font-mono text-xs uppercase tracking-wider hover:text-ft-light transition-colors"
        >
          &larr; Exercises
        </Link>
        <p className="text-ft-light font-mono mt-8">Exercise not found.</p>
      </div>
    );
  }

  // Get PRs and session count for this exercise
  const userId = await getAuthUserId();

  const [prs, sessionCount] = await Promise.all([
    userId
      ? prisma.exercisePr.findMany({
          where: { userId, exerciseId },
          orderBy: { value: "desc" },
          take: 1,
        })
      : Promise.resolve([]),
    userId
      ? prisma.workoutExercise.count({
          where: {
            exerciseId,
            workout: { userId },
          },
        })
      : Promise.resolve(0),
  ]);

  const bestPR = prs[0] ?? null;
  const secondary = [exercise.secondaryMuscle1, exercise.secondaryMuscle2]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-ft-bg p-6">
      {/* Breadcrumb */}
      <Link
        href="/exercises"
        className="text-ft-dim font-mono text-xs uppercase tracking-wider hover:text-ft-light transition-colors"
      >
        &larr; Exercises
      </Link>

      {/* Exercise Header */}
      <div className="mt-4 mb-6">
        <h1 className="text-ft-white font-mono font-bold text-2xl uppercase tracking-wider">
          {exercise.name}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          {exercise.movementPattern && <Tag>{exercise.movementPattern}</Tag>}
          {exercise.primaryMuscle && (
            <span className="text-ft-dim font-mono text-xs">
              {exercise.primaryMuscle}
            </span>
          )}
          {secondary && (
            <>
              <span className="text-ft-muted font-mono text-xs">&middot;</span>
              <span className="text-ft-muted font-mono text-xs">
                {secondary}
              </span>
            </>
          )}
        </div>
      </div>

      {/* PR Section */}
      <div className="mb-8">
        <SectionHeader title="Personal Records" />
        <Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <Stat
              label="Best Set"
              value={
                bestPR
                  ? `${Number(bestPR.value)}${bestPR.repsAtWeight ? `×${bestPR.repsAtWeight}` : ""}`
                  : "—"
              }
              sub={
                bestPR
                  ? bestPR.achievedAt.toISOString().split("T")[0]
                  : undefined
              }
            />
            <Stat label="Est. 1RM" value="—" />
            <Stat label="Total Sessions" value={sessionCount} />
            <Stat
              label="Avg Frequency"
              value={
                sessionCount > 0
                  ? `${(sessionCount / 12).toFixed(1)}/mo`
                  : "—"
              }
            />
          </div>
        </Card>
      </div>

      {/* History Section */}
      <div className="mb-8">
        <SectionHeader title="Volume Over Time" />
        <Card>
          <div className="h-48 flex items-center justify-center">
            <span className="text-ft-muted font-mono text-xs uppercase tracking-wider">
              {sessionCount > 0
                ? "Volume chart placeholder"
                : "Log workouts to see volume trends"}
            </span>
          </div>
        </Card>
      </div>

      <div>
        <SectionHeader title="Session History" />
        <Card>
          <div className="h-48 flex items-center justify-center">
            <span className="text-ft-muted font-mono text-xs uppercase tracking-wider">
              {sessionCount > 0
                ? "Session history table placeholder"
                : "No sessions logged yet"}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
