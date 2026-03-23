import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id: blockDayId } = await params;
  const body = await request.json();

  // Verify ownership
  const blockDay = await prisma.blockDay.findUnique({
    where: { id: blockDayId, block: { program: { userId } } },
    select: { id: true },
  });
  if (!blockDay) {
    return NextResponse.json({ error: "Block day not found" }, { status: 404 });
  }

  // body.order: string[] of exercise IDs in new order
  const order: string[] = body.order;
  if (!Array.isArray(order)) {
    return NextResponse.json({ error: "order must be an array" }, { status: 400 });
  }

  // Verify all exercise IDs belong to this block day
  const exercises = await prisma.blockDayExercise.findMany({
    where: { blockDayId, id: { in: order } },
    select: { id: true },
  });
  if (exercises.length !== order.length) {
    return NextResponse.json({ error: "Invalid exercise IDs" }, { status: 400 });
  }

  await prisma.$transaction(
    order.map((id, idx) =>
      prisma.blockDayExercise.update({
        where: { id },
        data: { sortOrder: idx + 1 },
      })
    )
  );

  return NextResponse.json({ reordered: true });
}
