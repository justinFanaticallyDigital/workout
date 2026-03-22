import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (!userId) return errorRes!;

  const { searchParams } = new URL(req.url);
  const programId = searchParams.get("programId");
  const blockId = searchParams.get("blockId");
  const weekNumber = searchParams.get("weekNumber");

  const overrides = await prisma.scheduleOverride.findMany({
    where: {
      userId,
      ...(programId ? { programId } : {}),
      ...(blockId ? { blockId } : {}),
      ...(weekNumber ? { weekNumber: parseInt(weekNumber, 10) } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(overrides);
}

export async function POST(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (!userId) return errorRes!;

  const body = await req.json();

  const override = await prisma.scheduleOverride.create({
    data: {
      userId,
      programId: body.programId,
      blockId: body.blockId,
      scope: body.scope,
      weekNumber: body.weekNumber,
      dayOfWeek: body.dayOfWeek ?? null,
      action: body.action,
      payload: body.payload || {},
    },
  });

  return NextResponse.json(override, { status: 201 });
}
