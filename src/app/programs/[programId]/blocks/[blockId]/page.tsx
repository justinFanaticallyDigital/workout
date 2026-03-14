import Link from "next/link";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import Stat from "@/components/ui/Stat";

const trainingDays = [
  {
    id: "day-1",
    name: "Day 1 · Upper Push",
    progression: "Linear",
    exercises: [
      "Barbell Bench Press",
      "Incline DB Press",
      "Overhead Press",
      "Cable Flyes",
      "Lateral Raises",
      "Tricep Pushdowns",
    ],
  },
  {
    id: "day-2",
    name: "Day 2 · Upper Pull",
    progression: "Double",
    exercises: [
      "Barbell Rows",
      "Weighted Pull-ups",
      "Cable Rows",
      "Face Pulls",
      "Barbell Curls",
      "Hammer Curls",
    ],
  },
  {
    id: "day-3",
    name: "Day 3 · Lower",
    progression: "Wave",
    exercises: [
      "Barbell Squat",
      "Romanian Deadlift",
      "Leg Press",
      "Leg Curls",
    ],
  },
  {
    id: "day-4",
    name: "Day 4 · Full Body",
    progression: "Linear",
    exercises: [
      "Deadlift",
      "Dumbbell Bench Press",
      "Barbell Rows",
      "Walking Lunges",
      "Overhead Press",
      "Plank Holds",
    ],
  },
  {
    id: "day-5",
    name: "Day 5 · Arms + Delts",
    progression: "Double",
    exercises: [
      "Close-Grip Bench",
      "Barbell Curls",
      "Skull Crushers",
      "Incline Curls",
      "Lateral Raises",
      "Rear Delt Flyes",
    ],
  },
];

// Week schedule grid: which days are training days (Mon-Sun)
const weekSchedule = [
  { week: 1, days: ["D1", null, "D2", null, "D3", "D4", "D5"] },
  { week: 2, days: ["D1", null, "D2", null, "D3", "D4", "D5"] },
  { week: 3, days: ["D1", null, "D2", null, "D3", "D4", "D5"] },
];

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function BlockDetailPage({
  params,
}: {
  params: { programId: string; blockId: string };
}) {
  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href={`/programs/${params.programId}`}
        className="inline-flex items-center gap-1.5 text-ft-dim text-sm font-mono hover:text-ft-light transition-colors mb-6"
      >
        <span>←</span>
        <span>Programs / Hypertrophy Block Series</span>
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-mono text-2xl font-bold tracking-tight mb-1">
          Block 2 · Accumulation
        </h1>
        <p className="text-ft-dim text-sm font-mono">
          Weeks 7-12 · 5 day split · Volume focus
        </p>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        <Card>
          <Stat label="Weeks" value="3/6" small />
        </Card>
        <Card>
          <Stat label="Sessions" value="14" small />
        </Card>
        <Card>
          <Stat label="Avg Volume" value="8,420" small />
        </Card>
        <Card>
          <Stat label="Progression" value="Mixed" small />
        </Card>
        <Card>
          <Stat label="Schedule" value="5x/wk" small />
        </Card>
      </div>

      {/* Week Schedule Grid */}
      <h2 className="font-mono text-lg font-bold text-ft-light mb-4">
        Week Schedule
      </h2>
      <Card className="mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-ft-dim text-[10px] uppercase tracking-widest font-mono pb-3 pr-4">
                  Week
                </th>
                {dayLabels.map((day) => (
                  <th
                    key={day}
                    className="text-center text-ft-dim text-[10px] uppercase tracking-widest font-mono pb-3 px-2"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weekSchedule.map((row) => (
                <tr key={row.week} className="border-t border-ft-border">
                  <td className="text-ft-light text-sm font-mono py-3 pr-4">
                    Week {row.week}
                  </td>
                  {row.days.map((cell, idx) => (
                    <td key={idx} className="text-center py-3 px-2">
                      {cell ? (
                        <span className="inline-block bg-ft-card text-ft-white text-xs font-mono font-bold px-2 py-1 rounded">
                          {cell}
                        </span>
                      ) : (
                        <span className="text-ft-muted text-xs">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Training Days */}
      <h2 className="font-mono text-lg font-bold text-ft-light mb-4">
        Training Days
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trainingDays.map((day) => (
          <Link
            key={day.id}
            href={`/programs/${params.programId}/blocks/${params.blockId}/days/${day.id}`}
          >
            <Card className="hover:border-ft-dim transition-colors h-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-sm font-bold">{day.name}</h3>
                <Tag>{day.progression}</Tag>
              </div>
              <ul className="space-y-1.5">
                {day.exercises.map((exercise) => (
                  <li
                    key={exercise}
                    className="text-ft-dim text-xs font-mono flex items-center gap-2"
                  >
                    <span className="text-ft-muted">·</span>
                    {exercise}
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-ft-border">
                <Link
                  href="/log"
                  className="text-ft-dim text-[10px] font-mono uppercase tracking-wider hover:text-ft-light transition-colors"
                >
                  Go to Log →
                </Link>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
