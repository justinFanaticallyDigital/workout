import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuthUserId();
  const { id: programId } = await params;
  const body = await request.json();

  // Get the next block number
  const last = await prisma.block.findFirst({
    where: { programId },
    orderBy: { blockNumber: "desc" },
    select: { blockNumber: true },
  });
  const blockNumber = (last?.blockNumber ?? 0) + 1;

  const block = await prisma.block.create({
    data: {
      programId,
      name: body.name,
      description: body.description ?? null,
      blockNumber,
      durationWeeks: body.durationWeeks ?? null,
      scheduleDaysPerWeek: body.scheduleDaysPerWeek ?? null,
      focus: body.focus ?? null,
      status: body.status ?? "upcoming",
    },
  });

  return NextResponse.json(block, { status: 201 });
}
