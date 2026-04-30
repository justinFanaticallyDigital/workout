/**
 * Adds 2 exercises to the global library that are referenced by the Powerbuilder
 * template but weren't in the original seed.
 *
 *   - Squat - Pause Front Barbell (specialty squat — 3-count pause at bottom)
 *   - Bench Press - Close Grip Barbell (triceps + lockout work)
 *
 * Run BEFORE seed-program-templates.ts:
 *   npx tsx scripts/add-missing-template-exercises.ts
 *
 * Idempotent — uses upsert by name+userId (NULL).
 *
 * If your existing exercise seed grows over time, fold these into prisma/seed.ts
 * directly and remove this script.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ExerciseSpec {
  name: string;
  category: string;             // matches your existing Exercise.category convention
  primaryMuscle?: string;
  secondaryMuscles?: string;    // comma-separated string, matching seed convention
  equipment?: string;
  description?: string;
}

// NOTE: Adjust field names below to match your actual Prisma Exercise schema if
// they differ — these match the patterns visible in CLAUDE.md / seed.ts.
// If your schema uses different keys (e.g., movementPattern instead of category),
// update before running.
const NEW_EXERCISES: ExerciseSpec[] = [
  {
    name: "Squat - Pause Front Barbell",
    category: "squat",
    primaryMuscle: "quadriceps",
    secondaryMuscles: "glutes,core,upper_back",
    equipment: "barbell",
    description:
      "Front-rack barbell squat with a 3-count pause at the bottom. Eliminates the stretch-reflex, builds out-of-the-hole strength, and improves upright torso position. Heavy bar awareness — hold the rack with relaxed elbows, drive elbows up.",
  },
  {
    name: "Bench Press - Close Grip Barbell",
    category: "horizontal_push",
    primaryMuscle: "triceps",
    secondaryMuscles: "chest,front_delt",
    equipment: "barbell",
    description:
      "Bench press with hands roughly shoulder-width (about 1-2 inches inside standard bench grip). Builds triceps and reinforces the bench lockout phase. Tuck elbows tight to the torso. Don't go narrower than shoulder-width — wrist strain.",
  },
];

async function main() {
  console.log("Adding missing template exercises to global library...\n");

  for (const spec of NEW_EXERCISES) {
    // Check if it already exists as a global exercise
    const existing = await prisma.exercise.findFirst({
      where: { name: spec.name, userId: null },
    });

    if (existing) {
      console.log(`✓ Already exists: "${spec.name}" (id=${existing.id})`);
      continue;
    }

    const created = await prisma.exercise.create({
      data: {
        name: spec.name,
        userId: null, // global library
        // The fields below assume your schema. Adjust as needed.
        category: spec.category as any,
        primaryMuscle: spec.primaryMuscle,
        secondaryMuscles: spec.secondaryMuscles,
        equipment: spec.equipment,
        description: spec.description,
      },
    });
    console.log(`+ Created: "${spec.name}" (id=${created.id})`);
  }

  console.log(`\n✓ Done — ${NEW_EXERCISES.length} exercises ensured`);
}

main()
  .catch((e) => {
    console.error("\n❌ Failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
