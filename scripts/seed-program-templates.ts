/**
 * Seed program templates into the database.
 *
 * Templates live under a system "template" user account. Each template becomes
 * a Program record that users can clone via POST /api/programs/clone.
 *
 * Run this script:
 *   npx tsx scripts/seed-program-templates.ts
 *
 * Idempotent: re-running updates existing templates rather than duplicating.
 * The matching key is `Program.name = template.name AND userId = TEMPLATE_USER_ID`.
 *
 * Behavior on re-run:
 *   - Existing program with same name+templateUser → DELETE all child blocks/days/exercises,
 *     then RECREATE with the new spec. This is a "destructive replace" because re-creating
 *     children individually with all the right ordering is more error-prone than a full
 *     replace, and templates aren't user-owned data.
 *   - Existing program NOT in templates list → leaves it alone.
 *
 * Failure modes:
 *   - Any template references an exercise name that isn't in the DB → script fails fast
 *     with a list of every missing name. No DB writes happen until validation passes.
 *   - Database connection fails → standard Prisma error.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { programTemplates } from "../src/lib/program-templates";
import { ExerciseResolver, buildExerciseNotes } from "../src/lib/program-templates/resolver";
import type { ProgramTemplate, NutritionTarget } from "../src/lib/program-templates/types";

const TEMPLATE_USER_EMAIL = "templates@fittrack.system";
const TEMPLATE_USER_NAME = "FitTrack Templates";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set — set it before running this script.");
  process.exit(1);
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  console.log("==============================================");
  console.log("Seeding program templates");
  console.log("==============================================\n");

  // 1. Ensure system template user exists
  const templateUser = await ensureTemplateUser();
  console.log(`Template user: ${templateUser.email} (${templateUser.id})\n`);

  // 2. Validate ALL templates first — fail fast if any exercise name doesn't resolve
  const resolver = new ExerciseResolver(prisma);
  console.log(`Validating ${programTemplates.length} templates against exercise library...`);

  const allMissing: string[] = [];
  for (const template of programTemplates) {
    const missing = await resolver.validateTemplate(template);
    if (missing.length > 0) {
      allMissing.push(...missing);
    }
  }

  if (allMissing.length > 0) {
    console.error("\n❌ VALIDATION FAILED — exercise names not found in DB:");
    for (const msg of allMissing) console.error(`   ${msg}`);
    console.error(`\nTotal missing: ${allMissing.length}`);
    console.error("Fix the template files and re-run. No DB writes have occurred.");
    process.exit(1);
  }

  console.log(`✓ All exercise names resolved successfully\n`);

  // 3. Seed each template
  for (const template of programTemplates) {
    await seedTemplate(template, templateUser.id, resolver);
  }

  console.log("\n==============================================");
  console.log(`✓ Seeded ${programTemplates.length} templates`);
  console.log("==============================================");
}

async function ensureTemplateUser() {
  const existing = await prisma.user.findUnique({
    where: { email: TEMPLATE_USER_EMAIL },
  });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      email: TEMPLATE_USER_EMAIL,
      name: TEMPLATE_USER_NAME,
    },
  });
}

async function seedTemplate(
  template: ProgramTemplate,
  templateUserId: string,
  resolver: ExerciseResolver
) {
  console.log(`→ ${template.name}`);

  // Build full description with metadata for the templates list page.
  // Format: <description>\n---META---\n<json>
  // The templates page parses this when rendering cards.
  const meta = {
    slug: template.slug,
    tagline: template.tagline,
    experienceLevel: template.experienceLevel,
    durationWeeks: template.durationWeeks,
    defaultDaysPerWeek: template.defaultDaysPerWeek,
    daysPerWeekRange: template.daysPerWeekRange,
    sessionLengthMin: template.sessionLengthMin,
    sessionLengthMax: template.sessionLengthMax,
    equipment: template.equipment,
    periodization: template.periodization,
    goalWeighting: template.goalWeighting,
    cardioGuidance: template.cardioGuidance,
    conditioningGuidance: template.conditioningGuidance,
    mobilityGuidance: template.mobilityGuidance,
    lifestyleGuidance: template.lifestyleGuidance,
    customizationInputs: template.customizationInputs,
    engineWarnings: template.engineWarnings,
    variantNotes: template.variantNotes,
  };
  const fullDescription = `${template.description}\n---META---\n${JSON.stringify(meta)}`;

  // Find existing template program. Block uses `days` not `blockDays`
  // per the repo schema; the cascade walks days → exercises in order.
  const existing = await prisma.program.findFirst({
    where: {
      userId: templateUserId,
      name: template.name,
    },
    include: { blocks: { include: { days: true } } },
  });

  // Destructive replace: delete existing program (cascade deletes blocks/days/exercises)
  if (existing) {
    console.log(`  (replacing existing — id=${existing.id})`);
    for (const block of existing.blocks) {
      for (const day of block.days) {
        await prisma.blockDayExercise.deleteMany({ where: { blockDayId: day.id } });
      }
      await prisma.blockDay.deleteMany({ where: { blockId: block.id } });
    }
    await prisma.programBenchmark.deleteMany({ where: { programId: existing.id } });
    await prisma.nutritionTarget.deleteMany({
      where: { blockId: { in: existing.blocks.map((b: { id: string }) => b.id) } },
    });
    await prisma.block.deleteMany({ where: { programId: existing.id } });
    await prisma.program.delete({ where: { id: existing.id } });
  }

  // Create new program. R13: tag with gameplanKind so the engine's
  // refeed_due rule and the Header badge work after clone.
  const program = await prisma.program.create({
    data: {
      userId: templateUserId,
      name: template.name,
      description: fullDescription,
      status: "active",
      gameplanKind: template.slug,
    },
  });

  // R13: trim refeed cadence to fit each block's duration.
  const refeedCadence = template.defaultRefeedCadence ?? null;

  // Create blocks
  for (let blockIdx = 0; blockIdx < template.blocks.length; blockIdx++) {
    const blockSpec = template.blocks[blockIdx];
    const blockDuration = blockSpec.weekEnd - blockSpec.weekStart + 1;
    const refeedWeeks = refeedCadence
      ? refeedCadence.filter((w) => w >= 1 && w <= blockDuration)
      : [];
    const block = await prisma.block.create({
      data: {
        programId: program.id,
        name: blockSpec.name,
        // R13: keep blockNumber + durationWeeks (existing required fields)
        // and write weekStart/weekEnd alongside for apply-customizations.ts.
        blockNumber: blockIdx + 1,
        weekStart: blockSpec.weekStart,
        weekEnd: blockSpec.weekEnd,
        durationWeeks: blockDuration,
        status: blockIdx === 0 ? "active" : "upcoming",
        phase: blockSpec.phase,
        description: blockSpec.description,
        ...(refeedWeeks.length > 0 ? { refeedWeeks } : {}),
      },
    });

    // Create nutrition target for this block (if specified)
    if (blockSpec.nutritionTarget) {
      await createNutritionTarget(blockSpec.nutritionTarget, block.id, templateUserId);
    }

    // Create benchmarks for this block. ProgramBenchmark requires
    // a non-null targetValue + targetUnit; templates may declare a
    // qualitative-only target (e.g. "+5-10% from start"), which we
    // persist with targetValue=0 and the description in notes.
    if (blockSpec.benchmarks) {
      for (const bench of blockSpec.benchmarks) {
        await prisma.programBenchmark.create({
          data: {
            programId: program.id,
            blockId: block.id,
            label: bench.label,
            metric: bench.metric,
            targetUnit: bench.unit,
            targetValue: bench.targetValue ?? 0,
            notes: bench.targetDescription ?? null,
          },
        });
      }
    }

    // Create BlockDays — one per day template, repeated for each block.
    // Schema uses dayNumber (within the block) + dayOfWeek (1-indexed
    // weekday slot) + dayType (lifting | cardio | …).
    for (let dayIdx = 0; dayIdx < template.days.length; dayIdx++) {
      const dayTemplate = template.days[dayIdx];
      const blockDay = await prisma.blockDay.create({
        data: {
          blockId: block.id,
          name: dayTemplate.name,
          dayNumber: dayIdx + 1,
          dayOfWeek: dayIdx + 1, // 1-indexed; user can rearrange post-clone
          dayType: dayTemplate.type,
          sortOrder: dayIdx,
        },
      });

      // Create BlockDayExercises with this block's parameters
      const blockParams = dayTemplate.perBlockParams[blockIdx];
      if (!blockParams) {
        console.warn(`  ⚠ No per-block params for block ${blockIdx} day ${dayIdx} in ${template.slug}`);
        continue;
      }

      for (let slotIdx = 0; slotIdx < dayTemplate.slots.length; slotIdx++) {
        const slot = dayTemplate.slots[slotIdx];
        const params = blockParams[slotIdx];

        // Skip slots that are dropped (sets=0) in this block
        if (!params || params.sets === 0) continue;

        const resolved = await resolver.resolveSlot(slot);
        const notes = buildExerciseNotes(resolved, params.notesOverride);

        // Build target rep range string. If reps is a number, single number.
        // If reps is "AMRAP" or "6-10", pass through as a string.
        const targetRepRange =
          typeof params.reps === "string" ? params.reps : String(params.reps);

        await prisma.blockDayExercise.create({
          data: {
            blockDayId: blockDay.id,
            exerciseId: resolved.primaryId,
            altExerciseId: resolved.alt1Id ?? null,
            sortOrder: slotIdx,
            targetSets: params.sets,
            targetRepRange,
            // targetRpe is String? in the schema (e.g. "@8" / "RPE 8");
            // coerce numeric template values into a string.
            targetRpe: params.rpe != null ? String(params.rpe) : null,
            targetRir: params.rir ?? null,
            progressionType: params.progressionType,
            progressionIncrement: params.progressionIncrement ?? null,
            notes,
          },
        });
      }
    }
  }

  console.log(`  ✓ ${template.blocks.length} blocks, ${template.days.length} days each`);
}

/**
 * Convert a NutritionTarget's calorie spec into a numeric estimate or NULL.
 * Templates use "maintenance", "maintenance+200", etc. — we store these as text
 * descriptors in notes and leave the numeric calorie field NULL for templates,
 * since we don't know the user's bodyweight yet. The clone API will compute
 * actual numbers from user inputs.
 */
async function createNutritionTarget(
  spec: NutritionTarget,
  blockId: string,
  userId: string
) {
  const isQualitativeCal = typeof spec.calories === "string";
  await prisma.nutritionTarget.create({
    data: {
      blockId,
      userId,
      // Numeric calories field is NULL for templates — actual numbers come from clone
      calories: isQualitativeCal ? null : (spec.calories as number | undefined) ?? null,
      protein: spec.proteinPerLb ?? null, // stored as g/lb multiplier; clone API multiplies by bodyweight
      carbs: spec.carbsPerLb ?? null,
      fat: spec.fatPerLb ?? null,
      // Stash the qualitative target + notes in description
      notes: [
        isQualitativeCal ? `Calories: ${spec.calories}` : null,
        spec.notes,
      ]
        .filter(Boolean)
        .join(" | "),
    },
  });
}

main()
  .catch((e) => {
    console.error("\n❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
