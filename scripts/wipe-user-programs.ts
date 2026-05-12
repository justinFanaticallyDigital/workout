/**
 * Wipe one user's programs + workouts so the Gameplan empty-state shows.
 *
 * Scope (PROGRAMS + WORKOUTS ONLY — does NOT touch body metrics, photos,
 * exercises, injuries, meals, check-ins, recommendations, lifestyle logs):
 *
 *   - Workout + WorkoutExercise + Set rows
 *   - ActivityLog rows
 *   - Program + ProgramBenchmark + Block + BlockDay + BlockDayExercise rows
 *   - NutritionTarget rows tied to the user's programs/blocks
 *   - ScheduleOverride rows tied to the user's programs
 *   - UserMetricTarget rows scoped to the user's programs
 *   - Recommendation rows (they reference programId/blockId which are
 *     about to disappear)
 *   - GameplanChange rows (audit trail tied to the wiped programs)
 *   - LifestyleTarget rows scoped to the user's programs
 *   - CheckIn rows tied to deleted blocks (blockId would become orphan)
 *   - Goals linked to deleted programs (programId reference)
 *
 * What survives: the exercise library (global rows + your custom),
 * body metrics, progress photos, injuries, food items + meal plans,
 * past check-ins (without blockId), recommendations not tied to a
 * program, integration data, theme prefs.
 *
 * Usage (PowerShell):
 *   $env:DATABASE_URL = "postgresql://..."
 *   $env:WIPE_USER_EMAIL = "you@example.com"   # OR set WIPE_USER_ID
 *   npx tsx scripts/wipe-user-programs.ts --dry-run     # preview
 *   npx tsx scripts/wipe-user-programs.ts --confirm     # actually delete
 *
 * Dry-run prints a count summary of what WOULD be deleted. --confirm is
 * required to actually mutate. There is no undo.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const emailEnv = process.env.WIPE_USER_EMAIL;
const idEnv = process.env.WIPE_USER_ID;
if (!emailEnv && !idEnv) {
  console.error("Set WIPE_USER_EMAIL=you@example.com OR WIPE_USER_ID=<userId>");
  process.exit(1);
}

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const confirm = args.has("--confirm");
if (!dryRun && !confirm) {
  console.error("Pass --dry-run to preview, or --confirm to execute.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const user = idEnv
    ? await prisma.user.findUnique({ where: { id: idEnv } })
    : await prisma.user.findUnique({ where: { email: emailEnv! } });
  if (!user) {
    console.error(`User not found (${idEnv ?? emailEnv})`);
    process.exit(1);
  }
  const userId = user.id;
  console.log(`Target user: ${user.email ?? "(no email)"}  id=${userId}`);

  const programIds = (
    await prisma.program.findMany({ where: { userId }, select: { id: true } })
  ).map((p) => p.id);
  const blockIds = programIds.length
    ? (
        await prisma.block.findMany({
          where: { programId: { in: programIds } },
          select: { id: true },
        })
      ).map((b) => b.id)
    : [];
  const blockDayIds = blockIds.length
    ? (
        await prisma.blockDay.findMany({
          where: { blockId: { in: blockIds } },
          select: { id: true },
        })
      ).map((d) => d.id)
    : [];

  const counts = {
    sets: await prisma.set.count({ where: { workoutExercise: { workout: { userId } } } }),
    workoutExercises: await prisma.workoutExercise.count({ where: { workout: { userId } } }),
    workouts: await prisma.workout.count({ where: { userId } }),
    activityLogs: await prisma.activityLog.count({ where: { userId } }),
    blockDayExercises: blockDayIds.length
      ? await prisma.blockDayExercise.count({
          where: { blockDayId: { in: blockDayIds } },
        })
      : 0,
    blockDays: blockDayIds.length,
    blocks: blockIds.length,
    programs: programIds.length,
    programBenchmarks: programIds.length
      ? await prisma.programBenchmark.count({
          where: { programId: { in: programIds } },
        })
      : 0,
    nutritionTargets:
      blockIds.length || programIds.length
        ? await prisma.nutritionTarget.count({
            where: {
              userId,
              OR: [
                ...(blockIds.length ? [{ blockId: { in: blockIds } }] : []),
                ...(programIds.length ? [{ programId: { in: programIds } }] : []),
              ],
            },
          })
        : 0,
    scheduleOverrides: programIds.length
      ? await prisma.scheduleOverride.count({
          where: { programId: { in: programIds } },
        })
      : 0,
    userMetricTargets: await prisma.userMetricTarget.count({
      where: {
        userId,
        ...(programIds.length ? { programId: { in: programIds } } : {}),
      },
    }),
    recommendations: await prisma.recommendation.count({ where: { userId } }),
    gameplanChanges: await prisma.gameplanChange.count({ where: { userId } }),
    lifestyleTargets: programIds.length
      ? await prisma.lifestyleTarget.count({
          where: { userId, programId: { in: programIds } },
        })
      : 0,
    checkInBlockRefs: blockIds.length
      ? await prisma.checkIn.count({
          where: { userId, blockId: { in: blockIds } },
        })
      : 0,
    goalsLinkedToProgram: programIds.length
      ? await prisma.goal.count({
          where: { userId, programId: { in: programIds } },
        })
      : 0,
  };

  console.log("\n=== Will delete ===");
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k.padEnd(22)} ${v}`);
  }

  if (dryRun) {
    console.log("\nDry run — nothing was deleted. Re-run with --confirm to execute.");
    return;
  }

  console.log("\nDeleting…");

  // Order matters: child rows before parent rows. Use a single transaction
  // so a mid-way failure leaves the DB untouched.
  await prisma.$transaction(async (tx) => {
    // Workout chain
    await tx.set.deleteMany({ where: { workoutExercise: { workout: { userId } } } });
    await tx.workoutExercise.deleteMany({ where: { workout: { userId } } });
    await tx.workout.deleteMany({ where: { userId } });
    await tx.activityLog.deleteMany({ where: { userId } });

    // Recommendation + audit + lifestyle/nutrition/metric/schedule tied to programs
    await tx.recommendation.deleteMany({ where: { userId } });
    await tx.gameplanChange.deleteMany({ where: { userId } });
    if (programIds.length) {
      await tx.lifestyleTarget.deleteMany({
        where: { userId, programId: { in: programIds } },
      });
      await tx.scheduleOverride.deleteMany({
        where: { programId: { in: programIds } },
      });
      await tx.userMetricTarget.deleteMany({
        where: { userId, programId: { in: programIds } },
      });
    }
    if (blockIds.length || programIds.length) {
      await tx.nutritionTarget.deleteMany({
        where: {
          userId,
          OR: [
            ...(blockIds.length ? [{ blockId: { in: blockIds } }] : []),
            ...(programIds.length ? [{ programId: { in: programIds } }] : []),
          ],
        },
      });
    }
    // Clear blockId on CheckIns rather than deleting — keep the audit row
    if (blockIds.length) {
      await tx.checkIn.updateMany({
        where: { userId, blockId: { in: blockIds } },
        data: { blockId: null },
      });
    }
    // Clear programId on Goals — keep the goal, just unlink
    if (programIds.length) {
      await tx.goal.updateMany({
        where: { userId, programId: { in: programIds } },
        data: { programId: null },
      });
    }

    // Program chain
    if (blockDayIds.length) {
      await tx.blockDayExercise.deleteMany({
        where: { blockDayId: { in: blockDayIds } },
      });
    }
    if (blockIds.length) {
      await tx.blockDay.deleteMany({ where: { blockId: { in: blockIds } } });
    }
    if (programIds.length) {
      await tx.programBenchmark.deleteMany({
        where: { programId: { in: programIds } },
      });
      await tx.block.deleteMany({ where: { programId: { in: programIds } } });
      await tx.program.deleteMany({ where: { id: { in: programIds } } });
    }
  });

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
