"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, SectionHeader, Tag } from "@/components/ui";

interface SetDetail {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  rpe: number | null;
  isWarmup: boolean;
  isPr: boolean;
}

interface WorkoutExercise {
  id: string;
  exercise: { name: string; equipment: string | null; movementPattern: string | null };
  sets: SetDetail[];
  notes: string | null;
}

interface WorkoutDetail {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
  rating: number | null;
  blockDay: { name: string } | null;
  exercises: WorkoutExercise[];
}

function formatDuration(start: string | null, end: string | null): string {
  if (!start || !end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const [workoutId, setWorkoutId] = useState("");
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setWorkoutId(p.workoutId));
  }, [params]);

  useEffect(() => {
    if (!workoutId) return;
    fetch(`/api/workouts/${workoutId}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        setWorkout(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [workoutId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ft-bg flex items-center justify-center">
        <p className="text-ft-dim font-mono text-sm">Loading...</p>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-ft-bg text-ft-white p-6">
        <Link
          href="/history"
          className="text-ft-dim text-sm font-mono hover:text-ft-light transition-colors"
        >
          &larr; History
        </Link>
        <p className="text-ft-light font-mono mt-8">Workout not found.</p>
      </div>
    );
  }

  // Compute stats
  let totalVolume = 0;
  let totalSets = 0;
  let prCount = 0;
  for (const ex of workout.exercises) {
    for (const s of ex.sets) {
      if (!s.isWarmup) {
        totalSets++;
        if (s.weight && s.reps) totalVolume += Number(s.weight) * s.reps;
        if (s.isPr) prCount++;
      }
    }
  }

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/history"
        className="inline-flex items-center gap-1.5 text-ft-dim text-sm font-mono hover:text-ft-light transition-colors mb-6"
      >
        <span>&larr;</span>
        <span>History</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight mb-1">
            {new Date(workout.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h1>
          <div className="flex items-center gap-2">
            {workout.blockDay && (
              <Tag>{workout.blockDay.name}</Tag>
            )}
            <span className="text-ft-dim text-sm font-mono">
              {formatDuration(workout.startTime, workout.endTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card>
          <p className="text-ft-dim text-[10px] font-mono uppercase tracking-wider">Exercises</p>
          <p className="text-ft-white text-lg font-mono font-bold">{workout.exercises.length}</p>
        </Card>
        <Card>
          <p className="text-ft-dim text-[10px] font-mono uppercase tracking-wider">Work Sets</p>
          <p className="text-ft-white text-lg font-mono font-bold">{totalSets}</p>
        </Card>
        <Card>
          <p className="text-ft-dim text-[10px] font-mono uppercase tracking-wider">Volume</p>
          <p className="text-ft-white text-lg font-mono font-bold">
            {totalVolume > 0 ? totalVolume.toLocaleString() : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-ft-dim text-[10px] font-mono uppercase tracking-wider">PRs</p>
          <p className={`text-lg font-mono font-bold ${prCount > 0 ? "text-ft-success" : "text-ft-white"}`}>
            {prCount}
          </p>
        </Card>
      </div>

      {/* Exercises */}
      <SectionHeader title="Exercises" />
      <div className="space-y-4">
        {workout.exercises.map((ex, idx) => {
          const workSets = ex.sets.filter((s) => !s.isWarmup);
          const warmupSets = ex.sets.filter((s) => s.isWarmup);

          return (
            <Card key={ex.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-ft-muted text-xs font-mono font-bold w-5">
                  {idx + 1}.
                </span>
                <h3 className="font-mono text-sm font-bold text-ft-white">
                  {ex.exercise.name}
                </h3>
                {ex.exercise.movementPattern && (
                  <Tag>{ex.exercise.movementPattern}</Tag>
                )}
              </div>

              {/* Set Table */}
              <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr] gap-1.5 mb-1">
                <span className="text-ft-muted text-[10px] font-mono uppercase text-center">Set</span>
                <span className="text-ft-muted text-[10px] font-mono uppercase text-center">Weight</span>
                <span className="text-ft-muted text-[10px] font-mono uppercase text-center">Reps</span>
                <span className="text-ft-muted text-[10px] font-mono uppercase text-center">RIR</span>
                <span className="text-ft-muted text-[10px] font-mono uppercase text-center">RPE</span>
              </div>

              {warmupSets.length > 0 && (
                <>
                  {warmupSets.map((s) => (
                    <div key={s.setNumber} className="grid grid-cols-[40px_1fr_1fr_1fr_1fr] gap-1.5 mb-1">
                      <span className="text-ft-muted text-xs font-mono text-center">W</span>
                      <span className="text-ft-muted text-xs font-mono text-center">{s.weight ?? "—"}</span>
                      <span className="text-ft-muted text-xs font-mono text-center">{s.reps ?? "—"}</span>
                      <span className="text-ft-muted text-xs font-mono text-center">{s.rir ?? "—"}</span>
                      <span className="text-ft-muted text-xs font-mono text-center">{s.rpe ?? "—"}</span>
                    </div>
                  ))}
                </>
              )}

              {workSets.map((s, si) => (
                <div key={s.setNumber} className="grid grid-cols-[40px_1fr_1fr_1fr_1fr] gap-1.5 mb-1">
                  <span className="text-ft-dim text-xs font-mono text-center">{si + 1}</span>
                  <span className={`text-xs font-mono text-center ${s.isPr ? "text-ft-success font-bold" : "text-ft-light"}`}>
                    {s.weight ?? "—"}{s.isPr ? " PR" : ""}
                  </span>
                  <span className="text-ft-light text-xs font-mono text-center">{s.reps ?? "—"}</span>
                  <span className="text-ft-dim text-xs font-mono text-center">{s.rir ?? "—"}</span>
                  <span className="text-ft-dim text-xs font-mono text-center">{s.rpe ?? "—"}</span>
                </div>
              ))}

              {ex.notes && (
                <p className="text-ft-dim text-xs font-mono mt-2 pt-2 border-t border-ft-border">
                  {ex.notes}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Workout Notes */}
      {workout.notes && (
        <Card className="mt-4">
          <SectionHeader title="Session Notes" />
          <p className="text-ft-dim text-sm font-mono">{workout.notes}</p>
        </Card>
      )}
    </div>
  );
}
