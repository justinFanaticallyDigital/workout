import Link from "next/link";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import ProgressBar from "@/components/ui/ProgressBar";
import Stat from "@/components/ui/Stat";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

const activeTagClass = "bg-ft-white text-ft-bg";

export const dynamic = "force-dynamic";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;

  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      goal: true,
      blocks: {
        orderBy: { blockNumber: "asc" },
        include: {
          _count: { select: { workouts: true } },
        },
      },
    },
  });

  if (!program) notFound();

  // Calculate progress
  const totalWeeks = program.durationWeeks ?? 0;
  let currentWeek = 0;
  if (program.startDate && totalWeeks > 0) {
    const start = new Date(program.startDate);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    currentWeek = Math.min(
      Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)),
      totalWeeks
    );
  }

  // Total sessions across all blocks
  const totalSessions = program.blocks.reduce(
    (sum, b) => sum + b._count.workouts,
    0
  );

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/programs"
        className="inline-flex items-center gap-1.5 text-ft-dim text-sm font-mono hover:text-ft-light transition-colors mb-6"
      >
        <span>&larr;</span>
        <span>Programs</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-mono text-2xl font-bold tracking-tight">
              {program.name}
            </h1>
            {program.status === "active" && (
              <Tag className={activeTagClass}>Active</Tag>
            )}
            {program.status === "completed" && <Tag>Completed</Tag>}
          </div>
          {program.description && (
            <p className="text-ft-dim text-sm font-mono mb-1">
              {program.description}
            </p>
          )}
          {program.durationWeeks && (
            <p className="text-ft-muted text-xs font-mono">
              {program.durationWeeks} weeks
            </p>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8">
        {totalWeeks > 0 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-ft-dim text-xs font-mono">
                Week {currentWeek} of {totalWeeks} &middot;{" "}
                {Math.round((currentWeek / totalWeeks) * 100)}%
              </span>
            </div>
            <ProgressBar value={currentWeek} max={totalWeeks} />
          </>
        )}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-ft-border">
          <Stat label="Sessions" value={totalSessions} small />
          <Stat label="Blocks" value={program.blocks.length} small />
          <Stat
            label="Duration"
            value={program.durationWeeks ? `${program.durationWeeks}wk` : "—"}
            small
          />
          <Stat
            label="Goal"
            value={program.goal?.title ?? "—"}
            small
          />
        </div>
      </Card>

      {/* Blocks List */}
      <h2 className="font-mono text-lg font-bold text-ft-light mb-4">
        Blocks
      </h2>
      {program.blocks.length === 0 ? (
        <Card className="border-dashed">
          <p className="text-ft-muted font-mono text-sm text-center py-4">
            No blocks created yet
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {program.blocks.map((block) => (
            <Link
              key={block.id}
              href={`/programs/${programId}/blocks/${block.id}`}
            >
              <Card
                className={`mb-1 ${
                  block.status === "active"
                    ? "border-ft-white"
                    : block.status === "completed"
                    ? "border-ft-muted"
                    : ""
                } hover:border-ft-dim transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        block.status === "completed"
                          ? "bg-ft-success"
                          : block.status === "active"
                          ? "bg-ft-white"
                          : "bg-ft-card"
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-sm font-bold">
                          {block.name}
                        </h3>
                        {block.description && (
                          <span className="text-ft-dim text-xs font-mono">
                            &middot; {block.description}
                          </span>
                        )}
                      </div>
                      {block.durationWeeks && (
                        <p className="text-ft-muted text-xs font-mono">
                          {block.durationWeeks} weeks
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {block.status === "active" && (
                      <Tag className={activeTagClass}>Current</Tag>
                    )}
                    {block.status === "completed" && <Tag>Done</Tag>}
                    {block.status === "upcoming" && (
                      <span className="text-ft-muted text-xs font-mono">
                        Upcoming
                      </span>
                    )}
                    {block._count.workouts > 0 && (
                      <div className="text-ft-dim text-xs font-mono">
                        {block._count.workouts} sessions
                      </div>
                    )}
                    <span className="text-ft-muted text-sm">&rarr;</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
