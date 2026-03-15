"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, SectionHeader, Tag } from "@/components/ui";

interface SetData {
  set: number;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  done: boolean;
}

interface ExerciseData {
  id: string;
  name: string;
  shortName: string;
  category: string;
  targetSets: number;
  targetRepRange: string;
  sets: SetData[];
}

interface BlockDayData {
  id: string;
  name: string;
  dayNumber: number;
  block: { name: string };
  exercises: {
    id: string;
    exercise: { name: string; movementPattern: string | null };
    targetSets: number | null;
    targetRepRange: string | null;
    progressionType: string;
  }[];
}

function isExerciseComplete(ex: ExerciseData) {
  return ex.sets.length > 0 && ex.sets.every((s) => s.done);
}

function makeShortName(name: string): string {
  // Take first word(s) up to ~12 chars
  const parts = name.split(/[-·]/);
  return parts[0].trim().slice(0, 12);
}

export default function ActiveWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const [workoutId, setWorkoutId] = useState<string>("");
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [dayInfo, setDayInfo] = useState<{ name: string; blockName: string } | null>(null);
  const [activeEx, setActiveEx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState("0:00");

  // Resolve params
  useEffect(() => {
    params.then((p) => setWorkoutId(p.workoutId));
  }, [params]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setElapsed(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Load block day exercises (the workoutId here is actually the blockDay ID from /log)
  useEffect(() => {
    if (!workoutId || workoutId === "new-blank") return;

    // Fetch the block day template to get exercises
    fetch(`/api/blocks/day/${workoutId}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data: BlockDayData | null) => {
        if (!data) {
          setLoading(false);
          return;
        }
        setDayInfo({ name: data.name, blockName: data.block.name });
        setExercises(
          data.exercises.map((bde) => ({
            id: bde.id,
            name: bde.exercise.name,
            shortName: makeShortName(bde.exercise.name),
            category: bde.exercise.movementPattern || "—",
            targetSets: bde.targetSets ?? 3,
            targetRepRange: bde.targetRepRange ?? "8-12",
            sets: Array.from({ length: bde.targetSets ?? 3 }, (_, i) => ({
              set: i + 1,
              weight: null,
              reps: null,
              rir: null,
              done: false,
            })),
          }))
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [workoutId]);

  const updateSet = useCallback(
    (exIdx: number, setIdx: number, field: keyof SetData, value: unknown) => {
      setExercises((prev) =>
        prev.map((ex, ei) =>
          ei !== exIdx
            ? ex
            : {
                ...ex,
                sets: ex.sets.map((s, si) =>
                  si !== setIdx ? s : { ...s, [field]: value }
                ),
              }
        )
      );
    },
    []
  );

  const addSet = useCallback((exIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, ei) =>
        ei !== exIdx
          ? ex
          : {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  set: ex.sets.length + 1,
                  weight: null,
                  reps: null,
                  rir: null,
                  done: false,
                },
              ],
            }
      )
    );
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ft-bg text-ft-white flex items-center justify-center">
        <p className="text-ft-dim font-mono text-sm">Loading workout...</p>
      </div>
    );
  }

  // Blank workout or no template found
  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-ft-bg text-ft-white p-4 max-w-2xl mx-auto">
        <Link
          href="/log"
          className="text-ft-dim hover:text-ft-light text-sm font-mono transition-colors"
        >
          &larr; Back
        </Link>
        <Card className="mt-6">
          <p className="text-ft-muted font-mono text-sm text-center py-8">
            No template found for this day. Use the exercise library to add exercises to your workout.
          </p>
        </Card>
      </div>
    );
  }

  const current = exercises[activeEx];

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-ft-bg border-b border-ft-card px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/log"
            className="text-ft-dim hover:text-ft-light text-sm font-mono transition-colors"
          >
            &larr; {dayInfo?.blockName ?? "Back"}
          </Link>
          <span className="text-ft-muted text-sm font-mono">/</span>
          <span className="text-ft-dim text-sm font-mono">
            {dayInfo?.name ?? "Workout"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-mono text-lg font-bold text-ft-white">
              {dayInfo?.name ?? "Workout"}
            </h1>
            <p className="text-ft-dim text-xs font-mono mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-ft-surface border border-ft-card rounded px-2.5 py-1.5">
              <span className="text-ft-dim text-xs font-mono">&#9201;</span>
              <span className="text-ft-light text-sm font-mono tabular-nums">
                {elapsed}
              </span>
            </div>
            <button className="bg-ft-success/20 text-ft-success font-mono text-sm font-bold px-4 py-1.5 rounded hover:bg-ft-success/30 transition-colors">
              Finish
            </button>
          </div>
        </div>
      </div>

      {/* Exercise Tabs */}
      <div className="px-4 mt-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {exercises.map((ex, i) => {
            const complete = isExerciseComplete(ex);
            const isActive = i === activeEx;
            return (
              <button
                key={ex.id}
                onClick={() => setActiveEx(i)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs transition-colors ${
                  isActive
                    ? "bg-ft-white text-ft-bg font-bold"
                    : "bg-ft-surface text-ft-dim hover:text-ft-light border border-ft-card"
                }`}
              >
                <span>{complete ? "\u2713" : `E${i + 1}`}</span>
                <span>{ex.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Active Exercise Detail */}
        <Card>
          <div className="mb-4">
            <h2 className="font-mono text-base font-bold text-ft-white">
              {current.name}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Tag>{current.category}</Tag>
            </div>
          </div>

          {/* Target */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 bg-ft-bg rounded p-2.5">
              <p className="text-ft-dim text-[11px] font-mono uppercase tracking-wider mb-0.5">
                Target
              </p>
              <p className="text-ft-light text-sm font-mono font-bold">
                {current.targetSets}&times;{current.targetRepRange}
              </p>
            </div>
          </div>

          {/* Set Table */}
          <div className="mb-3">
            <div className="grid grid-cols-[40px_1fr_1fr_1fr_36px] gap-1.5 mb-1.5">
              <span className="text-ft-dim text-[11px] font-mono uppercase text-center">
                Set
              </span>
              <span className="text-ft-dim text-[11px] font-mono uppercase text-center">
                Weight
              </span>
              <span className="text-ft-dim text-[11px] font-mono uppercase text-center">
                Reps
              </span>
              <span className="text-ft-dim text-[11px] font-mono uppercase text-center">
                RIR
              </span>
              <span className="text-ft-dim text-[11px] font-mono uppercase text-center">
                &#10003;
              </span>
            </div>

            {current.sets.map((s, si) => (
              <div
                key={si}
                className="grid grid-cols-[40px_1fr_1fr_1fr_36px] gap-1.5 mb-1.5"
              >
                <div className="flex items-center justify-center">
                  <span className="text-ft-dim text-sm font-mono">
                    {s.set}
                  </span>
                </div>
                <input
                  type="text"
                  value={s.weight ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? null : Number(e.target.value);
                    updateSet(activeEx, si, "weight", val);
                  }}
                  placeholder="-"
                  className={`${
                    s.done ? "bg-ft-card" : "bg-ft-bg"
                  } border border-ft-card rounded px-2 py-1.5 text-center text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors`}
                />
                <input
                  type="text"
                  value={s.reps ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? null : Number(e.target.value);
                    updateSet(activeEx, si, "reps", val);
                  }}
                  placeholder="-"
                  className={`${
                    s.done ? "bg-ft-card" : "bg-ft-bg"
                  } border border-ft-card rounded px-2 py-1.5 text-center text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors`}
                />
                <input
                  type="text"
                  value={s.rir ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? null : Number(e.target.value);
                    updateSet(activeEx, si, "rir", val);
                  }}
                  placeholder="-"
                  className={`${
                    s.done ? "bg-ft-card" : "bg-ft-bg"
                  } border border-ft-card rounded px-2 py-1.5 text-center text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors`}
                />
                <div className="flex items-center justify-center">
                  <div
                    onClick={() => updateSet(activeEx, si, "done", !s.done)}
                    className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                      s.done
                        ? "bg-ft-success/20 border-ft-success text-ft-success"
                        : "border-ft-card hover:border-ft-dim"
                    }`}
                  >
                    {s.done && <span className="text-xs">&#10003;</span>}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => addSet(activeEx)}
              className="w-full mt-1 border border-dashed border-ft-card rounded py-2 text-ft-dim text-xs font-mono hover:border-ft-dim hover:text-ft-light transition-colors"
            >
              + Add Set
            </button>
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <SectionHeader title="Notes" />
          <textarea
            rows={3}
            placeholder="Add notes for this exercise..."
            className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-light placeholder:text-ft-muted focus:outline-none focus:border-ft-dim resize-none transition-colors"
          />
        </Card>
      </div>
    </div>
  );
}
