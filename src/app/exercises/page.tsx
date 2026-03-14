"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui";

const FILTERS = [
  "All",
  "Horizontal Push",
  "Vertical Pull",
  "Horizontal Pull",
  "Squat",
  "Hip Hinge",
  "Elbow Flexion",
  "Elbow Extension",
  "Shoulder Isolation",
] as const;

const EXERCISES = [
  {
    id: "bench-press-incline-barbell",
    exercise: "Bench Press - Incline Barbell",
    pattern: "Horizontal Push",
    primary: "Chest",
    pr: "185×6",
    sessions: 14,
  },
  {
    id: "bench-press-flat-barbell",
    exercise: "Bench Press - Flat Barbell",
    pattern: "Horizontal Push",
    primary: "Chest",
    pr: "205×5",
    sessions: 22,
  },
  {
    id: "pull-up-weighted-bodyweight",
    exercise: "Pull Up - Weighted Bodyweight",
    pattern: "Vertical Pull",
    primary: "Lats",
    pr: "BW+45×5",
    sessions: 18,
  },
  {
    id: "squat-lever-plate",
    exercise: "Squat - Lever Plate",
    pattern: "Squat",
    primary: "Quadriceps",
    pr: "225×8",
    sessions: 8,
  },
  {
    id: "deadlift-romanian-barbell",
    exercise: "Deadlift - Romanian Barbell",
    pattern: "Hip Hinge",
    primary: "Hamstrings",
    pr: "225×8",
    sessions: 16,
  },
  {
    id: "curl-barbell",
    exercise: "Curl - Barbell",
    pattern: "Elbow Flexion",
    primary: "Biceps",
    pr: "95×10",
    sessions: 20,
  },
  {
    id: "row-chest-supported-dumbbell",
    exercise: "Row - Chest Supported Dumbbell",
    pattern: "Horizontal Pull",
    primary: "Lats",
    pr: "55×12",
    sessions: 12,
  },
  {
    id: "raise-lateral-dumbbell",
    exercise: "Raise - Lateral Dumbbell",
    pattern: "Shoulder Isolation",
    primary: "Shoulders",
    pr: "30×12",
    sessions: 15,
  },
];

const COLUMNS = [
  { key: "exercise", label: "Exercise", className: "min-w-[200px]" },
  { key: "pattern", label: "Pattern" },
  { key: "primary", label: "Primary" },
  { key: "pr", label: "PR" },
  { key: "sessions", label: "Sessions", className: "w-[80px]" },
];

export default function ExerciseLibraryPage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const router = useRouter();

  const filtered =
    activeFilter === "All"
      ? EXERCISES
      : EXERCISES.filter((e) => e.pattern === activeFilter);

  return (
    <div className="min-h-screen bg-ft-bg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-ft-white font-mono font-bold text-2xl uppercase tracking-wider">
            Exercise Library
          </h1>
          <p className="text-ft-dim font-mono text-xs mt-1">
            205 exercises · 24 movement patterns
          </p>
        </div>
        <Link
          href="/exercises/new"
          className="bg-ft-white text-ft-bg font-mono text-sm font-bold px-4 py-2 rounded-lg hover:bg-ft-light transition-colors"
        >
          + Add Exercise
        </Link>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-mono rounded-md transition-colors ${
              activeFilter === filter
                ? "bg-ft-white text-ft-bg"
                : "bg-ft-card text-ft-light hover:bg-ft-muted"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Exercise Table */}
      <DataTable
        columns={COLUMNS}
        data={filtered}
        onRowClick={(row: Record<string, unknown>) => router.push(`/exercises/${row.id}`)}
      />
    </div>
  );
}
