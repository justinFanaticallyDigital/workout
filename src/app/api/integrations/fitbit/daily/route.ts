import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/integrations/fitbit/daily?days=7
 * Returns daily metrics (activity, sleep, HR) for the last N days.
 */
export async function GET(request: NextRequest) {
  const userId = await requireAuthUserId();
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") ?? "7");

  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const metrics = await prisma.dailyMetric.findMany({
      where: {
        userId,
        date: { gte: since },
      },
      orderBy: { date: "asc" },
      select: {
        date: true,
        steps: true,
        activeMinutes: true,
        caloriesBurned: true,
        sleepMinutes: true,
        sleepDeep: true,
        sleepLight: true,
        sleepRem: true,
        sleepWake: true,
        restingHr: true,
        source: true,
      },
    });

    return NextResponse.json({
      metrics: metrics.map((m) => ({
        date: m.date.toISOString().split("T")[0],
        steps: m.steps,
        activeMinutes: m.activeMinutes,
        caloriesBurned: m.caloriesBurned,
        sleepMinutes: m.sleepMinutes,
        sleepDeep: m.sleepDeep,
        sleepLight: m.sleepLight,
        sleepRem: m.sleepRem,
        sleepWake: m.sleepWake,
        restingHr: m.restingHr,
        source: m.source,
      })),
    });
  } catch {
    // Table might not exist yet
    return NextResponse.json({ metrics: [] });
  }
}
