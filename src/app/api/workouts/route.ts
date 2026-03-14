import { NextResponse } from "next/server";

// TODO: Connect to database — start a new workout session, optionally
// linked to a program day template. Records start time and status.

export async function POST() {
  return NextResponse.json(
    {
      id: "wkt_1",
      status: "in_progress",
      startedAt: new Date().toISOString(),
      exercises: [],
    },
    { status: 201 }
  );
}
