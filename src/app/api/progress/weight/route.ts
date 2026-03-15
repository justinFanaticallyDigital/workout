import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await requireAuthUserId();

  const entries = await prisma.bodyMetric.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    select: {
      id: true,
      date: true,
      weight: true,
      bodyFatPct: true,
      notes: true,
    },
  });

  return NextResponse.json({
    entries: entries.map((e) => ({
      id: e.id,
      date: e.date.toISOString().split("T")[0],
      weight: e.weight ? Number(e.weight) : null,
      bodyFatPct: e.bodyFatPct ? Number(e.bodyFatPct) : null,
      notes: e.notes,
    })),
  });
}

export async function POST(request: NextRequest) {
  const userId = await requireAuthUserId();
  const body = await request.json();

  const entry = await prisma.bodyMetric.create({
    data: {
      userId,
      date: new Date(body.date ?? new Date()),
      weight: body.weight ?? null,
      bodyFatPct: body.bodyFatPct ?? null,
      source: body.source ?? "manual",
      notes: body.notes ?? null,
    },
  });

  return NextResponse.json(
    {
      id: entry.id,
      date: entry.date.toISOString().split("T")[0],
      weight: entry.weight ? Number(entry.weight) : null,
    },
    { status: 201 }
  );
}
