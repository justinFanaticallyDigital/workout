import { NextResponse } from "next/server";

// TODO: Connect to database — list all exercises in the library (with
// optional search/filter), and create custom exercises.

export async function GET() {
  return NextResponse.json({
    exercises: [
      { id: "ex_1", name: "Bench Press", muscleGroup: "Chest", equipment: "Barbell" },
      { id: "ex_2", name: "Squat", muscleGroup: "Quads", equipment: "Barbell" },
      { id: "ex_3", name: "Deadlift", muscleGroup: "Back", equipment: "Barbell" },
      { id: "ex_4", name: "OHP", muscleGroup: "Shoulders", equipment: "Barbell" },
    ],
  });
}

export async function POST() {
  return NextResponse.json(
    { id: "ex_5", name: "New Exercise", muscleGroup: "Other", equipment: "Other" },
    { status: 201 }
  );
}
