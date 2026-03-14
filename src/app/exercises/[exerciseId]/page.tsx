import Link from "next/link";
import { Card, SectionHeader, Stat, Tag } from "@/components/ui";

const EXERCISES: Record<
  string,
  {
    name: string;
    pattern: string;
    primary: string;
    secondary: string;
    pr: string;
    prDate: string;
    e1rm: string;
    sessions: number;
  }
> = {
  "bench-press-incline-barbell": {
    name: "Bench Press - Incline Barbell",
    pattern: "Horizontal Push",
    primary: "Chest",
    secondary: "Front Deltoids, Triceps",
    pr: "185×6",
    prDate: "Feb 28, 2026",
    e1rm: "214 lb",
    sessions: 14,
  },
  "bench-press-flat-barbell": {
    name: "Bench Press - Flat Barbell",
    pattern: "Horizontal Push",
    primary: "Chest",
    secondary: "Front Deltoids, Triceps",
    pr: "205×5",
    prDate: "Mar 7, 2026",
    e1rm: "230 lb",
    sessions: 22,
  },
  "pull-up-weighted-bodyweight": {
    name: "Pull Up - Weighted Bodyweight",
    pattern: "Vertical Pull",
    primary: "Lats",
    secondary: "Biceps, Rear Deltoids",
    pr: "BW+45×5",
    prDate: "Mar 3, 2026",
    e1rm: "—",
    sessions: 18,
  },
  "squat-lever-plate": {
    name: "Squat - Lever Plate",
    pattern: "Squat",
    primary: "Quadriceps",
    secondary: "Glutes, Adductors",
    pr: "225×8",
    prDate: "Feb 20, 2026",
    e1rm: "281 lb",
    sessions: 8,
  },
  "deadlift-romanian-barbell": {
    name: "Deadlift - Romanian Barbell",
    pattern: "Hip Hinge",
    primary: "Hamstrings",
    secondary: "Glutes, Erectors",
    pr: "225×8",
    prDate: "Mar 1, 2026",
    e1rm: "281 lb",
    sessions: 16,
  },
  "curl-barbell": {
    name: "Curl - Barbell",
    pattern: "Elbow Flexion",
    primary: "Biceps",
    secondary: "Brachialis, Forearms",
    pr: "95×10",
    prDate: "Mar 10, 2026",
    e1rm: "127 lb",
    sessions: 20,
  },
  "row-chest-supported-dumbbell": {
    name: "Row - Chest Supported Dumbbell",
    pattern: "Horizontal Pull",
    primary: "Lats",
    secondary: "Rear Deltoids, Biceps",
    pr: "55×12",
    prDate: "Feb 25, 2026",
    e1rm: "78 lb",
    sessions: 12,
  },
  "raise-lateral-dumbbell": {
    name: "Raise - Lateral Dumbbell",
    pattern: "Shoulder Isolation",
    primary: "Shoulders",
    secondary: "Upper Traps",
    pr: "30×12",
    prDate: "Mar 5, 2026",
    e1rm: "43 lb",
    sessions: 15,
  },
};

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;
  const exercise = EXERCISES[exerciseId];

  if (!exercise) {
    return (
      <div className="min-h-screen bg-ft-bg p-6">
        <Link
          href="/exercises"
          className="text-ft-dim font-mono text-xs uppercase tracking-wider hover:text-ft-light transition-colors"
        >
          ← Exercises
        </Link>
        <p className="text-ft-light font-mono mt-8">Exercise not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ft-bg p-6">
      {/* Breadcrumb */}
      <Link
        href="/exercises"
        className="text-ft-dim font-mono text-xs uppercase tracking-wider hover:text-ft-light transition-colors"
      >
        ← Exercises
      </Link>

      {/* Exercise Header */}
      <div className="mt-4 mb-6">
        <h1 className="text-ft-white font-mono font-bold text-2xl uppercase tracking-wider">
          {exercise.name}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <Tag>{exercise.pattern}</Tag>
          <span className="text-ft-dim font-mono text-xs">
            {exercise.primary}
          </span>
          <span className="text-ft-muted font-mono text-xs">·</span>
          <span className="text-ft-muted font-mono text-xs">
            {exercise.secondary}
          </span>
        </div>
      </div>

      {/* PR Section */}
      <div className="mb-8">
        <SectionHeader title="Personal Records" />
        <Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <Stat label="Best Set" value={exercise.pr} sub={exercise.prDate} />
            <Stat label="Est. 1RM" value={exercise.e1rm} />
            <Stat label="Total Sessions" value={exercise.sessions} />
            <Stat
              label="Avg Frequency"
              value={`${(exercise.sessions / 12).toFixed(1)}/mo`}
            />
          </div>
        </Card>
      </div>

      {/* History Section */}
      <div className="mb-8">
        <SectionHeader title="Volume Over Time" />
        <Card>
          <div className="h-48 flex items-center justify-center">
            <span className="text-ft-muted font-mono text-xs uppercase tracking-wider">
              Volume chart placeholder
            </span>
          </div>
        </Card>
      </div>

      <div>
        <SectionHeader title="Session History" />
        <Card>
          <div className="h-48 flex items-center justify-center">
            <span className="text-ft-muted font-mono text-xs uppercase tracking-wider">
              Session history table placeholder
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
