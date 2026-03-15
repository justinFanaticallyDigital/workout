import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: injuryId } = await params;
  const body = await request.json();

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
