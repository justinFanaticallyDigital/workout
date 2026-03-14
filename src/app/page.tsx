import Link from "next/link";
import Card from "@/components/ui/Card";
import Stat from "@/components/ui/Stat";
import Tag from "@/components/ui/Tag";
import ProgressBar from "@/components/ui/ProgressBar";
import SectionHeader from "@/components/ui/SectionHeader";

const weekDays = [
  { day: "Mon", completed: true },
  { day: "Tue", completed: false },
  { day: "Wed", completed: true },
  { day: "Thu", completed: false },
  { day: "Fri", completed: true },
  { day: "Sat", completed: false },
  { day: "Sun", completed: false },
];

const recentPRs = [
  { exercise: "Bench Press", date: "Mar 10", weight: 225, reps: 3 },
  { exercise: "Squat", date: "Mar 7", weight: 295, reps: 1 },
  { exercise: "Deadlift", date: "Mar 5", weight: 365, reps: 2 },
];

const muscleVolume = [
  { group: "Chest", volume: "8,400", intensity: 0.9 },
  { group: "Back", volume: "9,200", intensity: 1.0 },
  { group: "Shoulders", volume: "4,800", intensity: 0.6 },
  { group: "Quads", volume: "7,600", intensity: 0.8 },
  { group: "Hamstrings", volume: "5,100", intensity: 0.65 },
  { group: "Arms", volume: "3,200", intensity: 0.4 },
];

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-mono font-bold text-ft-white tracking-wide">
          Dashboard
        </h1>
        <p className="text-ft-dim text-sm font-mono mt-1">
          Block 2 &middot; Week 3 of 6 &middot; Day 12 of 30
        </p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <Stat label="This Week" value="3/5" sub="sessions" />
        </Card>
        <Card>
          <Stat label="Block Volume" value="42,850" sub="lbs" />
        </Card>
        <Card>
          <Stat label="Streak" value="14d" sub="consecutive" />
        </Card>
        <Card>
          <Stat label="Body Weight" value="198.4" sub="lbs" />
        </Card>
      </div>

      {/* Week View + Quick Log */}
      <div className="grid grid-cols-3 gap-4">
        {/* Week View */}
        <Card className="col-span-2">
          <SectionHeader title="Week View" subtitle="Week 3" />
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map(({ day, completed }) => (
              <div
                key={day}
                className={`flex flex-col items-center gap-2 py-3 rounded-md border ${
                  completed
                    ? "border-ft-light bg-ft-card"
                    : "border-ft-border bg-ft-surface"
                }`}
              >
                <span className="text-ft-dim text-[10px] font-mono uppercase">
                  {day}
                </span>
                <span
                  className={`text-lg ${
                    completed ? "text-ft-white" : "text-ft-muted"
                  }`}
                >
                  {completed ? "\u2713" : "\u2013"}
                </span>
              </div>
            ))}
          </div>
          <ProgressBar value={3} max={5} label="Sessions" showValues />
        </Card>

        {/* Quick Log */}
        <Link href="/log" className="block">
          <Card className="h-full flex flex-col items-center justify-center text-center hover:border-ft-dim transition-colors cursor-pointer">
            <span className="text-5xl text-ft-dim mb-3">+</span>
            <span className="text-ft-white font-mono font-bold text-lg">
              Log Workout
            </span>
            <span className="text-ft-dim text-xs font-mono mt-1">
              Next: Upper Body 2
            </span>
          </Card>
        </Link>
      </div>

      {/* Recent PRs + Block Benchmarks */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent PRs */}
        <Card>
          <SectionHeader title="Recent PRs" />
          <div className="space-y-3">
            {recentPRs.map((pr) => (
              <div
                key={pr.exercise}
                className="flex items-center justify-between py-2 border-b border-ft-border last:border-0"
              >
                <div className="flex flex-col">
                  <span className="text-ft-white text-sm font-mono font-bold">
                    {pr.exercise}
                  </span>
                  <span className="text-ft-dim text-xs font-mono">
                    {pr.date}
                  </span>
                </div>
                <Tag variant="success">
                  {pr.weight}&times;{pr.reps}
                </Tag>
              </div>
            ))}
          </div>
        </Card>

        {/* Block Benchmarks */}
        <Card>
          <SectionHeader title="Block Benchmarks" />
          <div className="space-y-4">
            <ProgressBar
              value={3.2}
              max={3.5}
              label="Avg Frequency"
              showValues
            />
            <ProgressBar
              value={295}
              max={315}
              label="Squat 1RM"
              showValues
            />
            <ProgressBar
              value={198}
              max={195}
              label="Body Weight"
              showValues
            />
          </div>
        </Card>
      </div>

      {/* Weekly Volume by Muscle */}
      <Card>
        <SectionHeader title="Weekly Volume by Muscle" />
        <div className="grid grid-cols-6 gap-3">
          {muscleVolume.map(({ group, volume, intensity }) => (
            <div
              key={group}
              className="flex flex-col items-center gap-2 py-3 rounded-md bg-ft-card border border-ft-border"
              style={{ opacity: 0.3 + intensity * 0.7 }}
            >
              <span className="text-ft-dim text-[10px] font-mono uppercase tracking-wider">
                {group}
              </span>
              <span className="text-ft-white font-mono font-bold text-sm">
                {volume}
              </span>
              <span className="text-ft-dim text-[10px] font-mono">lbs</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
