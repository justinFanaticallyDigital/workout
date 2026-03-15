import Link from "next/link";
import { Card, SectionHeader, Tag } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LogWorkoutPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");

  // Find the active program's active block and its days
  const activeProgram = await prisma.program.findFirst({
    where: { userId, status: "active" },
    include: {
      blocks: {
        where: { status: "active" },
        orderBy: { blockNumber: "asc" },
        take: 1,
        include: {
          days: {
            include: {
              exercises: {
                include: {
                  exercise: { select: { name: true, primaryMuscle: true } },
                },
                orderBy: { sortOrder: "asc" },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  const activeBlock = activeProgram?.blocks[0];
  const dayTemplates = activeBlock?.days ?? [];

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-4 pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <h1 className="font-mono text-2xl font-bold text-ft-white mb-1">
        Log Workout
      </h1>
      <p className="text-ft-dim text-sm font-mono mb-6">
        {activeBlock
          ? `${activeBlock.name}${activeBlock.description ? ` · ${activeBlock.description}` : ""}`
          : "No active block"}
      </p>

      {/* Day Templates */}
      {dayTemplates.length > 0 ? (
        <>
          <SectionHeader
            title="Day Templates"
            subtitle={`${dayTemplates.length} days`}
          />
          <div className="flex flex-col gap-3 mb-8">
            {dayTemplates.map((tmpl) => {
              // Collect unique primary muscles for focus display
              const muscles = new Set<string>();
              for (const bde of tmpl.exercises) {
                if (bde.exercise.primaryMuscle) muscles.add(bde.exercise.primaryMuscle);
              }
              const focus = Array.from(muscles).slice(0, 3).join(", ");

              return (
                <Link key={tmpl.id} href={`/log/${tmpl.id}`}>
                  <Card className="hover:border-ft-light transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-ft-dim font-mono text-xs w-6 shrink-0">
                          D{tmpl.dayNumber}
                        </span>
                        <div>
                          <p className="text-ft-white font-mono text-sm font-bold">
                            Day {tmpl.dayNumber} &middot; {tmpl.name}
                          </p>
                          {focus && (
                            <p className="text-ft-dim text-xs mt-0.5">{focus}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Tag>{tmpl.exercises.length} exercises</Tag>
                        <span className="text-ft-muted text-lg">&rsaquo;</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <Card className="mb-8">
          <p className="text-ft-muted font-mono text-sm text-center py-4">
            No day templates found. Create a program with blocks and training days first.
          </p>
        </Card>
      )}

      {/* Blank Workout */}
      <SectionHeader title="Quick Start" />
      <Link href="/log/new-blank">
        <Card className="border-dashed hover:border-ft-light transition-colors">
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="text-ft-dim text-lg">+</span>
            <span className="text-ft-light font-mono text-sm">
              Start Blank Workout
            </span>
          </div>
        </Card>
      </Link>
    </div>
  );
}
