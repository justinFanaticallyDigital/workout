import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuthUserId();
  const { id: programId } = await params;

  const program = await prisma.program.findUnique({
    where: { id: programId, userId },
    select: { id: true },
  });
  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  const benchmarks = await prisma.programBenchmark.findMany({
    where: { programId },
    orderBy: { targetDate: "asc" },
  });

  return NextResponse.json({ benchmarks });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuthUserId();
  const { id: programId } = await params;
  const body = await request.json();

  const program = await prisma.program.findUnique({
    where: { id: programId, userId },
    select: { id: true },
  });
  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  if (!body.label?.trim() || body.targetValue == null) {
    return NextResponse.json(
      { error: "label and targetValue are required" },
      { status: 400 }
    );
  }

  const benchmark = await prisma.programBenchmark.create({
    data: {
      programId,
      label: body.label.trim(),
      targetValue: body.targetValue,
      targetUnit: body.targetUnit ?? "lbs",
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
    },
  });

  return NextResponse.json(benchmark, { status: 201 });
}
