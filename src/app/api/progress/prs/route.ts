import { NextResponse } from "next/server";

// TODO: Connect to database — fetch PR timeline showing all personal
// records sorted by date, with exercise details and e1RM values.

export async function GET() {
  return NextResponse.json({
    prs: [
      { date: "2026-03-12", exercise: "Bench Press", weight: 245, reps: 3, e1rm: 260 },
      { date: "2026-03-08", exercise: "Squat", weight: 315, reps: 5, e1rm: 354 },
      { date: "2026-03-01", exercise: "Deadlift", weight: 405, reps: 1, e1rm: 405 },
      { date: "2026-02-22", exercise: "OHP", weight: 155, reps: 4, e1rm: 170 },
      { date: "2026-02-15", exercise: "Barbell Row", weight: 205, reps: 6, e1rm: 239 },
    ],
  });
}
