import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (!userId) return errorRes!;

  try {
    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("programId");

    const targets = await prisma.userMetricTarget.findMany({
      where: {
        userId,
        ...(programId ? { programId } : {}),
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(targets);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (!userId) return errorRes!;

  try {
    const body = await req.json();

    const target = await prisma.userMetricTarget.upsert({
      where: {
        userId_metricKey_programId: {
          userId,
          metricKey: body.metricKey,
          programId: body.programId ?? null,
        },
      },
      update: {
        targetValue: body.targetValue,
        unit: body.unit,
      },
      create: {
        userId,
        metricKey: body.metricKey,
        programId: body.programId,
        targetValue: body.targetValue,
        unit: body.unit,
      },
    });

    return NextResponse.json(target);
  } catch {
    return NextResponse.json({ error: "metric_targets table may not exist yet" }, { status: 500 });
  }
}
