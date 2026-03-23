import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/workouts/last-by-day
 * Returns the last workout date for each blockDayId the user has logged.
 */
export async function GET() {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;

  const workouts = await prisma.workout.findMany({
    where: { userId, blockDayId: { not: null } },
    select: { blockDayId: true, date: true },
    orderBy: { date: "desc" },
  });

  // Group by blockDayId and take the most recent
  const lastByDay: Record<string, string> = {};
  for (const w of workouts) {
    if (w.blockDayId && !lastByDay[w.blockDayId]) {
      lastByDay[w.blockDayId] = w.date.toISOString().split("T")[0];
    }
  }

  return NextResponse.json(lastByDay);
}
