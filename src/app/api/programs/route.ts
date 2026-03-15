import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUserId } from "@/lib/demo-user";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getDemoUserId();

  const programs = await prisma.program.findMany({
    where: { userId },
    include: {
      blocks: {
        select: { id: true, name: true, blockNumber: true, durationWeeks: true, status: true },
        orderBy: { blockNumber: "asc" },
      },
      goal: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ programs });
}

export async function POST(request: NextRequest) {
  const userId = await getDemoUserId();
  const body = await request.json();

  const program = await prisma.program.create({
    data: {
      userId,
      name: body.name,
      description: body.description ?? null,
      goalId: body.goalId ?? null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      durationWeeks: body.durationWeeks ?? null,
      status: body.status ?? "active",
    },
  });

  return NextResponse.json(program, { status: 201 });
}
