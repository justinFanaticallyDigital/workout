import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (!userId) return errorRes!;

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "30", 10);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await prisma.activityLog.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (!userId) return errorRes!;

  const body = await req.json();
  const log = await prisma.activityLog.create({
    data: {
      userId,
      date: new Date(body.date),
      activityType: body.activityType,
      subType: body.subType,
      durationMin: body.durationMin,
      intensity: body.intensity,
      distanceKm: body.distanceKm,
      avgHeartRate: body.avgHeartRate,
      caloriesBurned: body.caloriesBurned,
      instructor: body.instructor,
      studio: body.studio,
      notes: body.notes,
    },
  });

  return NextResponse.json(log, { status: 201 });
}
