import Link from "next/link";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import Stat from "@/components/ui/Stat";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BlockDetailPage({
  params,
}: {
  params: Promise<{ programId: string; blockId: string }>;
}) {
  const { programId, blockId } = await params;

  const block = await prisma.block.findUnique({
    where: { id: blockId },
    include: {
      program: { select: { name: true } },
      days: {
        include: {
          exercises: {
            include: {
              exercise: { select: { name: true, movementPattern: true } },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { workouts: true } },
    },
  });

  if (!block) notFound();

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href={`/programs/${programId}`}
        className="inline-flex items-center gap-1.5 text-ft-dim text-sm font-mono hover:text-ft-light transition-colors mb-6"
      >
        <span>&larr;</span>
        <span>Programs / {block.program.name}</span>
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-mono text-2xl font-bold tracking-tight mb-1">
          {block.name}
          {block.description ? ` · ${block.description}` : ""}
        </h1>
        <p className="text-ft-dim text-sm font-mono">
          {block.durationWeeks ? `${block.durationWeeks} weeks · ` : ""}
          {block.days.length} day split
          {block.focus ? ` · ${block.focus} focus` : ""}
        </p>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <Card>
          <Stat
            label="Weeks"
            value={block.durationWeeks ? `${block.durationWeeks}` : "—"}
            small
          />
        </Card>
        <Card>
          <Stat label="Sessions" value={block._count.workouts} small />
        </Card>
        <Card>
          <Stat label="Days/Week" value={block.scheduleDaysPerWeek ?? block.days.length} small />
        </Card>
        <Card>
          <Stat
            label="Status"
            value={block.status.charAt(0).toUpperCase() + block.status.slice(1)}
            small
          />
        </Card>
      </div>

      {/* Training Days */}
      <h2 className="font-mono text-lg font-bold text-ft-light mb-4">
        Training Days
      </h2>
      {block.days.length === 0 ? (
        <Card className="border-dashed">
          <p className="text-ft-muted font-mono text-sm text-center py-4">
            No training days created yet
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {block.days.map((day) => (
            <Link
              key={day.id}
              href={`/programs/${programId}/blocks/${blockId}/days/${day.id}`}
            >
              <Card className="hover:border-ft-dim transition-colors h-full">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-mono text-sm font-bold">
                    Day {day.dayNumber} &middot; {day.name}
                  </h3>
                  <Tag>{day.dayType}</Tag>
                </div>
                {day.exercises.length > 0 ? (
                  <ul className="space-y-1.5">
                    {day.exercises.map((bde) => (
                      <li
                        key={bde.id}
                        className="text-ft-dim text-xs font-mono flex items-center gap-2"
                      >
                        <span className="text-ft-muted">&middot;</span>
                        {bde.exercise.name}
                        {bde.targetSets && bde.targetRepRange && (
                          <span className="text-ft-muted">
                            {bde.targetSets}&times;{bde.targetRepRange}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-ft-muted text-xs font-mono">
                    No exercises assigned
                  </p>
                )}
                <div className="mt-3 pt-3 border-t border-ft-border">
                  <span className="text-ft-dim text-[10px] font-mono uppercase tracking-wider">
                    {day.exercises.length} exercises
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
