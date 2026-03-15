import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: blockId } = await params;
  const body = await request.json();

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
