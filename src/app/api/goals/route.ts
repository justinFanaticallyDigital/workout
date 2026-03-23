import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import type { GoalType, GoalStatus, ProgramStatus, BlockStatus } from "@/generated/prisma/enums";

export async function POST(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const body = await request.json();

  const validGoalTypes: GoalType[] = ["weight", "bodyweight", "strength", "powerlifting", "competition", "frequency", "bodycomp", "custom"];
  if (!body.title?.trim() || !body.type) {
    return NextResponse.json({ error: "title and type are required" }, { status: 400 });
  }
  if (!validGoalTypes.includes(body.type as GoalType)) {
    return NextResponse.json({ error: `Invalid goal type. Must be one of: ${validGoalTypes.join(", ")}` }, { status: 400 });
  }

  // Auto-create a linked program if requested
  if (body.createProgram) {
    const durationWeeks = body.programWeeks ?? 12;
    const daysPerWeek = body.daysPerWeek ?? 4;

    // Pause any currently active program
    await prisma.program.updateMany({
      where: { userId, status: "active" as ProgramStatus },
      data: { status: "paused" as ProgramStatus },
    });

    const program = await prisma.program.create({
      data: {
        userId,
        name: body.programName || body.title.trim(),
        description: `Goal: ${body.title.trim()}`,
        durationWeeks,
        startDate: new Date(),
        status: "active" as ProgramStatus,
      },
    });

    // Create goal linked to the program
    const goal = await prisma.goal.create({
      data: {
        userId,
        programId: program.id,
        type: body.type as GoalType,
        priority: body.priority ?? "primary",
        title: body.title.trim(),
        description: body.description?.trim() || null,
        metric: body.metric ?? null,
        startValue: body.startValue ?? null,
        targetValue: body.targetValue ?? null,
        targetUnit: body.targetUnit ?? null,
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
        status: "active" as GoalStatus,
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
          status: (i === 0 ? "active" : "upcoming") as BlockStatus,
        },
      });
    }

    return NextResponse.json({ goal, program }, { status: 201 });
  }

  // Create standalone goal (optionally linked to a program)
  const goal = await prisma.goal.create({
    data: {
      userId,
      programId: body.programId ?? null,
      type: body.type as GoalType,
      priority: body.priority ?? "primary",
      title: body.title.trim(),
      description: body.description?.trim() || null,
      metric: body.metric ?? null,
      startValue: body.startValue ?? null,
      targetValue: body.targetValue ?? null,
      targetUnit: body.targetUnit ?? null,
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
      status: "active" as GoalStatus,
    },
  });

  return NextResponse.json({ goal }, { status: 201 });
}
