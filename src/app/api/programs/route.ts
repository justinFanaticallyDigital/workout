import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const programs = await prisma.program.findMany({
    where: {
      userId,
      ...(status ? { status: status as "active" | "completed" | "paused" } : {}),
    },
    include: {
      blocks: {
        select: { id: true, name: true, blockNumber: true, durationWeeks: true, status: true },
        orderBy: { blockNumber: "asc" },
      },
      goal: { select: { id: true, title: true, type: true } },
      goals: { select: { id: true, title: true, priority: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ programs });
}

export async function POST(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // If creating as active, pause any currently active program
  const newStatus = body.status ?? "active";
  if (newStatus === "active") {
    await prisma.program.updateMany({
      where: { userId, status: "active" },
      data: { status: "paused" },
    });
  }

  const program = await prisma.program.create({
    data: {
      userId,
      name: body.name,
      description: body.description ?? null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      durationWeeks: body.durationWeeks ?? null,
      status: newStatus,
    },
  });

  return NextResponse.json(program, { status: 201 });
}
