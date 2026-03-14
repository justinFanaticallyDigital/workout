import { NextResponse } from "next/server";

// TODO: Connect to database — list all training programs for the user,
// and create new programs with blocks and day templates.

export async function GET() {
  return NextResponse.json({
    programs: [
      { id: "prog_1", name: "Upper/Lower Split", weeks: 8, status: "active" },
      { id: "prog_2", name: "PPL Hypertrophy", weeks: 6, status: "completed" },
    ],
  });
}

export async function POST() {
  return NextResponse.json(
    { id: "prog_3", name: "New Program", weeks: 0, status: "draft" },
    { status: 201 }
  );
}
