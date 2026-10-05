import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

/**
 * POST /api/programs/[id]/duplicate  { name? }
 * Deep-copies one of the user's plans (blocks → days → exercises) as a new
 * active plan. Other plans are untouched.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const source = await prisma.program.findFirst({
    where: { id, userId },
    include: {
      blocks: {
        orderBy: { blockNumber: "asc" },
        include: { days: { orderBy: { sortOrder: "asc" }, include: { exercises: { orderBy: { sortOrder: "asc" } } } } },
      },
    },
  });
  if (!source) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : `${source.name} (copy)`;
  const program = await prisma.program.create({
    data: { userId, name, description: source.description, durationWeeks: source.durationWeeks, startDate: new Date(), status: "active" },
  });

  for (const b of source.blocks) {
    const block = await prisma.block.create({
      data: {
        programId: program.id,
        name: b.name,
        description: b.description,
        blockNumber: b.blockNumber,
        weekStart: b.weekStart,
        weekEnd: b.weekEnd,
        durationWeeks: b.durationWeeks,
        scheduleDaysPerWeek: b.scheduleDaysPerWeek,
        phase: b.phase,
        focus: b.focus,
        status: b.blockNumber === 1 ? "active" : "upcoming",
      },
    });
    for (const d of b.days) {
      const day = await prisma.blockDay.create({
        data: { blockId: block.id, name: d.name, dayNumber: d.dayNumber, dayOfWeek: d.dayOfWeek, dayType: d.dayType, sortOrder: d.sortOrder },
      });
      if (d.exercises.length) {
        await prisma.blockDayExercise.createMany({
          data: d.exercises.map((e) => ({
            blockDayId: day.id,
            exerciseId: e.exerciseId,
            altExerciseId: e.altExerciseId,
            sortOrder: e.sortOrder,
            targetSets: e.targetSets,
            targetRepRange: e.targetRepRange,
            targetRpe: e.targetRpe,
            targetRir: e.targetRir,
            progressionType: e.progressionType,
            progressionIncrement: e.progressionIncrement,
            notes: e.notes,
            variants: e.variants,
          })),
        });
      }
    }
  }

  return NextResponse.json({ programId: program.id, name: program.name }, { status: 201 });
}
