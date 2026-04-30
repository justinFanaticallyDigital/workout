// src/app/api/lifestyle-logs/route.ts
// ============================================================================
// R9 — LifestyleLog read/write.
//
// GET  /api/lifestyle-logs?from=YYYY-MM-DD&to=YYYY-MM-DD&keys=sleep_duration,stress
// POST /api/lifestyle-logs  (upsert by [userId, date, variableKey])
//
// The dashboard cards read the last N days of logs for the variables
// they surface; the inline "Log today" affordance writes one row per
// tap. Source defaults to MANUAL; Fitbit / Apple Health / Garmin
// importers write through the same shape with their own source.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { lifestyleVariable } from "@/lib/goal-engine/lifestyle-variables";
import type { IntegrationSource } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const VALID_SOURCES: ReadonlySet<IntegrationSource> = new Set([
  "MANUAL",
  "FITBIT",
  "APPLE_HEALTH",
  "GARMIN",
  "DERIVED",
] as const);

export async function GET(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const keysParam = searchParams.get("keys");
  const keys = keysParam ? keysParam.split(",").map((k) => k.trim()).filter(Boolean) : null;

  try {
    const logs = await prisma.lifestyleLog.findMany({
      where: {
        userId,
        ...(keys ? { variableKey: { in: keys } } : {}),
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { date: "asc" },
      select: {
        id: true,
        date: true,
        variableKey: true,
        numValue: true,
        textValue: true,
        unit: true,
        source: true,
      },
    });
    return NextResponse.json({
      logs: logs.map((l) => ({
        ...l,
        date: l.date.toISOString().slice(0, 10),
      })),
    });
  } catch {
    // Table may not exist yet on first deploy — degrade gracefully.
    return NextResponse.json({ logs: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;

  let body: {
    date?: string;
    variableKey?: string;
    numValue?: number | null;
    textValue?: string | null;
    unit?: string | null;
    source?: string;
    programId?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const variableKey = body.variableKey?.trim();
  if (!variableKey) {
    return NextResponse.json({ error: "variableKey required" }, { status: 400 });
  }
  const variable = lifestyleVariable(variableKey);
  if (!variable) {
    return NextResponse.json({ error: `Unknown variableKey: ${variableKey}` }, { status: 400 });
  }
  if (body.numValue == null && !body.textValue) {
    return NextResponse.json({ error: "numValue or textValue required" }, { status: 400 });
  }

  const date = body.date ? new Date(body.date) : new Date();
  date.setUTCHours(0, 0, 0, 0);

  const sourceUpper = (body.source ?? "MANUAL").toUpperCase() as IntegrationSource;
  const source: IntegrationSource = VALID_SOURCES.has(sourceUpper) ? sourceUpper : "MANUAL";

  const row = await prisma.lifestyleLog.upsert({
    where: {
      userId_date_variableKey: {
        userId,
        date,
        variableKey,
      },
    },
    create: {
      userId,
      programId: body.programId ?? null,
      date,
      variableKey,
      numValue: body.numValue ?? null,
      textValue: body.textValue ?? null,
      unit: body.unit ?? variable.unit,
      source,
    },
    update: {
      numValue: body.numValue ?? null,
      textValue: body.textValue ?? null,
      unit: body.unit ?? variable.unit,
      source,
      ...(body.programId !== undefined ? { programId: body.programId } : {}),
    },
    select: {
      id: true,
      date: true,
      variableKey: true,
      numValue: true,
      textValue: true,
      unit: true,
      source: true,
    },
  });

  return NextResponse.json({
    log: { ...row, date: row.date.toISOString().slice(0, 10) },
  });
}
