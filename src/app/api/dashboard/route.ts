import { NextResponse } from "next/server";

// TODO: Connect to database — aggregate current program, recent workouts,
// weekly volume, streak count, and upcoming session for dashboard display.

export async function GET() {
  return NextResponse.json({
    currentProgram: { id: "prog_1", name: "Upper/Lower Split", week: 6 },
    weeklyVolume: 41000,
    streak: 12,
    recentPR: { exercise: "Bench Press", weight: 245, reps: 3, date: "2026-03-12" },
    nextSession: { name: "Upper A", scheduledFor: "2026-03-15" },
  });
}
