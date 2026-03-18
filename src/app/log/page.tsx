import Link from "next/link";
import { Card, SectionHeader, Tag } from "@/components/ui";
import StatusIcon from "@/components/ui/StatusIcon";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function daysSince(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (24 * 60 * 60 * 1000));
  if (diff === 0) return "Today";
  if (diff === 1) return "1d ago";
  return `${diff}d ago`;
}

export default async function LogWorkoutPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");

  // Find active program's active block
  const activeProgram = await prisma.program.findFirst({
    where: { userId, status: "active" },
    orderBy: { createdAt: "desc" },
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

  // Get draft/in-progress workouts
  const draftWorkout = await prisma.workout.findFirst({
    where: { userId, endTime: null },
    orderBy: { date: "desc" },
    select: { id: true, date: true, blockDay: { select: { name: true } } },
  });

  // Get last workout dates per day template
  const recentWorkouts = await prisma.workout.findMany({
    where: { userId, blockDayId: { not: null } },
    select: { blockDayId: true, date: true },
    orderBy: { date: "desc" },
  });
  const lastByDay: Record<string, string> = {};
  for (const w of recentWorkouts) {
    if (w.blockDayId && !lastByDay[w.blockDayId]) {
      lastByDay[w.blockDayId] = w.date.toISOString().split("T")[0];
    }
  }

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-4 pb-24 max-w-3xl mx-auto">
      {/* Header */}
      <h1 className="font-mono text-2xl font-bold text-ft-white mb-1">
        Log Workout
      </h1>
      <p className="text-ft-dim text-sm font-mono mb-6">
        {activeBlock
          ? `${activeProgram?.name} · ${activeBlock.name}`
          : "Choose a workout to start"}
      </p>

      {/* Section 1: Continue / Quick Start */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {draftWorkout && (
          <Link href={`/log/${draftWorkout.id}`}>
            <Card className="border-ft-warn hover:border-ft-light transition-colors h-full">
              <div className="flex items-center gap-3 py-2">
                <span className="text-ft-warn text-xl">▶</span>
                <div>
                  <p className="text-ft-white font-mono text-sm font-bold">Continue Workout</p>
                  <p className="text-ft-dim text-xs font-mono mt-0.5">
                    {draftWorkout.blockDay?.name ?? "In progress"}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        )}
        <Link href="/log/new-blank">
          <Card className="border-dashed hover:border-ft-light transition-colors h-full">
            <div className="flex items-center justify-center gap-2 py-3">
              <span className="text-ft-dim text-lg">+</span>
              <span className="text-ft-light font-mono text-sm">Blank Workout</span>
            </div>
          </Card>
        </Link>
      </div>

      {/* Section 2: From Your Program */}
      {dayTemplates.length > 0 && (
        <>
          <SectionHeader
            title="From Your Program"
            subtitle={`${activeBlock?.name} · ${dayTemplates.length} days`}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {dayTemplates.map((tmpl) => {
              const muscles = new Set<string>();
              for (const bde of tmpl.exercises) {
                if (bde.exercise.primaryMuscle) muscles.add(bde.exercise.primaryMuscle);
              }
              const lastDate = lastByDay[tmpl.id];

              return (
                <Link key={tmpl.id} href={`/log/${tmpl.id}`}>
                  <Card className="hover:border-ft-light transition-colors h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusIcon
                        type="day"
                        dayType={tmpl.dayType as "lifting" | "cardio" | "conditioning" | "mobility" | "rest"}
                        size="md"
                      />
                      <Tag>{tmpl.dayType}</Tag>
                    </div>
                    <h3 className="font-mono text-sm font-bold text-ft-white mb-1 uppercase">
                      {tmpl.name}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-ft-dim text-xs font-mono">
                        {tmpl.exercises.length} exercises
                      </p>
                      {lastDate && (
                        <p className="text-ft-muted text-[10px] font-mono">
                          Last: {daysSince(lastDate)}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Section 3: By Movement Pattern */}
      <SectionHeader title="By Movement Pattern" subtitle="Start with a focus" />
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {[
          { label: "Push", icon: "⬆", color: "text-ft-light" },
          { label: "Pull", icon: "⬇", color: "text-ft-light" },
          { label: "Legs", icon: "🦵", color: "text-ft-light" },
          { label: "Upper", icon: "💪", color: "text-ft-light" },
          { label: "Lower", icon: "🏋️", color: "text-ft-light" },
          { label: "Full Body", icon: "⚡", color: "text-ft-warn" },
          { label: "Cardio", icon: "♥", color: "text-ft-warn" },
        ].map((cat) => (
          <Link key={cat.label} href={`/log/new-blank?focus=${encodeURIComponent(cat.label.toLowerCase())}`}>
            <Card className="hover:border-ft-dim transition-colors text-center py-3">
              <span className={`text-lg ${cat.color}`}>{cat.icon}</span>
              <p className="text-ft-light text-xs font-mono font-bold mt-1">{cat.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
