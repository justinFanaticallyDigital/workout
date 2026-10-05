import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import type { ProgramStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const programs = await prisma.program.findMany({
    where: {
      userId,
      ...(status ? { status: status as ProgramStatus } : {}),
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

  // Plans are independent sequences: creating one never pauses another.
  const newStatus = (body.status ?? "active") as ProgramStatus;

  const program = await prisma.program.create({
    data: {
      userId,
      name: body.name.trim(),
      description: body.description ?? null,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : null,
      durationWeeks: body.durationWeeks ?? null,
      status: newStatus,
      // Hand-built plans have exactly one block ("Days") the UI never shows.
      ...(body.createDefaultBlock !== false && {
        blocks: { create: { name: "Days", blockNumber: 1, status: "active" } },
      }),
    },
    include: { blocks: { select: { id: true, name: true, blockNumber: true } } },
  });

  return NextResponse.json(program, { status: 201 });
}
