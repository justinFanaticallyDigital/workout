import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id: programId } = await params;
  const body = await request.json();

  // Verify ownership
  const program = await prisma.program.findUnique({
    where: { id: programId, userId },
    select: { id: true },
  });
  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // Use provided blockNumber or auto-increment
  let blockNumber = body.blockNumber;
  if (!blockNumber) {
    const last = await prisma.block.findFirst({
      where: { programId },
      orderBy: { blockNumber: "desc" },
      select: { blockNumber: true },
    });
    blockNumber = (last?.blockNumber ?? 0) + 1;
  }

  const block = await prisma.block.create({
    data: {
      programId,
      name: body.name,
      description: body.description ?? null,
      blockNumber,
      phase: body.phase ?? null,
      durationWeeks: body.durationWeeks ?? null,
      scheduleDaysPerWeek: body.scheduleDaysPerWeek ?? null,
      focus: body.focus ?? null,
      status: body.status ?? "upcoming",
    },
  });

  return NextResponse.json(block, { status: 201 });
}
