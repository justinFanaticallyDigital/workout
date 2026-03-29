import Link from "next/link";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import ProgressBar from "@/components/ui/ProgressBar";
import Stat from "@/components/ui/Stat";
import StatusIcon from "@/components/ui/StatusIcon";
import Timeline from "@/components/ui/Timeline";
import EmptyState from "@/components/ui/EmptyState";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");

  const programs = await prisma.program.findMany({
    where: { userId },
    include: {
      blocks: {
        select: {
          id: true,
          name: true,
          blockNumber: true,
          durationWeeks: true,
          status: true,
          phase: true,
        },
        orderBy: { blockNumber: "asc" },
      },
      goal: { select: { id: true, title: true } },
      _count: { select: { blocks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Count workouts per program (via blocks)
  const activeProgram = programs.find((p) => p.status === "active");
  const pausedPrograms = programs.filter((p) => p.status === "paused");
  const completedPrograms = programs.filter((p) => p.status === "completed");

  // Get workout count for active program
  let activeWorkoutCount = 0;
  if (activeProgram) {
    const blockIds = activeProgram.blocks.map((b) => b.id);
    if (blockIds.length > 0) {
      activeWorkoutCount = await prisma.workout.count({
        where: { userId, blockId: { in: blockIds } },
      });
    }
  }

  // Calculate active program progress
  const totalWeeks = activeProgram?.durationWeeks ?? 0;
  let currentWeek = 0;
  if (activeProgram?.startDate && totalWeeks > 0) {
    const start = new Date(activeProgram.startDate);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    currentWeek = Math.min(
      Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)),
      totalWeeks
    );
  }
  const progressPct = totalWeeks > 0 ? Math.round((currentWeek / totalWeeks) * 100) : 0;

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-body text-3xl font-bold tracking-tight mb-1">
            Programs
          </h1>
          <p className="text-ft-dim font-body text-sm">
            Goal-driven training plans
          </p>
        </div>
        <Link
          href="/programs/new"
          className="bg-ft-white text-ft-bg font-body text-sm font-bold px-4 py-2 rounded hover:bg-ft-light transition-colors"
        >
          + New Program
        </Link>
      </div>

      {/* Active Program */}
      {activeProgram ? (
        <Link href={`/programs/${activeProgram.id}`}>
          <Card className="border-ft-white mb-10 border-l-4 border-l-ft-white">
            <div className="flex items-center gap-2 mb-3">
              <StatusIcon type="program" status="active" size="md" />
              <Tag className="bg-ft-white text-ft-bg">Active</Tag>
            </div>

            <h2 className="font-body text-xl font-bold mb-1">
              {activeProgram.name}
            </h2>
            {activeProgram.description && (
              <p className="text-ft-dim text-sm font-body mb-1">
                {activeProgram.description}
              </p>
            )}
            {activeProgram.durationWeeks && (
              <p className="text-ft-muted text-xs font-body mb-5">
                {activeProgram.durationWeeks} weeks
              </p>
            )}

            {/* Block Timeline */}
            {activeProgram.blocks.length > 0 && (
              <Timeline
                className="mb-4"
                segments={activeProgram.blocks.map((block) => ({
                  label: block.name,
                  width: block.durationWeeks ?? 1,
                  status: block.status as "active" | "completed" | "upcoming",
                  phase: block.phase,
                }))}
                currentPosition={progressPct}
              />
            )}

            {/* Progress */}
            {totalWeeks > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-ft-dim text-xs font-body">
                    Week {currentWeek} of {totalWeeks} &middot; {progressPct}%
                  </span>
                </div>
                <ProgressBar value={progressPct} max={100} />
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 pt-3 border-t border-ft-border">
              <Stat label="Sessions" value={activeWorkoutCount} small />
              <Stat label="Blocks" value={activeProgram.blocks.length} small />
              <Stat
                label="Duration"
                value={activeProgram.durationWeeks ? `${activeProgram.durationWeeks}wk` : "—"}
                small
              />
              <Stat label="Status" value="Active" small />
            </div>
          </Card>
        </Link>
      ) : (
        <Card className="mb-10 border-dashed">
          <EmptyState
            title="No active program"
            description="Create a program to organize your training into blocks, days, and exercises."
            actionLabel="Create Program"
            actionHref="/programs/new"
          />
        </Card>
      )}

      {/* Paused Programs */}
      {pausedPrograms.length > 0 && (
        <div className="mb-10">
          <h2 className="font-body text-lg font-bold text-ft-light mb-4">
            Paused Programs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pausedPrograms.map((program) => (
              <Link key={program.id} href={`/programs/${program.id}`}>
                <Card className="hover:border-ft-dim transition-colors border-l-4 border-l-ft-warn">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon type="program" status="paused" />
                    <Tag className="bg-ft-warn/20 text-ft-warn">Paused</Tag>
                  </div>
                  <h3 className="font-body text-base font-bold mb-1">
                    {program.name}
                  </h3>
                  {program.description && (
                    <p className="text-ft-dim text-sm font-body mb-3">
                      {program.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs font-body text-ft-muted">
                    {program.durationWeeks && (
                      <span>{program.durationWeeks} weeks</span>
                    )}
                    <span>&middot;</span>
                    <span>{program._count.blocks} blocks</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Past Programs */}
      {completedPrograms.length > 0 && (
        <div>
          <h2 className="font-body text-lg font-bold text-ft-light mb-4">
            Past Programs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedPrograms.map((program) => (
              <Link key={program.id} href={`/programs/${program.id}`}>
                <Card className="hover:border-ft-dim transition-colors border-l-4 border-l-ft-success">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon type="program" status="completed" />
                    <Tag>Completed</Tag>
                  </div>
                  <h3 className="font-body text-base font-bold mb-1">
                    {program.name}
                  </h3>
                  {program.description && (
                    <p className="text-ft-dim text-sm font-body mb-3">
                      {program.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs font-body text-ft-muted">
                    {program.durationWeeks && (
                      <span>{program.durationWeeks} weeks</span>
                    )}
                    <span>&middot;</span>
                    <span>{program._count.blocks} blocks</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
