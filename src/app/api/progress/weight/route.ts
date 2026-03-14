import { NextResponse } from "next/server";

// TODO: Connect to database — fetch weight log entries for charting,
// and log new body weight entries with optional notes.

export async function GET() {
  return NextResponse.json({
    entries: [
      { date: "2025-10-01", weight: 204 },
      { date: "2025-11-01", weight: 202.5 },
      { date: "2025-12-01", weight: 201 },
      { date: "2026-01-01", weight: 200 },
      { date: "2026-02-01", weight: 199 },
      { date: "2026-03-14", weight: 198.4 },
    ],
  });
}

export async function POST() {
  return NextResponse.json(
    { id: "wt_1", date: "2026-03-14", weight: 198.4 },
    { status: 201 }
  );
}
