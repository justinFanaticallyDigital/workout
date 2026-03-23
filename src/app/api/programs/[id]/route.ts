import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  const body = await request.json();

  const program = await prisma.program.findUnique({
    where: { id, userId },
    select: { id: true },
  });
  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  // If setting to active, pause any currently active program first
  if (body.status === "active") {
    await prisma.program.updateMany({
      where: { userId, status: "active", id: { not: id } },
      data: { status: "paused" },
    });
  }

  const updated = await prisma.program.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.durationWeeks !== undefined && { durationWeeks: body.durationWeeks }),
    },
  });

  return NextResponse.json(updated);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;

  const program = await prisma.program.findUnique({
    where: { id, userId },
    include: {
      goal: true,
      goals: true,
      blocks: {
        include: {
          _count: { select: { workouts: true } },
          days: {
            include: {
              exercises: {
                include: {
                  exercise: { select: { name: true, equipment: true } },
                  altExercise: { select: { name: true, equipment: true } },
                },
                orderBy: { sortOrder: "asc" },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { blockNumber: "asc" },
      },
      benchmarks: true,
    },
  });

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  return NextResponse.json(program);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;

  const program = await prisma.program.findUnique({
    where: { id, userId },
    select: { id: true },
  });
  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  // Delete related data in order (benchmarks, block day exercises, block days, blocks, then program)
  await prisma.programBenchmark.deleteMany({ where: { programId: id } });
  const blocks = await prisma.block.findMany({ where: { programId: id }, select: { id: true } });
  const blockIds = blocks.map((b) => b.id);
  if (blockIds.length > 0) {
    const days = await prisma.blockDay.findMany({ where: { blockId: { in: blockIds } }, select: { id: true } });
    const dayIds = days.map((d) => d.id);
    if (dayIds.length > 0) {
      await prisma.blockDayExercise.deleteMany({ where: { blockDayId: { in: dayIds } } });
      await prisma.blockDay.deleteMany({ where: { id: { in: dayIds } } });
    }
    await prisma.block.deleteMany({ where: { id: { in: blockIds } } });
  }
  await prisma.program.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
