import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { getTemplateBySlug } from "@/lib/program-templates";

/** The system account that owns the seeded pre-made plans (see scripts/seed-program-templates.ts). */
const TEMPLATE_USER_EMAIL = "templates@fittrack.system";

/**
 * POST /api/programs/clone  { templateSlug }
 *
 * "Use plan" — deep-clones a seeded pre-made plan onto the signed-in user as
 * a new active plan. The seeded source is the Program owned by the templates
 * system user whose `gameplanKind` equals the slug. Blocks → days → exercises
 * and block-scoped nutrition targets are copied. Nothing else is touched:
 * other active plans stay active (plans are independent sequences).
 */
export async function POST(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;

  let body: { templateSlug?: string };
  try {
    body = (await request.json()) as { templateSlug?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const slug = body.templateSlug;
  if (!slug) {
    return NextResponse.json({ error: "templateSlug is required" }, { status: 400 });
  }
  if (!getTemplateBySlug(slug)) {
    return NextResponse.json({ error: `Unknown template slug: ${slug}` }, { status: 400 });
  }

  const source = await prisma.program.findFirst({
    where: { gameplanKind: slug, user: { email: TEMPLATE_USER_EMAIL } },
    include: {
      blocks: {
        orderBy: { blockNumber: "asc" },
        include: {
          days: {
            orderBy: { sortOrder: "asc" },
            include: { exercises: { orderBy: { sortOrder: "asc" } } },
          },
          nutritionTargets: true,
        },
      },
    },
  });
  if (!source) {
    return NextResponse.json(
      { error: `Template "${slug}" hasn't been seeded yet — run scripts/seed-program-templates.ts first` },
      { status: 503 },
    );
  }

  const program = await prisma.program.create({
    data: {
      userId,
      name: source.name,
      description: stripMeta(source.description),
      durationWeeks: source.durationWeeks,
      startDate: new Date(),
      status: "active",
      gameplanKind: source.gameplanKind,
    },
  });

  for (const srcBlock of source.blocks) {
    const newBlock = await prisma.block.create({
      data: {
        programId: program.id,
        name: srcBlock.name,
        description: srcBlock.description,
        blockNumber: srcBlock.blockNumber,
        weekStart: srcBlock.weekStart,
        weekEnd: srcBlock.weekEnd,
        durationWeeks: srcBlock.durationWeeks,
        scheduleDaysPerWeek: srcBlock.scheduleDaysPerWeek,
        phase: srcBlock.phase,
        focus: srcBlock.focus,
        status: srcBlock.blockNumber === 1 ? "active" : "upcoming",
      },
    });

    for (const srcDay of srcBlock.days) {
      const newDay = await prisma.blockDay.create({
        data: {
          blockId: newBlock.id,
          name: srcDay.name,
          dayNumber: srcDay.dayNumber,
          dayOfWeek: srcDay.dayOfWeek,
          dayType: srcDay.dayType,
          sortOrder: srcDay.sortOrder,
        },
      });
      if (srcDay.exercises.length > 0) {
        await prisma.blockDayExercise.createMany({
          data: srcDay.exercises.map((srcEx) => ({
            blockDayId: newDay.id,
            exerciseId: srcEx.exerciseId,
            altExerciseId: srcEx.altExerciseId,
            sortOrder: srcEx.sortOrder,
            targetSets: srcEx.targetSets,
            targetRepRange: srcEx.targetRepRange,
            targetRpe: srcEx.targetRpe,
            targetRir: srcEx.targetRir,
            progressionType: srcEx.progressionType,
            progressionIncrement: srcEx.progressionIncrement,
            notes: srcEx.notes,
            variants: srcEx.variants,
          })),
        });
      }
    }

    for (const srcNut of srcBlock.nutritionTargets) {
      await prisma.nutritionTarget.create({
        data: {
          userId,
          label: srcNut.label,
          calories: srcNut.calories,
          protein: srcNut.protein,
          carbs: srcNut.carbs,
          fat: srcNut.fat,
          isActive: false,
          programId: program.id,
          blockId: newBlock.id,
          notes: srcNut.notes,
        },
      });
    }
  }

  return NextResponse.json({ programId: program.id, name: program.name }, { status: 201 });
}

/** Seeded template descriptions carry a JSON tail after a ---META--- marker; users never see it. */
function stripMeta(description: string | null | undefined): string | null {
  if (!description) return null;
  const idx = description.indexOf("\n---META---\n");
  return idx >= 0 ? description.slice(0, idx) : description;
}
