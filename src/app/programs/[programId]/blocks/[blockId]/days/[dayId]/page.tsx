import Link from "next/link";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DayTemplatePage({
  params,
}: {
  params: Promise<{ programId: string; blockId: string; dayId: string }>;
}) {
  const { programId, blockId, dayId } = await params;

  const day = await prisma.blockDay.findUnique({
    where: { id: dayId },
    include: {
      block: { select: { name: true, description: true } },
      exercises: {
        include: {
          exercise: { select: { name: true, movementPattern: true } },
          altExercise: { select: { name: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!day) notFound();

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href={`/programs/${programId}/blocks/${blockId}`}
        className="inline-flex items-center gap-1.5 text-ft-dim text-sm font-mono hover:text-ft-light transition-colors mb-6"
      >
        <span>&larr;</span>
        <span>
          {day.block.name}
          {day.block.description ? ` · ${day.block.description}` : ""}
        </span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight mb-1">
            Day {day.dayNumber} &middot; {day.name}
          </h1>
          <p className="text-ft-dim text-sm font-mono">
            Day template &middot; {day.exercises.length} exercises
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tag>{day.dayType}</Tag>
          <Link
            href="/log"
            className="bg-ft-white text-ft-bg font-mono text-sm font-bold px-4 py-2 rounded hover:bg-ft-light transition-colors"
          >
            Log Session &rarr;
          </Link>
        </div>
      </div>

      {/* Exercises */}
      {day.exercises.length === 0 ? (
        <Card className="border-dashed">
          <p className="text-ft-muted font-mono text-sm text-center py-4">
            No exercises assigned to this day
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {day.exercises.map((bde, idx) => (
            <Card key={bde.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-ft-muted text-xs font-mono font-bold mt-0.5 w-5">
                    {idx + 1}.
                  </span>
                  <div>
                    <h3 className="font-mono text-sm font-bold mb-1">
                      {bde.exercise.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs font-mono text-ft-dim">
                      {bde.targetSets && <span>{bde.targetSets} sets</span>}
                      {bde.targetRepRange && (
                        <>
                          <span className="text-ft-muted">&times;</span>
                          <span>{bde.targetRepRange} reps</span>
                        </>
                      )}
                      {bde.targetRpe && (
                        <>
                          <span className="text-ft-muted">&middot;</span>
                          <span>RPE {bde.targetRpe}</span>
                        </>
                      )}
                    </div>
                    {bde.altExercise && (
                      <p className="text-ft-muted text-xs font-mono mt-1">
                        Alt: {bde.altExercise.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {(bde.progressionType !== "none" || bde.notes) && (
                <div className="mt-3 pt-3 border-t border-ft-border ml-8">
                  {bde.progressionType !== "none" && (
                    <div className="flex items-center gap-2">
                      <span className="text-ft-muted text-[10px] font-mono uppercase tracking-wider">
                        Progression
                      </span>
                      <span className="text-ft-light text-xs font-mono">
                        {bde.progressionType}
                        {bde.progressionIncrement
                          ? ` (+${Number(bde.progressionIncrement)})`
                          : ""}
                      </span>
                    </div>
                  )}
                  {bde.notes && (
                    <p className="text-ft-dim text-xs font-mono mt-1">
                      {bde.notes}
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
