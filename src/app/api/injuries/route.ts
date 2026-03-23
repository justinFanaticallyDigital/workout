import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;

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
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
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

export async function PATCH(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const body = await request.json();

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const injury = await prisma.injury.findUnique({ where: { id: body.id, userId } });
  if (!injury) {
    return NextResponse.json({ error: "Injury not found" }, { status: 404 });
  }

  const updated = await prisma.injury.update({
    where: { id: body.id },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.severity !== undefined && { severity: body.severity }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.resolvedDate !== undefined && { resolvedDate: body.resolvedDate ? new Date(body.resolvedDate) : null }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const injury = await prisma.injury.findUnique({ where: { id, userId } });
  if (!injury) {
    return NextResponse.json({ error: "Injury not found" }, { status: 404 });
  }

  await prisma.injuryNote.deleteMany({ where: { injuryId: id } });
  await prisma.injury.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
