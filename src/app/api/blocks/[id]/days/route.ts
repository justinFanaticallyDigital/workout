import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuthUserId();
  const { id: blockId } = await params;
  const body = await request.json();

  // Verify ownership
  const block = await prisma.block.findUnique({
    where: { id: blockId, program: { userId } },
    select: { id: true },
  });
  if (!block) {
    return NextResponse.json({ error: "Block not found" }, { status: 404 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // Get the next sort order
  const last = await prisma.blockDay.findFirst({
    where: { blockId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const sortOrder = (last?.sortOrder ?? 0) + 1;

  const day = await prisma.blockDay.create({
    data: {
      blockId,
      dayNumber: body.dayNumber ?? sortOrder,
      name: body.name,
      dayType: body.dayType ?? "lifting",
      sortOrder,
    },
    include: {
      exercises: true,
    },
  });

  return NextResponse.json(day, { status: 201 });
}
