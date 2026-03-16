import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const userId = await requireAuthUserId();
  const body = await request.json();

  if (!body.title?.trim() || !body.type) {
    return NextResponse.json({ error: "title and type are required" }, { status: 400 });
  }

  // Create the goal first
  const goal = await prisma.goal.create({
    data: {
      userId,
      type: body.type,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      targetValue: body.targetValue ?? null,
      targetUnit: body.targetUnit ?? null,
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
      status: "active",
    },
  });

  // Auto-create a linked program if requested
  if (body.createProgram) {
    const durationWeeks = body.programWeeks ?? 12;
    const daysPerWeek = body.daysPerWeek ?? 4;

    const program = await prisma.program.create({
      data: {
        userId,
        goalId: goal.id,
        name: body.programName || body.title.trim(),
        description: `Goal: ${body.title.trim()}`,
        durationWeeks,
        startDate: new Date(),
        status: "active",
      },
    });

    // Auto-create skeleton blocks based on duration
    const blockCount = Math.max(1, Math.ceil(durationWeeks / 4));
    const weeksPerBlock = Math.floor(durationWeeks / blockCount);

    for (let i = 0; i < blockCount; i++) {
      await prisma.block.create({
        data: {
          programId: program.id,
          name: `Block ${i + 1}`,
          blockNumber: i + 1,
          durationWeeks: i === blockCount - 1 ? durationWeeks - weeksPerBlock * (blockCount - 1) : weeksPerBlock,
          scheduleDaysPerWeek: daysPerWeek,
          status: i === 0 ? "active" : "upcoming",
        },
      });
    }

    return NextResponse.json({ goal, program }, { status: 201 });
  }

  return NextResponse.json({ goal }, { status: 201 });
}
