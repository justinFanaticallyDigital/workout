"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, Tag } from "@/components/ui";

interface WorkoutSummary {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
  blockDay: { name: string } | null;
  exercises: {
    exercise: { name: string };
    sets: { weight: number | null; reps: number | null; isWarmup: boolean }[];
  }[];
}

function formatDuration(start: string | null, end: string | null): string {
  if (!start || !end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function calcVolume(exercises: WorkoutSummary["exercises"]): number {
  let vol = 0;
  for (const ex of exercises) {
    for (const s of ex.sets) {
      if (s.weight && s.reps && !s.isWarmup) {
        vol += Number(s.weight) * s.reps;
      }
    }
  }
  return vol;
}

export default function HistoryPage() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const fetchWorkouts = (off: number, append: boolean) => {
    fetch(`/api/workouts?limit=${limit}&offset=${off}`)
      .then((res) => res.json())
      .then((data) => {
        const fetched = data.workouts ?? [];
        if (append) {
          setWorkouts((prev) => [...prev, ...fetched]);
        } else {
          setWorkouts(fetched);
        }
        setHasMore(fetched.length === limit);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkouts(0, false);
  }, []);

  const loadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchWorkouts(newOffset, true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ft-bg flex items-center justify-center">
        <p className="text-ft-dim font-mono text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-mono font-bold tracking-wide">
          Workout History
        </h1>
        <p className="text-ft-dim text-sm font-mono mt-1">
          {workouts.length > 0
            ? `${workouts.length}${hasMore ? "+" : ""} sessions`
            : "No workouts logged yet"}
        </p>
      </div>

      {workouts.length === 0 ? (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-ft-muted text-sm font-mono">No workouts yet</p>
            <Link
              href="/log"
              className="mt-3 text-ft-dim text-xs font-mono hover:text-ft-light transition-colors border border-ft-border rounded px-3 py-1"
            >
              Log your first workout
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {workouts.map((w) => {
            const volume = calcVolume(w.exercises);
            const exerciseNames = w.exercises
              .slice(0, 4)
              .map((e) => e.exercise.name);
            const setCount = w.exercises.reduce(
              (sum, e) => sum + e.sets.filter((s) => !s.isWarmup).length,
              0
            );

            return (
              <Link key={w.id} href={`/history/${w.id}`}>
                <Card className="hover:border-ft-dim transition-colors mb-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-ft-white text-sm font-mono font-bold">
                          {new Date(w.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {w.blockDay && (
                          <Tag>{w.blockDay.name}</Tag>
                        )}
                      </div>
                      <p className="text-ft-dim text-xs font-mono">
                        {exerciseNames.join(", ")}
                        {w.exercises.length > 4 && ` +${w.exercises.length - 4} more`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-ft-light text-xs font-mono font-bold">
                          {volume > 0 ? `${volume.toLocaleString()} lbs` : "—"}
                        </p>
                        <p className="text-ft-muted text-[10px] font-mono">volume</p>
                      </div>
                      <div>
                        <p className="text-ft-light text-xs font-mono font-bold">{setCount}</p>
                        <p className="text-ft-muted text-[10px] font-mono">sets</p>
                      </div>
                      <div>
                        <p className="text-ft-light text-xs font-mono font-bold">
                          {formatDuration(w.startTime, w.endTime)}
                        </p>
                        <p className="text-ft-muted text-[10px] font-mono">time</p>
                      </div>
                      <span className="text-ft-muted text-sm">&rarr;</span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}

          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full border border-dashed border-ft-card rounded py-3 text-ft-dim text-xs font-mono hover:border-ft-dim hover:text-ft-light transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}
