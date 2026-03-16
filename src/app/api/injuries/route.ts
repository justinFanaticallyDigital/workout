import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await requireAuthUserId();

  const injuries = await prisma.injury.findMany({
    where: { userId },
    include: {
      notes: { orderBy: { date: "desc" } },
    },
    orderBy: { onsetDate: "desc" },
  });

  return NextResponse.json({
    injuries: injuries.map((inj) => ({
      id: inj.id,
      bodyPart: inj.bodyPart,
      description: inj.description,
      severity: inj.severity,
      status: inj.status,
      onsetDate: inj.onsetDate.toISOString().split("T")[0],
      resolvedDate: inj.resolvedDate?.toISOString().split("T")[0] ?? null,
      notes: inj.notes,
    })),
  });
}

export async function POST(request: NextRequest) {
  const userId = await requireAuthUserId();
  const body = await request.json();

  if (!body.bodyPart?.trim()) {
    return NextResponse.json({ error: "bodyPart is required" }, { status: 400 });
  }

  const injury = await prisma.injury.create({
    data: {
      userId,
      bodyPart: body.bodyPart,
      description: body.description ?? null,
      severity: body.severity ?? "tweak",
      onsetDate: new Date(body.onsetDate ?? new Date()),
      status: body.status ?? "active",
    },
  });

  return NextResponse.json(injury, { status: 201 });
}
