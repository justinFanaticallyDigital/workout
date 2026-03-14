import { NextResponse } from "next/server";

// TODO: Connect to database — list all injuries (active and recovered),
// and log new injuries with body region, severity, and description.

export async function GET() {
  return NextResponse.json({
    injuries: [
      {
        id: "inj_1",
        bodyRegion: "Right Shoulder",
        severity: "mild",
        status: "active",
        loggedAt: "2026-02-20",
        description: "Slight impingement during overhead press",
      },
    ],
  });
}

export async function POST() {
  return NextResponse.json(
    {
      id: "inj_2",
      bodyRegion: "Lower Back",
      severity: "moderate",
      status: "active",
      loggedAt: "2026-03-14",
    },
    { status: 201 }
  );
}
