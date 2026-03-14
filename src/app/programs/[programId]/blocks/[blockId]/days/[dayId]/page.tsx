import Link from "next/link";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";

const dayTemplates: Record<
  string,
  {
    name: string;
    split: string;
    progression: string;
    exercises: {
      name: string;
      sets: number;
      reps: string;
      rest: string;
      progression: string;
    }[];
  }
> = {
  "day-1": {
    name: "Day 1 · Upper Push",
    split: "Push",
    progression: "Linear",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: "6-8", rest: "3 min", progression: "+2.5kg when all sets hit 8 reps" },
      { name: "Incline DB Press", sets: 3, reps: "8-10", rest: "2 min", progression: "+2.5kg when all sets hit 10 reps" },
      { name: "Overhead Press", sets: 3, reps: "6-8", rest: "2.5 min", progression: "+2.5kg when all sets hit 8 reps" },
      { name: "Cable Flyes", sets: 3, reps: "12-15", rest: "90 sec", progression: "+1 rep per session" },
      { name: "Lateral Raises", sets: 3, reps: "12-15", rest: "60 sec", progression: "+1 rep per session" },
      { name: "Tricep Pushdowns", sets: 3, reps: "10-12", rest: "60 sec", progression: "+2.5kg when all sets hit 12 reps" },
    ],
  },
  "day-2": {
    name: "Day 2 · Upper Pull",
    split: "Pull",
    progression: "Double",
    exercises: [
      { name: "Barbell Rows", sets: 4, reps: "6-8", rest: "3 min", progression: "+2.5kg when 2 sets hit 8 reps" },
      { name: "Weighted Pull-ups", sets: 3, reps: "6-8", rest: "3 min", progression: "+2.5kg when 2 sets hit 8 reps" },
      { name: "Cable Rows", sets: 3, reps: "10-12", rest: "2 min", progression: "+1 rep then +weight" },
      { name: "Face Pulls", sets: 3, reps: "15-20", rest: "60 sec", progression: "+1 rep per session" },
      { name: "Barbell Curls", sets: 3, reps: "8-10", rest: "90 sec", progression: "+1 rep then +weight" },
      { name: "Hammer Curls", sets: 3, reps: "10-12", rest: "60 sec", progression: "+1 rep then +weight" },
    ],
  },
  "day-3": {
    name: "Day 3 · Lower",
    split: "Lower",
    progression: "Wave",
    exercises: [
      { name: "Barbell Squat", sets: 4, reps: "5-6-7", rest: "3 min", progression: "Wave: 5@85%, 6@80%, 7@75% then +2.5kg" },
      { name: "Romanian Deadlift", sets: 3, reps: "8-10", rest: "2.5 min", progression: "Wave: cycle reps 8→10 then +weight" },
      { name: "Leg Press", sets: 3, reps: "10-12", rest: "2 min", progression: "Wave: cycle reps 10→12 then +weight" },
      { name: "Leg Curls", sets: 3, reps: "10-12", rest: "90 sec", progression: "Wave: cycle reps 10→12 then +weight" },
    ],
  },
  "day-4": {
    name: "Day 4 · Full Body",
    split: "Full Body",
    progression: "Linear",
    exercises: [
      { name: "Deadlift", sets: 3, reps: "5", rest: "4 min", progression: "+5kg when all sets hit 5 reps" },
      { name: "Dumbbell Bench Press", sets: 3, reps: "8-10", rest: "2 min", progression: "+2.5kg when all sets hit 10 reps" },
      { name: "Barbell Rows", sets: 3, reps: "8-10", rest: "2 min", progression: "+2.5kg when all sets hit 10 reps" },
      { name: "Walking Lunges", sets: 3, reps: "12 each", rest: "90 sec", progression: "+2.5kg when form is solid" },
      { name: "Overhead Press", sets: 3, reps: "8-10", rest: "2 min", progression: "+2.5kg when all sets hit 10 reps" },
      { name: "Plank Holds", sets: 3, reps: "45-60s", rest: "60 sec", progression: "+5s per session" },
    ],
  },
  "day-5": {
    name: "Day 5 · Arms + Delts",
    split: "Arms + Delts",
    progression: "Double",
    exercises: [
      { name: "Close-Grip Bench", sets: 3, reps: "8-10", rest: "2 min", progression: "+1 rep then +weight" },
      { name: "Barbell Curls", sets: 3, reps: "8-10", rest: "90 sec", progression: "+1 rep then +weight" },
      { name: "Skull Crushers", sets: 3, reps: "10-12", rest: "90 sec", progression: "+1 rep then +weight" },
      { name: "Incline Curls", sets: 3, reps: "10-12", rest: "60 sec", progression: "+1 rep then +weight" },
      { name: "Lateral Raises", sets: 4, reps: "12-15", rest: "60 sec", progression: "+1 rep per session" },
      { name: "Rear Delt Flyes", sets: 3, reps: "15-20", rest: "60 sec", progression: "+1 rep per session" },
    ],
  },
};

export default function DayTemplatePage({
  params,
}: {
  params: { programId: string; blockId: string; dayId: string };
}) {
  const template = dayTemplates[params.dayId] || dayTemplates["day-1"];

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href={`/programs/${params.programId}/blocks/${params.blockId}`}
        className="inline-flex items-center gap-1.5 text-ft-dim text-sm font-mono hover:text-ft-light transition-colors mb-6"
      >
        <span>←</span>
        <span>Block 2 · Accumulation</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight mb-1">
            {template.name}
          </h1>
          <p className="text-ft-dim text-sm font-mono">
            Day template · {template.exercises.length} exercises
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tag>{template.progression} Progression</Tag>
          <Link
            href="/log"
            className="bg-ft-white text-ft-bg font-mono text-sm font-bold px-4 py-2 rounded hover:bg-ft-light transition-colors"
          >
            Log Session →
          </Link>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {template.exercises.map((exercise, idx) => (
          <Card key={exercise.name}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-ft-muted text-xs font-mono font-bold mt-0.5 w-5">
                  {idx + 1}.
                </span>
                <div>
                  <h3 className="font-mono text-sm font-bold mb-1">
                    {exercise.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-ft-dim">
                    <span>{exercise.sets} sets</span>
                    <span className="text-ft-muted">×</span>
                    <span>{exercise.reps} reps</span>
                    <span className="text-ft-muted">·</span>
                    <span>{exercise.rest} rest</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-ft-border ml-8">
              <div className="flex items-center gap-2">
                <span className="text-ft-muted text-[10px] font-mono uppercase tracking-wider">
                  Progression
                </span>
                <span className="text-ft-light text-xs font-mono">
                  {exercise.progression}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
