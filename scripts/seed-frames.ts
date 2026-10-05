/**
 * Seed starter Frames from src/lib/workout-library.ts.
 *
 *   npx tsx scripts/seed-frames.ts --user you@example.com
 *
 * One WorkoutFrame per library entry, keyed by (userId, libraryId). Each slot
 * resolves to the first of its exercise options that exists in the library
 * (case-insensitive); unresolved slots are skipped and reported. Re-running
 * replaces the exercises of frames that are still linked to a libraryId, so
 * library fixes flow through; frames the user renamed keep their name.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { WORKOUT_LIBRARY } from "../src/lib/workout-library";
import { resolveSeedUser } from "./lib/seed-user";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const user = await resolveSeedUser(prisma, process.argv.slice(2));
  console.log(`Seeding ${WORKOUT_LIBRARY.length} frames for ${user.email}\n`);

  const exercises = await prisma.exercise.findMany({
    where: { OR: [{ userId: null }, { userId: user.id }] },
    select: { id: true, name: true },
  });
  const byName = new Map(exercises.map((e) => [e.name.toLowerCase(), e.id]));

  let created = 0;
  let updated = 0;
  const unresolved: string[] = [];

  for (const entry of WORKOUT_LIBRARY) {
    const rows: { exerciseId: string; sortOrder: number; targetSets: number; targetRepRange: string; targetRpe: string | null; notes: string | null }[] = [];
    entry.slots.forEach((slot, idx) => {
      const hit = slot.exerciseOptions.map((n) => byName.get(n.toLowerCase())).find(Boolean);
      if (!hit) {
        unresolved.push(`${entry.id}: ${slot.exerciseOptions.join(" / ")}`);
        return;
      }
      rows.push({
        exerciseId: hit,
        sortOrder: idx + 1,
        targetSets: slot.targetSets,
        targetRepRange: slot.targetRepRange,
        targetRpe: slot.targetRpe ?? null,
        notes: slot.notes ?? null,
      });
    });
    if (rows.length === 0) {
      console.warn(`  skip ${entry.id} — no resolvable exercises`);
      continue;
    }
    const focus = entry.tags.slice(0, 2).join(" · ");
    const existing = await prisma.workoutFrame.findFirst({ where: { userId: user.id, libraryId: entry.id }, select: { id: true } });
    if (existing) {
      await prisma.$transaction([
        prisma.workoutFrameExercise.deleteMany({ where: { frameId: existing.id } }),
        prisma.workoutFrame.update({
          where: { id: existing.id },
          data: { description: entry.description, exercises: { create: rows } },
        }),
      ]);
      updated++;
    } else {
      await prisma.workoutFrame.create({
        data: {
          userId: user.id,
          name: entry.name,
          focus,
          description: entry.description,
          libraryId: entry.id,
          exercises: { create: rows },
        },
      });
      created++;
    }
    console.log(`  ✓ ${entry.name} (${rows.length} exercises)`);
  }

  console.log(`\nDone — ${created} created, ${updated} updated.`);
  if (unresolved.length) {
    console.log(`\n${unresolved.length} slot(s) skipped (exercise not in library):`);
    for (const u of unresolved) console.log(`  - ${u}`);
  }
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
