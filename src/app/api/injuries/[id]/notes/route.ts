import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id: injuryId } = await params;
  const body = await request.json();

  // Verify ownership
  const injury = await prisma.injury.findUnique({
    where: { id: injuryId, userId },
    select: { id: true },
  });
  if (!injury) {
    return NextResponse.json({ error: "Injury not found" }, { status: 404 });
  }

  if (!body.note?.trim()) {
    return NextResponse.json({ error: "note is required" }, { status: 400 });
  }

  const note = await prisma.injuryNote.create({
    data: {
      injuryId,
      date: new Date(body.date ?? new Date()),
      note: body.note,
      treatment: body.treatment ?? null,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
    },
  });

  return NextResponse.json(note, { status: 201 });
}
