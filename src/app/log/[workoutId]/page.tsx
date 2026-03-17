"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, SectionHeader, Tag } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
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
  suggestedWeight: Suggestion | null;
  progressionInfo: ProgressionInfo;
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

interface Suggestion {
  weight: number;
  hint: string; // e.g. "+5 lbs" or "Same weight, try +1 rep"
  reps?: number;
  sets?: number;
}

interface ProgressionInfo {
  estimated1RM: number | null;
  progressionStatus: "stalled" | "progressing" | "insufficient_data" | null;
  stalledSessions: number;
}

function calcSuggestion(
  progressionType: string,
  increment: number | null,
  lastSets: LastSet[],
  targetRepRange: string,
  progressionInfo?: ProgressionInfo
): Suggestion | null {
  if (lastSets.length === 0) return null;
  const lastWeight = lastSets[0]?.weight;
  if (!lastWeight) return null;

  if (progressionType === "linear" && increment) {
    return { weight: lastWeight + increment, hint: `+${increment}` };
  }
  if (progressionType === "double") {
    const topReps = parseInt(targetRepRange.split("-").pop() ?? "12");
    const allHitTop = lastSets.every((s) => s.reps && s.reps >= topReps);
    if (allHitTop) {
      const inc = increment ?? 5;
      return { weight: lastWeight + inc, hint: `+${inc} (hit top reps)` };
    }
    return { weight: lastWeight, hint: "Same weight, try +1 rep" };
  }
  if (progressionType === "rpe_based") {
    const lastRpe = lastSets[0]?.rir != null ? 10 - lastSets[0].rir : null;
    if (lastRpe && lastRpe < 7) {
      const inc = increment ?? 5;
      return { weight: lastWeight + inc, hint: `+${inc} (RPE was ${lastRpe})` };
    }
    return { weight: lastWeight, hint: "RPE on target" };
  }
  if (progressionType === "wave") {
    // Use estimated 1RM as the base weight for wave calculations
    const baseWeight = progressionInfo?.estimated1RM ?? lastWeight;
    // Determine week in cycle from increment field (default to week 0)
    const weekInCycle = increment ? Math.round(increment) % 4 : 0;
    const phases = ["Accumulation", "Intensify", "Peak", "Deload"];
    const multipliers = [0.75, 0.82, 0.9, 0.6];
    const repSchemes = [
      { sets: 3, reps: 10 },
      { sets: 4, reps: 8 },
      { sets: 5, reps: 5 },
      { sets: 3, reps: 10 },
    ];
    const cycle = weekInCycle % 4;
    const suggestedWeight = Math.round(baseWeight * multipliers[cycle]);
    return {
      weight: suggestedWeight,
      hint: `${phases[cycle]} (${Math.round(multipliers[cycle] * 100)}% of 1RM)`,
      sets: repSchemes[cycle].sets,
      reps: repSchemes[cycle].reps,
    };
  }
  if (progressionType === "percentage_based") {
    const est1rm = progressionInfo?.estimated1RM;
    if (est1rm && increment) {
      const suggestedWeight = Math.round(est1rm * (increment / 100));
      return { weight: suggestedWeight, hint: `${increment}% of e1RM (${est1rm})` };
    }
    if (est1rm) {
      // Default to 75% if no percentage specified
      const suggestedWeight = Math.round(est1rm * 0.75);
      return { weight: suggestedWeight, hint: `75% of e1RM (${est1rm})` };
    }
  }
  return null;
}

interface RecentExercise extends SearchExercise {
  sessionCount: number;
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
  const [recents, setRecents] = useState<RecentExercise[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    // Load recent exercises
    fetch("/api/exercises/recent")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.exercises) setRecents(data.exercises); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults((prev) => (prev.length > 0 ? [] : prev));
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setSearching(true);
      fetch(`/api/exercises?search=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then((r) => {
          if (!r.ok) throw new Error(`Search failed: ${r.status}`);
          return r.json();
        })
        .then((data) => setResults(data.exercises?.slice(0, 20) ?? []))
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setResults([]);
        })
        .finally(() => setSearching(false));
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-ft-bg/60" onClick={onClose} />

      {/* Bottom sheet on mobile, centered panel on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:top-[10%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg bg-ft-surface border-t sm:border border-ft-border sm:rounded-lg flex flex-col max-h-[85vh] sm:max-h-[70vh]">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-ft-border" />
        </div>

        {/* Header */}
        <div className="px-4 pt-2 sm:pt-4 pb-3 flex items-center justify-between border-b border-ft-border">
          <h2 className="font-mono text-base font-bold text-ft-white">
            Add Exercise
          </h2>
          <button
            onClick={onClose}
            className="text-ft-dim hover:text-ft-light text-lg font-mono transition-colors px-1"
          >
            &times;
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises..."
            className="w-full bg-ft-bg border border-ft-card rounded-lg px-3 py-3 text-base font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim touch-target"
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 pb-safe">
          {/* Recent exercises (shown when no search query) */}
          {query.length < 2 && recents.length > 0 && (
            <div className="mb-4">
              <p className="text-ft-dim text-[10px] font-mono uppercase tracking-wider mb-2">
                Recent Exercises
              </p>
              {recents.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => onSelect(ex)}
                  className="w-full text-left px-3 py-3 border-b border-ft-card hover:bg-ft-card/50 transition-colors touch-target rounded"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-ft-white text-sm font-mono">{ex.name}</p>
                      <p className="text-ft-dim text-xs font-mono mt-0.5">
                        {[ex.primaryMuscle, ex.movementPattern].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className="text-ft-muted text-[10px] font-mono">
                      {ex.sessionCount}x
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
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
              className="w-full text-left px-3 py-3 border-b border-ft-card hover:bg-ft-card/50 transition-colors touch-target rounded"
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
    </>
  );
}

export default function ActiveWorkoutPage({
  params,
}: {
  params: { workoutId: string };
}) {
  const router = useRouter();
  const toast = useToast();
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
  const [showRir, setShowRir] = useState(false);
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
              // Ensure progressionInfo exists for backward compatibility with older drafts
              const restoredExercises = (draft.exercises as ExerciseData[]).map((ex) => ({
                ...ex,
                progressionInfo: ex.progressionInfo ?? { estimated1RM: null, progressionStatus: null, stalledSessions: 0 },
              }));
              setExercises(restoredExercises);
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
          progressionInfo: { estimated1RM: null, progressionStatus: null, stalledSessions: 0 },
        }));
        setExercises(exerciseList);
        setLoading(false);

        // Fetch last performance, estimated 1RM, and progression status for all exercises
        Promise.all(
          data.exercises.map((bde) =>
            Promise.all([
              fetch(`/api/exercises/${bde.exerciseId}/last-performance`)
                .then((r) => r.ok ? r.json() : null)
                .catch(() => null),
              fetch(`/api/exercises/${bde.exerciseId}/estimated-1rm`)
                .then((r) => r.ok ? r.json() : null)
                .catch(() => null),
              fetch(`/api/exercises/${bde.exerciseId}/progression-status`)
                .then((r) => r.ok ? r.json() : null)
                .catch(() => null),
            ])
          )
        ).then((results) => {
          setExercises((prev) =>
            prev.map((ex, i) => {
              const [perf, e1rmData, statusData] = results[i];
              const lastSets = perf?.lastPerformance?.sets as LastSet[] ?? [];
              const bde = data.exercises[i];
              const progressionInfo: ProgressionInfo = {
                estimated1RM: e1rmData?.estimated1RM ?? null,
                progressionStatus: statusData?.status ?? null,
                stalledSessions: statusData?.sessions ?? 0,
              };
              const suggested = calcSuggestion(
                bde.progressionType,
                bde.progressionIncrement ? Number(bde.progressionIncrement) : null,
                lastSets,
                bde.targetRepRange ?? "8-12",
                progressionInfo
              );
              return { ...ex, lastSets, suggestedWeight: suggested, progressionInfo };
            })
          );
        });
      })
      .catch(() => setLoading(false));
  }, [workoutId]);

  const updateSet = useCallback(
    (exIdx: number, setIdx: number, field: keyof SetData, value: unknown) => {
      setExercises((prev) =>
        prev.map((ex, ei) => {
          if (ei !== exIdx) return ex;
          const newSets = ex.sets.map((s, si) =>
            si !== setIdx ? s : { ...s, [field]: value }
          );
          // Weight carry-forward: when weight is entered, fill empty subsequent sets
          if (field === "weight" && value != null && typeof value === "number") {
            for (let i = setIdx + 1; i < newSets.length; i++) {
              if (newSets[i].weight === null) {
                newSets[i] = { ...newSets[i], weight: value as number };
              }
            }
          }
          return { ...ex, sets: newSets };
        })
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
    const newId = `added-${Date.now()}`;
    const newEx: ExerciseData = {
      id: newId,
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
      progressionInfo: { estimated1RM: null, progressionStatus: null, stalledSessions: 0 },
    };
    setExercises((prev) => {
      setActiveEx(prev.length);
      return [...prev, newEx];
    });
    setShowPicker(false);

    // Fetch progression data for the newly added exercise
    Promise.all([
      fetch(`/api/exercises/${ex.id}/last-performance`).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch(`/api/exercises/${ex.id}/estimated-1rm`).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch(`/api/exercises/${ex.id}/progression-status`).then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([perf, e1rmData, statusData]) => {
      const lastSets = perf?.lastPerformance?.sets as LastSet[] ?? [];
      const progressionInfo: ProgressionInfo = {
        estimated1RM: e1rmData?.estimated1RM ?? null,
        progressionStatus: statusData?.status ?? null,
        stalledSessions: statusData?.sessions ?? 0,
      };
      setExercises((prev) =>
        prev.map((exercise) =>
          exercise.id === newId
            ? { ...exercise, lastSets, progressionInfo }
            : exercise
        )
      );
    });
  }, []);

  // Finish workout handler
  const handleFinish = async () => {
    // Check that at least one set is completed
    const hasCompletedSets = exercises.some((ex) =>
      ex.sets.some((s) => s.done && s.weight !== null && s.reps !== null)
    );
    if (!hasCompletedSets) {
      toast.warn("Complete at least one set before finishing.");
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
          const setRes = await fetch("/api/sets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workoutExerciseId: workoutExercise.id,
              weight: s.weight,
              reps: s.reps,
              rir: s.rir,
            }),
          });
          if (setRes.ok) {
            const setData = await setRes.json();
            if (setData.isPr) {
              toast.success(`New PR! ${ex.name}: ${s.weight} × ${s.reps}`);
            }
          }
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
        toast.info("You're offline. Workout saved and will sync when you reconnect.");
        router.push("/");
        return;
      }

      toast.error("Failed to save workout. Please try again.");
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

              {/* Stall Warning */}
              {current.progressionInfo.progressionStatus === "stalled" && (
                <div className="bg-ft-warn/10 border border-ft-warn/20 rounded p-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-ft-warn text-sm">&#9888;</span>
                    <div>
                      <p className="text-ft-warn text-xs font-mono font-bold">
                        Progression stalled
                      </p>
                      <p className="text-ft-warn/70 text-[10px] font-mono mt-0.5">
                        Same weight for {current.progressionInfo.stalledSessions}+ sessions. Consider a deload week or adjusting your approach.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Target + Last Performance + e1RM */}
              <div className="flex gap-3 mb-4 flex-wrap">
                <div className="flex-1 min-w-[80px] bg-ft-bg rounded p-2.5">
                  <p className="text-ft-dim text-[11px] font-mono uppercase tracking-wider mb-0.5">
                    Target
                  </p>
                  <p className="text-ft-light text-sm font-mono font-bold">
                    {current.suggestedWeight?.sets ?? current.targetSets}&times;{current.suggestedWeight?.reps ?? current.targetRepRange}
                  </p>
                  {current.progressionType !== "none" && (
                    <p className="text-ft-muted text-[10px] font-mono mt-0.5">
                      {current.progressionType.replace("_", " ")}
                    </p>
                  )}
                </div>
                {current.lastSets.length > 0 && (
                  <div className="flex-1 min-w-[80px] bg-ft-bg rounded p-2.5">
                    <p className="text-ft-dim text-[11px] font-mono uppercase tracking-wider mb-0.5">
                      Last
                    </p>
                    <p className="text-ft-light text-sm font-mono font-bold">
                      {current.lastSets
                        .slice(0, 3)
                        .map((s) => `${s.weight ?? 0}\u00d7${s.reps ?? 0}`)
                        .join(", ")}
                      {current.lastSets.length > 3 && "..."}
                    </p>
                  </div>
                )}
                {current.progressionInfo.estimated1RM && (
                  <div className="flex-1 min-w-[80px] bg-ft-bg rounded p-2.5">
                    <p className="text-ft-dim text-[11px] font-mono uppercase tracking-wider mb-0.5">
                      Est. 1RM
                    </p>
                    <p className="text-ft-light text-sm font-mono font-bold">
                      {current.progressionInfo.estimated1RM} lbs
                    </p>
                  </div>
                )}
                {current.suggestedWeight && (
                  <div className="flex-1 min-w-[80px] bg-ft-success/10 border border-ft-success/20 rounded p-2.5">
                    <p className="text-ft-success text-[11px] font-mono uppercase tracking-wider mb-0.5">
                      Suggested
                    </p>
                    <p className="text-ft-success text-sm font-mono font-bold">
                      {current.suggestedWeight.weight} lbs
                    </p>
                    <p className="text-ft-success/70 text-[10px] font-mono mt-0.5">
                      {current.suggestedWeight.hint}
                    </p>
                  </div>
                )}
              </div>

              {/* Set Table */}
              <div className="mb-3">
                {/* Header row — RIR hidden on mobile unless toggled */}
                <div className={`grid gap-1.5 mb-1.5 ${showRir ? "grid-cols-[36px_1fr_1fr_1fr_40px]" : "grid-cols-[36px_1fr_1fr_40px] sm:grid-cols-[36px_1fr_1fr_1fr_40px]"}`}>
                  <span className="text-ft-dim text-[11px] font-mono uppercase text-center">
                    Set
                  </span>
                  <span className="text-ft-dim text-[11px] font-mono uppercase text-center">
                    Weight
                  </span>
                  <span className="text-ft-dim text-[11px] font-mono uppercase text-center">
                    Reps
                  </span>
                  <span className={`text-ft-dim text-[11px] font-mono uppercase text-center ${showRir ? "" : "hidden sm:block"}`}>
                    RIR
                  </span>
                  <span className="text-ft-dim text-[11px] font-mono uppercase text-center">
                    &#10003;
                  </span>
                </div>

                {current.sets.map((s, si) => (
                  <div
                    key={si}
                    className={`grid gap-1.5 mb-1.5 ${showRir ? "grid-cols-[36px_1fr_1fr_1fr_40px]" : "grid-cols-[36px_1fr_1fr_40px] sm:grid-cols-[36px_1fr_1fr_1fr_40px]"}`}
                  >
                    <div className="flex items-center justify-center">
                      <span className="text-ft-dim text-sm font-mono">
                        {s.set}
                      </span>
                    </div>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={s.weight ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? null : Number(e.target.value);
                        updateSet(activeEx, si, "weight", val);
                      }}
                      placeholder="-"
                      className={`${
                        s.done ? "bg-ft-card" : "bg-ft-bg"
                      } border border-ft-card rounded px-2 py-2.5 text-center text-base font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors touch-target`}
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={s.reps ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? null : Number(e.target.value);
                        updateSet(activeEx, si, "reps", val);
                      }}
                      placeholder="-"
                      className={`${
                        s.done ? "bg-ft-card" : "bg-ft-bg"
                      } border border-ft-card rounded px-2 py-2.5 text-center text-base font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors touch-target`}
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={s.rir ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? null : Number(e.target.value);
                        updateSet(activeEx, si, "rir", val);
                      }}
                      placeholder="-"
                      className={`${
                        s.done ? "bg-ft-card" : "bg-ft-bg"
                      } border border-ft-card rounded px-2 py-2.5 text-center text-base font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors touch-target ${showRir ? "" : "hidden sm:block"}`}
                    />
                    <div
                      onClick={() => updateSet(activeEx, si, "done", !s.done)}
                      className="flex items-center justify-center cursor-pointer touch-target"
                    >
                      <div
                        className={`w-7 h-7 rounded border-2 flex items-center justify-center transition-colors ${
                          s.done
                            ? "bg-ft-success/20 border-ft-success text-ft-success"
                            : "border-ft-card hover:border-ft-dim"
                        }`}
                      >
                        {s.done && <span className="text-sm">&#10003;</span>}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => addSet(activeEx)}
                    className="flex-1 border border-dashed border-ft-card rounded py-2.5 text-ft-dim text-xs font-mono hover:border-ft-dim hover:text-ft-light transition-colors touch-target"
                  >
                    + Add Set
                  </button>
                  <button
                    onClick={() => setShowRir(!showRir)}
                    className={`sm:hidden border rounded py-2.5 px-3 text-xs font-mono transition-colors touch-target ${
                      showRir
                        ? "border-ft-dim text-ft-light bg-ft-surface"
                        : "border-ft-card text-ft-muted hover:text-ft-dim"
                    }`}
                  >
                    RIR
                  </button>
                </div>
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
