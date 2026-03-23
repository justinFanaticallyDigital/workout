import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

interface TemplateDay {
  name: string;
  type: string;
  exercises: string[];
}

interface TemplateBlock {
  name: string;
  weeks: number;
  days: TemplateDay[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  durationWeeks: number;
  daysPerWeek: number;
  blocks: TemplateBlock[];
}

export async function POST(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const body = await request.json();
  const template: Template = body.template;

  if (!template?.name) {
    return NextResponse.json({ error: "template is required" }, { status: 400 });
  }

  // Pause any currently active program
  await prisma.program.updateMany({
    where: { userId, status: "active" },
    data: { status: "paused" },
  });

  // Create program
  const program = await prisma.program.create({
    data: {
      userId,
      name: template.name,
      description: template.description ?? null,
      durationWeeks: template.durationWeeks ?? null,
      startDate: new Date(),
      status: "active",
    },
  });

  // Create blocks with days
  for (let bi = 0; bi < template.blocks.length; bi++) {
    const tBlock = template.blocks[bi];
    const block = await prisma.block.create({
      data: {
        programId: program.id,
        name: tBlock.name,
        blockNumber: bi + 1,
        durationWeeks: tBlock.weeks,
        scheduleDaysPerWeek: tBlock.days.length,
        status: bi === 0 ? "active" : "upcoming",
      },
    });

    // Create days
    const validDayTypes = ["lifting", "cardio", "conditioning", "mobility", "rest"] as const;
    for (let di = 0; di < tBlock.days.length; di++) {
      const tDay = tBlock.days[di];
      const dayType = validDayTypes.includes(tDay.type as typeof validDayTypes[number])
        ? (tDay.type as typeof validDayTypes[number])
        : "lifting";
      const day = await prisma.blockDay.create({
        data: {
          blockId: block.id,
          dayNumber: di + 1,
          name: tDay.name,
          dayType,
          sortOrder: di + 1,
        },
      });

      // Try to match exercise names to existing exercises
      for (let ei = 0; ei < tDay.exercises.length; ei++) {
        const exName = tDay.exercises[ei];
        const exercise = await prisma.exercise.findFirst({
          where: {
            name: { contains: exName, mode: "insensitive" },
            OR: [{ userId: null }, { userId }],
          },
          select: { id: true },
        });

        if (exercise) {
          await prisma.blockDayExercise.create({
            data: {
              blockDayId: day.id,
              exerciseId: exercise.id,
              sortOrder: ei + 1,
              targetSets: 3,
              targetRepRange: "8-12",
              progressionType: "none",
            },
          });
        }
      }
    }
  }

  return NextResponse.json(program, { status: 201 });
}
