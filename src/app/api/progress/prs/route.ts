import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;

  const prs = await prisma.exercisePr.findMany({
    where: { userId },
    include: {
      exercise: { select: { name: true } },
    },
    orderBy: { achievedAt: "desc" },
  });

  return NextResponse.json({
    prs: prs.map((pr) => ({
      id: pr.id,
      date: pr.achievedAt.toISOString().split("T")[0],
      exercise: pr.exercise.name,
      prType: pr.prType,
      weight: Number(pr.value),
      reps: pr.repsAtWeight,
    })),
  });
}
