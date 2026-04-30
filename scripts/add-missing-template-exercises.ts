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

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set — set it before running this script.");
  process.exit(1);
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

// R13: matches the actual repo Exercise schema (movementPattern,
// primaryMuscle, secondaryMuscle1/2, equipment). The original drop
// referenced `category` and `description` which don't exist; the
// taxonomy gets stashed in movementPattern instead.
interface ExerciseSpec {
  name: string;
  movementPattern: string;
  primaryMuscle?: string;
  secondaryMuscle1?: string;
  secondaryMuscle2?: string;
  equipment?: string;
}

const NEW_EXERCISES: ExerciseSpec[] = [
  {
    name: "Squat - Pause Front Barbell",
    movementPattern: "squat",
    primaryMuscle: "quadriceps",
    secondaryMuscle1: "glutes",
    secondaryMuscle2: "upper_back",
    equipment: "barbell",
  },
  {
    name: "Bench Press - Close Grip Barbell",
    movementPattern: "horizontal_push",
    primaryMuscle: "triceps",
    secondaryMuscle1: "chest",
    secondaryMuscle2: "front_delt",
    equipment: "barbell",
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
        movementPattern: spec.movementPattern,
        primaryMuscle: spec.primaryMuscle,
        secondaryMuscle1: spec.secondaryMuscle1,
        secondaryMuscle2: spec.secondaryMuscle2,
        equipment: spec.equipment,
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
