"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, SectionHeader, Tag } from "@/components/ui";
import { addToQueue } from "@/lib/offline-queue";

interface SearchExercise {
  id: string;
  name: string;
  movementPattern: string | null;
  primaryMuscle: string | null;
  equipment: string | null;
}

interface SetData {
  set: number;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  done: boolean;
}

interface LastSet {
  weight: number | null;
  reps: number | null;
  rir: number | null;
}

interface ExerciseData {
  id: string;
  exerciseId: string;
  name: string;
  shortName: string;
  category: string;
  targetSets: number;
  targetRepRange: string;
  progressionType: string;
  sets: SetData[];
  notes: string;
  lastSets: LastSet[];
  suggestedWeight: number | null;
}

interface BlockDayData {
  id: string;
  blockId: string;
  name: string;
  dayNumber: number;
  block: { name: string };
  exercises: {
    id: string;
    exerciseId: string;
    exercise: { name: string; movementPattern: string | null };
    targetSets: number | null;
    targetRepRange: string | null;
    progressionType: string;
    progressionIncrement: number | null;
  }[];
}

function isExerciseComplete(ex: ExerciseData) {
  return ex.sets.length > 0 && ex.sets.every((s) => s.done);
}

function makeShortName(name: string): string {
  const parts = name.split(/[-·]/);
  return parts[0].trim().slice(0, 12);
}

function WorkoutTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState("0:00");

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setElapsed(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex items-center gap-1.5 bg-ft-surface border border-ft-card rounded px-2.5 py-1.5">
      <span className="text-ft-dim text-xs font-mono">&#9201;</span>
      <span className="text-ft-light text-sm font-mono tabular-nums">
        {elapsed}
      </span>
    </div>
  );
}

function calcSuggestion(
  progressionType: string,
  increment: number | null,
  lastSets: LastSet[],
  targetRepRange: string
): number | null {
  if (lastSets.length === 0) return null;
  const lastWeight = lastSets[0]?.weight;
  if (!lastWeight) return null;

  if (progressionType === "linear" && increment) {
    return lastWeight + increment;
  }
  if (progressionType === "double") {
    // If all reps hit top of range, increase weight
    const topReps = parseInt(targetRepRange.split("-").pop() ?? "12");
    const allHitTop = lastSets.every((s) => s.reps && s.reps >= topReps);
    if (allHitTop) return lastWeight + (increment ?? 5);
    return lastWeight; // keep same weight, increase reps
  }
  return null;
}

function ExercisePicker({
  onSelect,
  onClose,
}: {
  onSelect: (ex: SearchExercise) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchExercise[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearching(true);
      fetch(`/api/exercises?search=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => setResults(data.exercises?.slice(0, 20) ?? []))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 bg-ft-bg/90 flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 pt-4 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onClose}
            className="text-ft-dim hover:text-ft-light text-sm font-mono"
          >
            &larr; Cancel
          </button>
          <h2 className="font-mono text-lg font-bold text-ft-white">
            Add Exercise
          </h2>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises..."
          className="w-full bg-ft-surface border border-ft-card rounded px-3 py-2.5 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim mb-3"
        />
        <div className="flex-1 overflow-y-auto pb-8">
          {searching && (
            <p className="text-ft-dim text-xs font-mono text-center py-4">
              Searching...
            </p>
          )}
          {!searching && query.length >= 2 && results.length === 0 && (
            <p className="text-ft-muted text-xs font-mono text-center py-4">
              No exercises found
            </p>
          )}
          {results.map((ex) => (
            <button
              key={ex.id}
              onClick={() => onSelect(ex)}
              className="w-full text-left px-3 py-2.5 border-b border-ft-card hover:bg-ft-surface transition-colors"
            >
              <p className="text-ft-white text-sm font-mono">{ex.name}</p>
              <p className="text-ft-dim text-xs font-mono mt-0.5">
                {[ex.primaryMuscle, ex.movementPattern, ex.equipment]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ActiveWorkoutPage({
  params,
}: {
  params: { workoutId: string };
}) {
  const router = useRouter();
  const { workoutId } = params;
  const [blockDayId, setBlockDayId] = useState<string>("");
  const [blockId, setBlockId] = useState<string>("");
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [dayInfo, setDayInfo] = useState<{ name: string; blockName: string } | null>(null);
  const [activeEx, setActiveEx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [startTime] = useState(() => Date.now());
  const [restored, setRestored] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save to localStorage (debounced 2s)
  const saveToLocalStorage = useCallback(() => {
    if (!workoutId || workoutId === "new-blank") return;
    const key = `workout-draft-${workoutId}`;
    const data = { exercises, workoutNotes, savedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(data));
  }, [workoutId, exercises, workoutNotes]);

  useEffect(() => {
    if (!workoutId || exercises.length === 0) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveToLocalStorage, 2000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [exercises, workoutNotes, saveToLocalStorage, workoutId]);

  // Load block day exercises
  useEffect(() => {
    if (!workoutId || workoutId === "new-blank") {
      setLoading(false);
      return;
    }

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
        setBlockDayId(data.id);
        setBlockId(data.blockId);
        setDayInfo({ name: data.name, blockName: data.block.name });

        // Check for saved draft
        const key = `workout-draft-${workoutId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const draft = JSON.parse(saved);
            // Only restore if less than 24 hours old
            if (draft.savedAt && Date.now() - draft.savedAt < 24 * 60 * 60 * 1000) {
              setExercises(draft.exercises);
              setWorkoutNotes(draft.workoutNotes || "");
              setRestored(true);
              setLoading(false);
              return;
            }
          } catch {
            // ignore parse errors
          }
        }

        const exerciseList: ExerciseData[] = data.exercises.map((bde) => ({
          id: bde.id,
          exerciseId: bde.exerciseId,
          name: bde.exercise.name,
          shortName: makeShortName(bde.exercise.name),
          category: bde.exercise.movementPattern || "—",
          targetSets: bde.targetSets ?? 3,
          targetRepRange: bde.targetRepRange ?? "8-12",
          progressionType: bde.progressionType ?? "none",
          sets: Array.from({ length: bde.targetSets ?? 3 }, (_, i) => ({
            set: i + 1,
            weight: null,
            reps: null,
            rir: null,
            done: false,
          })),
          notes: "",
          lastSets: [],
          suggestedWeight: null,
        }));
        setExercises(exerciseList);
        setLoading(false);

        // Fetch last performance for all exercises, then apply in one update
        Promise.all(
          data.exercises.map((bde) =>
            fetch(`/api/exercises/${bde.exerciseId}/last-performance`)
              .then((r) => r.ok ? r.json() : null)
              .catch(() => null)
          )
        ).then((results) => {
          setExercises((prev) =>
            prev.map((ex, i) => {
              const perf = results[i];
              if (!perf?.lastPerformance) return ex;
              const lastSets = perf.lastPerformance.sets as LastSet[];
              const bde = data.exercises[i];
              const suggested = calcSuggestion(
                bde.progressionType,
                bde.progressionIncrement ? Number(bde.progressionIncrement) : null,
                lastSets,
                bde.targetRepRange ?? "8-12"
              );
              return { ...ex, lastSets, suggestedWeight: suggested };
            })
          );
        });
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

  const updateExerciseNotes = useCallback((exIdx: number, notes: string) => {
    setExercises((prev) =>
      prev.map((ex, ei) => (ei !== exIdx ? ex : { ...ex, notes }))
    );
  }, []);

  const addExercise = useCallback((ex: SearchExercise) => {
    const newEx: ExerciseData = {
      id: `added-${Date.now()}`,
      exerciseId: ex.id,
      name: ex.name,
      shortName: makeShortName(ex.name),
      category: ex.movementPattern || "—",
      targetSets: 3,
      targetRepRange: "8-12",
      progressionType: "none",
      sets: [1, 2, 3].map((n) => ({
        set: n,
        weight: null,
        reps: null,
        rir: null,
        done: false,
      })),
      notes: "",
      lastSets: [],
      suggestedWeight: null,
    };
    setExercises((prev) => [...prev, newEx]);
    setActiveEx(exercises.length);
    setShowPicker(false);
  }, [exercises.length]);

  // Finish workout handler
  const handleFinish = async () => {
    // Check that at least one set is completed
    const hasCompletedSets = exercises.some((ex) =>
      ex.sets.some((s) => s.done && s.weight !== null && s.reps !== null)
    );
    if (!hasCompletedSets) {
      alert("Complete at least one set before finishing.");
      return;
    }

    setFinishing(true);
    try {
      // 1. Create the workout
      const workoutRes = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString(),
          startTime: new Date(startTime).toISOString(),
          blockId: blockId || null,
          blockDayId: blockDayId || null,
          notes: workoutNotes || null,
        }),
      });
      if (!workoutRes.ok) throw new Error("Failed to create workout");
      const workout = await workoutRes.json();

      // 2. For each exercise with completed sets, add to workout and log sets
      for (const ex of exercises) {
        const completedSets = ex.sets.filter(
          (s) => s.done && s.weight !== null && s.reps !== null
        );
        if (completedSets.length === 0) continue;

        // Add exercise to workout
        const weRes = await fetch(`/api/workouts/${workout.id}/exercises`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseId: ex.exerciseId,
            notes: ex.notes || null,
          }),
        });
        if (!weRes.ok) throw new Error("Failed to add exercise");
        const workoutExercise = await weRes.json();

        // Log each completed set
        for (const s of completedSets) {
          await fetch("/api/sets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workoutExerciseId: workoutExercise.id,
              weight: s.weight,
              reps: s.reps,
              rir: s.rir,
            }),
          });
        }
      }

      // 3. Finalize workout with endTime
      await fetch(`/api/workouts/${workout.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endTime: new Date().toISOString(),
          notes: workoutNotes || null,
        }),
      });

      // 4. Clear localStorage draft
      localStorage.removeItem(`workout-draft-${workoutId}`);

      // 5. Redirect to dashboard
      router.push("/");
    } catch (err) {
      // If offline (network error), queue for later sync
      const isOffline = !navigator.onLine || (err instanceof TypeError && err.message === "Failed to fetch");
      if (isOffline) {
        const queuedExercises = exercises
          .filter((ex) => ex.sets.some((s) => s.done && s.weight !== null && s.reps !== null))
          .map((ex) => ({
            exerciseId: ex.exerciseId,
            notes: ex.notes || null,
            sets: ex.sets
              .filter((s) => s.done && s.weight !== null && s.reps !== null)
              .map((s) => ({ weight: s.weight!, reps: s.reps!, rir: s.rir })),
          }));

        addToQueue({
          id: `offline-${Date.now()}`,
          queuedAt: Date.now(),
          payload: {
            date: new Date().toISOString(),
            startTime: new Date(startTime).toISOString(),
            blockId: blockId || null,
            blockDayId: blockDayId || null,
            notes: workoutNotes || null,
            exercises: queuedExercises,
          },
        });

        localStorage.removeItem(`workout-draft-${workoutId}`);
        alert("You're offline. Workout saved and will sync when you reconnect.");
        router.push("/");
        return;
      }

      alert("Failed to save workout. Please try again.");
      setFinishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ft-bg text-ft-white flex items-center justify-center">
        <p className="text-ft-dim font-mono text-sm">Loading workout...</p>
      </div>
    );
  }

  const current = exercises.length > 0 ? exercises[activeEx] : null;

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white pb-24 max-w-2xl mx-auto">
      {/* Exercise Picker Overlay */}
      {showPicker && (
        <ExercisePicker
          onSelect={addExercise}
          onClose={() => setShowPicker(false)}
        />
      )}

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
            <WorkoutTimer startTime={startTime} />
            {exercises.length > 0 && (
              <button
                onClick={handleFinish}
                disabled={finishing}
                className="bg-ft-success/20 text-ft-success font-mono text-sm font-bold px-4 py-1.5 rounded hover:bg-ft-success/30 transition-colors disabled:opacity-50"
              >
                {finishing ? "Saving..." : "Finish"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Restored draft banner */}
      {restored && (
        <div className="mx-4 mt-3 bg-ft-surface border border-ft-card rounded px-3 py-2 flex items-center justify-between">
          <span className="text-ft-dim text-xs font-mono">Draft restored from previous session</span>
          <button
            onClick={() => setRestored(false)}
            className="text-ft-muted text-xs font-mono hover:text-ft-light"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Empty state — no exercises yet */}
      {exercises.length === 0 && (
        <div className="px-4 mt-8">
          <Card>
            <div className="flex flex-col items-center py-6 gap-3">
              <p className="text-ft-muted font-mono text-sm text-center">
                No exercises yet. Search and add exercises to start your workout.
              </p>
              <button
                onClick={() => setShowPicker(true)}
                className="bg-ft-surface border border-ft-card rounded px-4 py-2 text-ft-light font-mono text-sm hover:border-ft-dim transition-colors"
              >
                + Add Exercise
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Exercise Tabs */}
      {current && (
        <>
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
              <button
                onClick={() => setShowPicker(true)}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded font-mono text-xs bg-ft-surface text-ft-dim hover:text-ft-light border border-dashed border-ft-card transition-colors"
              >
                <span>+</span>
              </button>
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

              {/* Target + Last Performance */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-ft-bg rounded p-2.5">
                  <p className="text-ft-dim text-[11px] font-mono uppercase tracking-wider mb-0.5">
                    Target
                  </p>
                  <p className="text-ft-light text-sm font-mono font-bold">
                    {current.targetSets}&times;{current.targetRepRange}
                  </p>
                </div>
                {current.lastSets.length > 0 && (
                  <div className="flex-1 bg-ft-bg rounded p-2.5">
                    <p className="text-ft-dim text-[11px] font-mono uppercase tracking-wider mb-0.5">
                      Last
                    </p>
                    <p className="text-ft-light text-sm font-mono font-bold">
                      {current.lastSets
                        .slice(0, 3)
                        .map((s) => `${s.weight ?? 0}×${s.reps ?? 0}`)
                        .join(", ")}
                      {current.lastSets.length > 3 && "..."}
                    </p>
                  </div>
                )}
                {current.suggestedWeight && (
                  <div className="flex-1 bg-ft-success/10 border border-ft-success/20 rounded p-2.5">
                    <p className="text-ft-success text-[11px] font-mono uppercase tracking-wider mb-0.5">
                      Suggested
                    </p>
                    <p className="text-ft-success text-sm font-mono font-bold">
                      {current.suggestedWeight} lbs
                    </p>
                  </div>
                )}
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

            {/* Exercise Notes */}
            <Card>
              <SectionHeader title="Notes" />
              <textarea
                rows={3}
                value={current.notes}
                onChange={(e) => updateExerciseNotes(activeEx, e.target.value)}
                placeholder="Add notes for this exercise..."
                className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-light placeholder:text-ft-muted focus:outline-none focus:border-ft-dim resize-none transition-colors"
              />
            </Card>

            {/* Workout Notes */}
            <Card>
              <SectionHeader title="Workout Notes" />
              <textarea
                rows={2}
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="Overall session notes..."
                className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-light placeholder:text-ft-muted focus:outline-none focus:border-ft-dim resize-none transition-colors"
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
