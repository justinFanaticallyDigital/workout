import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import type { ProgramStatus, BlockStatus, DayType } from "@/generated/prisma/enums";
import { getTemplateBySlug, type ProgramTemplate } from "@/lib/program-templates";
import { applyCustomizations } from "@/lib/program-templates/apply-customizations";
import type { CustomizationAnswers } from "@/lib/program-templates/evaluate-warnings";

/* ─── Legacy "inline template" payload (pre-R13) ──────────────── */

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

/* ─── R13 payload (templateSlug + customizationAnswers) ────────── */

interface CloneRequestBody {
  /** R13: preferred — look up a seeded template Program by slug. */
  templateSlug?: string;
  /** R13: per-template customization inputs from the wizard. */
  customizationAnswers?: CustomizationAnswers;
  /** R13: optional ISO yyyy-mm-dd; defaults to today inside applyCustomizations. */
  startDate?: string;
  /** Legacy: inline template object. Ignored when templateSlug is present. */
  template?: Template;
}

export async function POST(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;

  let body: CloneRequestBody;
  try {
    body = (await request.json()) as CloneRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // R13 — templateSlug path takes precedence over the legacy inline shape.
  if (body.templateSlug) {
    return cloneFromSlug(userId, body);
  }

  if (!body.template?.name) {
    return NextResponse.json(
      { error: "templateSlug or template is required" },
      { status: 400 },
    );
  }

  return cloneFromInlineTemplate(userId, body.template);
}

/* ─── R13: clone from a seeded template program by slug ────────── */

async function cloneFromSlug(
  userId: string,
  body: CloneRequestBody,
): Promise<NextResponse> {
  const slug = body.templateSlug!;
  const template = getTemplateBySlug(slug);
  if (!template) {
    return NextResponse.json(
      { error: `Unknown template slug: ${slug}` },
      { status: 400 },
    );
  }

  // Find the seeded source program. Templates land with
  // gameplanKind=<slug> on a system "templates" user account.
  const source = await prisma.program.findFirst({
    where: { gameplanKind: slug },
    include: {
      blocks: {
        orderBy: { blockNumber: "asc" },
        include: {
          days: {
            orderBy: { sortOrder: "asc" },
            include: {
              exercises: { orderBy: { sortOrder: "asc" } },
            },
          },
          benchmarks: true,
          nutritionTargets: true,
        },
      },
    },
  });
  if (!source) {
    return NextResponse.json(
      {
        error:
          `Template "${slug}" hasn't been seeded yet — run scripts/seed-program-templates.ts first`,
      },
      { status: 503 },
    );
  }

  // Pause any currently active program.
  await prisma.program.updateMany({
    where: { userId, status: "active" as ProgramStatus },
    data: { status: "paused" as ProgramStatus },
  });

  // Create the user-owned Program copy. Strip the ---META--- block
  // from description so the user doesn't see the JSON tail.
  const cleanDescription = stripMeta(source.description);
  const program = await prisma.program.create({
    data: {
      userId,
      name: source.name,
      description: cleanDescription,
      durationWeeks: source.durationWeeks,
      startDate: new Date(),
      status: "active" as ProgramStatus,
      gameplanKind: source.gameplanKind,
    },
  });

  // Deep-copy blocks → days → exercises. ProgramBenchmark and
  // NutritionTarget rows are also re-keyed onto the cloned Program.
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
        status: srcBlock.status,
        refeedWeeks: srcBlock.refeedWeeks,
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
      for (const srcEx of srcDay.exercises) {
        await prisma.blockDayExercise.create({
          data: {
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
          },
        });
      }
    }

    // Carry block-scoped benchmarks forward.
    for (const srcBench of srcBlock.benchmarks) {
      await prisma.programBenchmark.create({
        data: {
          programId: program.id,
          blockId: newBlock.id,
          label: srcBench.label,
          metric: srcBench.metric,
          targetValue: srcBench.targetValue,
          targetUnit: srcBench.targetUnit,
          targetDate: srcBench.targetDate,
          notes: srcBench.notes,
        },
      });
    }

    // Carry block-scoped nutrition targets forward (placeholder values
    // that applyCustomizations may overwrite based on bodyweight).
    for (const srcNut of srcBlock.nutritionTargets) {
      await prisma.nutritionTarget.create({
        data: {
          userId,
          label: srcNut.label,
          calories: srcNut.calories,
          protein: srcNut.protein,
          carbs: srcNut.carbs,
          fat: srcNut.fat,
          isActive: srcNut.isActive,
          programId: program.id,
          blockId: newBlock.id,
          notes: srcNut.notes,
        },
      });
    }
  }

  // R13 — seed lifestyle picks from the in-memory registry. The seeded
  // template Program doesn't carry these (they're static TS data); the
  // clone is the right place to plant them, scoped to the user.
  const warnings: string[] = [];
  await safeSeedLifestyleTargets(userId, program.id, template, warnings);

  // R13 — run the customization passes (start date, nutrition,
  // weight scaling, injury subs). Each pass is internally try/catch,
  // so partial failures degrade to warnings rather than rolling back.
  if (body.customizationAnswers) {
    try {
      await applyCustomizations({
        // The module uses a structurally loose PrismaLike type to avoid
        // pulling the full client; the real PrismaClient is strictly
        // compatible at runtime, so cast through unknown.
        prisma: prisma as unknown as Parameters<typeof applyCustomizations>[0]["prisma"],
        programId: program.id,
        template,
        answers: body.customizationAnswers,
        warnings,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "applyCustomizations failed";
      warnings.push(msg);
    }
  }

  // Optional explicit startDate from the picker (overrides the default).
  if (typeof body.startDate === "string" && body.startDate) {
    const start = new Date(body.startDate);
    if (!Number.isNaN(start.getTime())) {
      await prisma.program.update({
        where: { id: program.id },
        data: { startDate: start },
      });
    }
  }

  return NextResponse.json(
    {
      programId: program.id,
      gameplanKind: program.gameplanKind,
      warnings,
    },
    { status: 201 },
  );
}

async function safeSeedLifestyleTargets(
  userId: string,
  programId: string,
  template: ProgramTemplate,
  warnings: string[],
): Promise<void> {
  try {
    const existing = await prisma.lifestyleTarget.findMany({
      where: {
        userId,
        key: { in: template.defaultLifestylePicks.map((p) => p.key) },
      },
      select: { key: true },
    });
    const existingKeys = new Set(existing.map((e) => e.key));
    for (const pick of template.defaultLifestylePicks) {
      if (existingKeys.has(pick.key)) continue;
      await prisma.lifestyleTarget.create({
        data: {
          userId,
          programId,
          key: pick.key,
          value: pick.value,
          unit: pick.unit,
          comparator: pick.comparator,
        },
      });
    }
  } catch (e) {
    warnings.push(
      `Lifestyle target seeding failed: ${e instanceof Error ? e.message : "unknown error"}`,
    );
  }
}

function stripMeta(description: string | null | undefined): string | null {
  if (!description) return description ?? null;
  const idx = description.indexOf("\n---META---\n");
  return idx >= 0 ? description.slice(0, idx) : description;
}

/* ─── Legacy: clone from an inline template object ─────────────── */

async function cloneFromInlineTemplate(
  userId: string,
  template: Template,
): Promise<NextResponse> {
  // Pause any currently active program
  await prisma.program.updateMany({
    where: { userId, status: "active" as ProgramStatus },
    data: { status: "paused" as ProgramStatus },
  });

  // Create program
  const program = await prisma.program.create({
    data: {
      userId,
      name: template.name,
      description: template.description ?? null,
      durationWeeks: template.durationWeeks ?? null,
      startDate: new Date(),
      status: "active" as ProgramStatus,
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
        status: (bi === 0 ? "active" : "upcoming") as BlockStatus,
      },
    });

    // Create days
    const validDayTypes: DayType[] = ["lifting", "cardio", "conditioning", "mobility", "rest"];
    for (let di = 0; di < tBlock.days.length; di++) {
      const tDay = tBlock.days[di];
      const dayType: DayType = validDayTypes.includes(tDay.type as DayType)
        ? (tDay.type as DayType)
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
