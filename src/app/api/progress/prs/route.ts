import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoUserId } from "@/lib/demo-user";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getDemoUserId();

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
