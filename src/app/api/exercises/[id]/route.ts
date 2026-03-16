import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuthUserId();
  const { id } = await params;

  const exercise = await prisma.exercise.findUnique({
    where: { id },
  });

  if (!exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  return NextResponse.json(exercise);
}
