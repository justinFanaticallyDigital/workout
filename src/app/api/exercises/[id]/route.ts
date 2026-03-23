import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;

  const exercise = await prisma.exercise.findUnique({
    where: { id },
  });

  if (!exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  // Fetch adjacent exercises alphabetically for prev/next navigation
  const [prev, next] = await Promise.all([
    prisma.exercise.findFirst({
      where: { name: { lt: exercise.name } },
      orderBy: { name: "desc" },
      select: { id: true, name: true },
    }),
    prisma.exercise.findFirst({
      where: { name: { gt: exercise.name } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return NextResponse.json({ ...exercise, adjacent: { prev, next } });
}
