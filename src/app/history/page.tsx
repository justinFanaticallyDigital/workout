"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, Tag, EmptyState } from "@/components/ui";
import { authCheck } from "@/lib/fetch-helpers";

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
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const limit = 20;

  const fetchWorkouts = useCallback((off: number, append: boolean, from?: string, to?: string) => {
    const params = new URLSearchParams({ limit: String(limit), offset: String(off) });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    fetch(`/api/workouts?${params}`)
      .then(authCheck)
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
  }, []);

  useEffect(() => {
    fetchWorkouts(0, false);
  }, [fetchWorkouts]);

  const applyDateFilter = () => {
    setOffset(0);
    setLoading(true);
    fetchWorkouts(0, false, dateFrom || undefined, dateTo || undefined);
  };

  const clearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
    setOffset(0);
    setLoading(true);
    fetchWorkouts(0, false);
  };

  const loadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchWorkouts(newOffset, true, dateFrom || undefined, dateTo || undefined);
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

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-end gap-3 mb-5">
        <div>
          <label className="block text-ft-dim text-[10px] font-mono uppercase tracking-wider mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-ft-surface border border-ft-card rounded px-3 py-1.5 text-sm font-mono text-ft-white"
          />
        </div>
        <div>
          <label className="block text-ft-dim text-[10px] font-mono uppercase tracking-wider mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-ft-surface border border-ft-card rounded px-3 py-1.5 text-sm font-mono text-ft-white"
          />
        </div>
        <button
          onClick={applyDateFilter}
          disabled={!dateFrom && !dateTo}
          className="px-3 py-1.5 text-xs font-mono font-bold bg-ft-accent text-ft-bg rounded hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Filter
        </button>
        {(dateFrom || dateTo) && (
          <button
            onClick={clearDateFilter}
            className="px-3 py-1.5 text-xs font-mono text-ft-dim hover:text-ft-light transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {workouts.length === 0 ? (
        <EmptyState
          icon="barbell"
          title={dateFrom || dateTo ? "No workouts in this range" : "No workouts yet"}
          description={dateFrom || dateTo ? "Try adjusting your date range." : "Start logging workouts to see your history here."}
          actionLabel={dateFrom || dateTo ? undefined : "Log a workout"}
          actionHref={dateFrom || dateTo ? undefined : "/log"}
        />
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
