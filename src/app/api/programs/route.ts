import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await requireAuthUserId();

  const programs = await prisma.program.findMany({
    where: { userId },
    include: {
      blocks: {
        select: { id: true, name: true, blockNumber: true, durationWeeks: true, status: true },
        orderBy: { blockNumber: "asc" },
      },
      goal: { select: { id: true, title: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ programs });
}

export async function POST(request: NextRequest) {
  const userId = await requireAuthUserId();
  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const program = await prisma.program.create({
    data: {
      userId,
      name: body.name,
      description: body.description ?? null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      durationWeeks: body.durationWeeks ?? null,
      status: body.status ?? "active",
    },
  });

  return NextResponse.json(program, { status: 201 });
}
