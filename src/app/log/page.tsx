import Link from "next/link";
import { Card, SectionHeader, Tag } from "@/components/ui";

const dayTemplates = [
  {
    id: "new-day-1",
    day: 1,
    name: "Upper Push",
    exercises: 5,
    focus: "Chest, Shoulders, Triceps",
  },
  {
    id: "new-day-2",
    day: 2,
    name: "Lower Pull",
    exercises: 5,
    focus: "Hamstrings, Glutes, Back",
  },
  {
    id: "new-day-3",
    day: 3,
    name: "Upper Pull",
    exercises: 5,
    focus: "Back, Biceps, Rear Delts",
  },
  {
    id: "new-day-4",
    day: 4,
    name: "Lower Push",
    exercises: 5,
    focus: "Quads, Calves, Core",
  },
  {
    id: "new-day-5",
    day: 5,
    name: "Arms & Accessories",
    exercises: 6,
    focus: "Biceps, Triceps, Forearms",
  },
];

export default function LogWorkoutPage() {
  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-4 pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <h1 className="font-mono text-2xl font-bold text-ft-white mb-1">
        Log Workout
      </h1>
      <p className="text-ft-dim text-sm font-mono mb-6">
        Block 2 &middot; Week 3
      </p>

      {/* Day Templates */}
      <SectionHeader title="Day Templates" subtitle="5 days" />
      <div className="flex flex-col gap-3 mb-8">
        {dayTemplates.map((tmpl) => (
          <Link key={tmpl.id} href={`/log/${tmpl.id}`}>
            <Card className="hover:border-ft-light transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-ft-dim font-mono text-xs w-6 shrink-0">
                    D{tmpl.day}
                  </span>
                  <div>
                    <p className="text-ft-white font-mono text-sm font-bold">
                      Day {tmpl.day} &middot; {tmpl.name}
                    </p>
                    <p className="text-ft-dim text-xs mt-0.5">{tmpl.focus}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Tag>{tmpl.exercises} exercises</Tag>
                  <span className="text-ft-muted text-lg">&rsaquo;</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Blank Workout */}
      <SectionHeader title="Quick Start" />
      <Link href="/log/new-blank">
        <Card className="border-dashed hover:border-ft-light transition-colors">
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="text-ft-dim text-lg">+</span>
            <span className="text-ft-light font-mono text-sm">
              Start Blank Workout
            </span>
          </div>
        </Card>
      </Link>
    </div>
  );
}
