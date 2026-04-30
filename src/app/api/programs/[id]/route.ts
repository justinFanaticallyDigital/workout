import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import type { ProgramStatus } from "@/generated/prisma/enums";
import { isValidGameplanKind } from "@/lib/program-templates";

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

  // R15 — Planning Mode's GameplanKindEditor PATCHes this field. Accept
  // null (clear the tag) or a string that maps onto the program-templates
  // registry; reject unknown slugs so a typo doesn't silently land.
  if (body.gameplanKind !== undefined && body.gameplanKind !== null) {
    if (typeof body.gameplanKind !== "string" || !isValidGameplanKind(body.gameplanKind)) {
      return NextResponse.json(
        { error: `Unknown gameplanKind: ${String(body.gameplanKind)}` },
        { status: 400 },
      );
    }
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
      ...(body.status !== undefined && { status: body.status as ProgramStatus }),
      ...(body.durationWeeks !== undefined && { durationWeeks: body.durationWeeks }),
      ...(body.gameplanKind !== undefined && { gameplanKind: body.gameplanKind }),
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
                  exercise: { select: { id: true, name: true, equipment: true, movementPattern: true } },
                  altExercise: { select: { id: true, name: true, equipment: true } },
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

  await prisma.program.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
