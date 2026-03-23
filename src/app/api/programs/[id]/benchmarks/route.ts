import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
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
    include: { block: { select: { name: true, blockNumber: true } } },
    orderBy: { targetDate: "asc" },
  });

  return NextResponse.json({ benchmarks });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
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
      blockId: body.blockId ?? null,
      label: body.label.trim(),
      targetValue: body.targetValue,
      targetUnit: body.targetUnit ?? "lbs",
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
    },
  });

  return NextResponse.json(benchmark, { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id: programId } = await params;
  const body = await request.json();

  if (!body.benchmarkId) {
    return NextResponse.json({ error: "benchmarkId is required" }, { status: 400 });
  }

  const benchmark = await prisma.programBenchmark.findFirst({
    where: { id: body.benchmarkId, programId, program: { userId } },
    select: { id: true },
  });
  if (!benchmark) {
    return NextResponse.json({ error: "Benchmark not found" }, { status: 404 });
  }

  const updated = await prisma.programBenchmark.update({
    where: { id: body.benchmarkId },
    data: {
      actualValue: body.actualValue !== undefined ? body.actualValue : undefined,
      achievedAt: body.actualValue != null ? new Date() : null,
    },
    include: { block: { select: { name: true, blockNumber: true } } },
  });

  return NextResponse.json(updated);
}
