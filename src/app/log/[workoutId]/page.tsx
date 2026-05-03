"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, SectionHeader } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { addToQueue } from "@/lib/offline-queue";
import ThemedIcon from "@/components/themed/ThemedIcon";
import Lane from "./_logger/Lane";
import SetSheet from "./_logger/SetSheet";
import WeekStrip, { type WeekTab } from "./_logger/WeekStrip";
import WorkoutHeader from "./_logger/WorkoutHeader";
import FinishBar from "./_logger/FinishBar";
import { shortDate } from "./_logger/util";
import type { ActiveCell } from "./_logger/types";

const DEFAULT_REST_SECONDS = 90;

interface SearchExercise {
  id: string;
  name: string;
  movementPattern: string | null;
  primaryMuscle: string | null;
  equipment: string | null;
}

// Note: TabNav (logger-app.jsx#962-994) is OMITTED — R1's BottomNav
// supersedes the prototype's faded in-session tab strip and the logger
// pages already hide BottomNav while active.
//
// VariantDropdown (logger-app.jsx#439-500) — schema field
// `BlockDayExercise.variants String[]` landed in R6; UI dropdown
// surface deferred to a follow-up UI-only pass. The swap path
// continues to use ExercisePicker.
//
// Skeleton variants B (FocusCard), C (DenseGrid), D (TimerFirst) from
// logger-skeletons.jsx are OMITTED — variant A (LoggerScreen, the
// canonical horizontal-weeks layout) is the active layout. Variant
// switching requires a tweaks/settings UI; no toggle exists in live.

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
  /** Specific muscle for the lane rail label (e.g. "Lateral Delt"). */
  primaryMuscle: string | null;
  targetSets: number;
  targetRepRange: string;
  /** Stored as Decimal in DB; passed to SetSheet as the RPE-side string. */
  targetRpe: string | null;
  progressionType: string;
  sets: SetData[];
  notes: string;
  lastSets: LastSet[];
  suggestedWeight: Suggestion | null;
  progressionInfo: ProgressionInfo;
}

/**
 * Shape of a sibling workout (same blockDayId, prior weeks of the block).
 * Returned by GET /api/workouts?blockDayId=X. Used to populate the
 * WeekStrip and back the read-only past-week view.
 */
interface SiblingExerciseSet {
  setNumber: number;
  weight: number | string | null;
  reps: number | null;
  rir: number | null;
}
interface SiblingExercise {
  id: string;
  exercise: { id?: string; name: string };
  sets: SiblingExerciseSet[];
}
interface SiblingWorkout {
  id: string;
  date: string;
  endTime: string | null;
  exercises: SiblingExercise[];
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
    exercise: { name: string; movementPattern: string | null; primaryMuscle: string | null };
    targetSets: number | null;
    targetRepRange: string | null;
    targetRpe: number | string | null;
    progressionType: string;
    progressionIncrement: number | null;
  }[];
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
    <div
      className="flex items-center gap-1.5 px-2.5 py-1.5"
      style={{
        background: "rgb(var(--ft-surface))",
        border: "1px solid rgb(var(--ft-border))",
        borderRadius: 4,
      }}
    >
      <span
        className="font-body"
        style={{ fontSize: 12, color: "rgb(var(--ft-text-tertiary))" }}
      >
        &#9201;
      </span>
      <span
        className="font-body tabular-nums"
        style={{ fontSize: 13, color: "rgb(var(--ft-text-secondary))" }}
      >
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
  title = "Add Exercise",
}: {
  onSelect: (ex: SearchExercise) => void;
  onClose: () => void;
  title?: string;
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
      <div className="fixed inset-0 z-40 bg-ft-bg/60" onClick={onClose} aria-hidden="true" />

      {/* Bottom sheet on mobile, centered panel on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add exercise"
        className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:top-[10%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg bg-ft-surface border-t sm:border border-ft-border sm:rounded-lg flex flex-col max-h-[85vh] sm:max-h-[70vh]"
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-ft-border" />
        </div>

        {/* Header */}
        <div className="px-4 pt-2 sm:pt-4 pb-3 flex items-center justify-between border-b border-ft-border">
          <h2 className="font-body text-base font-bold text-ft-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-ft-dim hover:text-ft-light text-lg font-body transition-colors px-1 flex items-center"
            aria-label="Close"
          >
            <ThemedIcon name="x" size={18} />
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
            className="w-full bg-ft-bg border border-ft-card rounded-lg px-3 py-3 text-base font-body text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim touch-target"
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 pb-safe">
          {/* Recent exercises (shown when no search query) */}
          {query.length < 2 && recents.length > 0 && (
            <div className="mb-4">
              <p className="text-ft-dim text-[10px] font-body uppercase tracking-wider mb-2">
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
                      <p className="text-ft-white text-sm font-body">{ex.name}</p>
                      <p className="text-ft-dim text-xs font-body mt-0.5">
                        {[ex.primaryMuscle, ex.movementPattern].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className="text-ft-muted text-[10px] font-body">
                      {ex.sessionCount}x
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {searching && (
            <p className="text-ft-dim text-xs font-body text-center py-4">
              Searching...
            </p>
          )}
          {!searching && query.length >= 2 && results.length === 0 && (
            <p className="text-ft-muted text-xs font-body text-center py-4">
              No exercises found
            </p>
          )}
          {results.map((ex) => (
            <button
              key={ex.id}
              onClick={() => onSelect(ex)}
              className="w-full text-left px-3 py-3 border-b border-ft-card hover:bg-ft-card/50 transition-colors touch-target rounded"
            >
              <p className="text-ft-white text-sm font-body">{ex.name}</p>
              <p className="text-ft-dim text-xs font-body mt-0.5">
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
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [startTime] = useState(() => Date.now());
  const [restored, setRestored] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [swapIndex, setSwapIndex] = useState<number | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save to localStorage (debounced 2s). Includes "new-blank" so
  // improv workouts also survive a refresh — the key is stable per URL.
  const saveToLocalStorage = useCallback(() => {
    if (!workoutId) return;
    const key = `workout-draft-${workoutId}`;
    const data = { exercises, workoutNotes, savedAt: Date.now() };
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Storage full or unavailable — best-effort
    }
  }, [workoutId, exercises, workoutNotes]);

  useEffect(() => {
    if (!workoutId || exercises.length === 0) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveToLocalStorage, 2000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [exercises, workoutNotes, saveToLocalStorage, workoutId]);

  // Flush pending save before the page unloads so a refresh within the
  // 2s debounce window doesn't drop the latest set entry.
  useEffect(() => {
    if (!workoutId) return;
    const flush = () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      saveToLocalStorage();
    };
    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, [workoutId, saveToLocalStorage]);

  // Load block day exercises
  useEffect(() => {
    if (!workoutId) {
      setLoading(false);
      return;
    }

    // Blank/improv workouts have no template to fetch — just rehydrate
    // any in-flight draft so a refresh doesn't wipe logged sets.
    if (workoutId === "new-blank") {
      const key = `workout-draft-${workoutId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          if (draft.savedAt && Date.now() - draft.savedAt < 24 * 60 * 60 * 1000) {
            const restoredExercises = (draft.exercises as ExerciseData[]).map((ex) => ({
              ...ex,
              progressionInfo: ex.progressionInfo ?? { estimated1RM: null, progressionStatus: null, stalledSessions: 0 },
            }));
            setExercises(restoredExercises);
            setWorkoutNotes(draft.workoutNotes || "");
            setRestored(true);
          }
        } catch {
          // ignore parse errors
        }
      }
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
          primaryMuscle: bde.exercise.primaryMuscle ?? null,
          targetSets: bde.targetSets ?? 3,
          targetRepRange: bde.targetRepRange ?? "8-12",
          targetRpe: bde.targetRpe != null ? String(bde.targetRpe) : null,
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

  // Lane-based logger state (B3-followup-v2 port)
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);

  // WeekStrip — sibling workouts (same blockDayId) sorted earliest first.
  // currentWeekIdx = siblings.length (the current workout sits after them).
  // selectedWeekIdx defaults to currentWeekIdx; tapping a past tab switches
  // the lanes into a read-only view of that workout's logged sets.
  const [siblingWorkouts, setSiblingWorkouts] = useState<SiblingWorkout[]>([]);
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(0);

  /**
   * Fetch every workout that shares this blockDayId — those are the
   * "same day, different week" siblings. Sort earliest-first so each
   * sibling's index = its zero-based week-of-block. The current
   * workout is implicitly week N (after all completed siblings).
   */
  useEffect(() => {
    if (!blockDayId) return;
    let cancelled = false;
    fetch(`/api/workouts?blockDayId=${blockDayId}&limit=20`)
      .then((res) => (res.ok ? res.json() : { workouts: [] }))
      .then((data: { workouts: SiblingWorkout[] }) => {
        if (cancelled) return;
        const sibs = (data.workouts ?? [])
          .filter((w) => w.endTime != null && w.id !== workoutId)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setSiblingWorkouts(sibs);
        setSelectedWeekIdx(sibs.length); // current week sits after all siblings
      })
      .catch(() => {
        // best-effort — WeekStrip degrades to "current week only" on failure
      });
    return () => {
      cancelled = true;
    };
  }, [blockDayId, workoutId]);

  /**
   * Commits weight/reps/rir for a single set in one shot, marks done=true,
   * and starts the rest-timer countdown. Used by SetSheet's "LOG SET"
   * action — replaces the field-by-field updateSet path the inline inputs
   * used to drive.
   */
  const commitSet = useCallback(
    (
      exIdx: number,
      setIdx: number,
      values: { weight: number; reps: number; rir: number | null },
    ) => {
      setExercises((prev) =>
        prev.map((ex, ei) => {
          if (ei !== exIdx) return ex;
          const newSets = ex.sets.map((s, si) =>
            si !== setIdx
              ? s
              : {
                  ...s,
                  weight: values.weight,
                  reps: values.reps,
                  rir: values.rir,
                  done: true,
                },
          );
          // Weight carry-forward, same rule the old inline path used.
          for (let i = setIdx + 1; i < newSets.length; i++) {
            if (newSets[i].weight === null) {
              newSets[i] = { ...newSets[i], weight: values.weight };
            }
          }
          return { ...ex, sets: newSets };
        }),
      );
      setRestEndsAt(Date.now() + DEFAULT_REST_SECONDS * 1000);
    },
    [],
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

  const addExercise = useCallback((ex: SearchExercise) => {
    const newId = `added-${Date.now()}`;
    const newEx: ExerciseData = {
      id: newId,
      exerciseId: ex.id,
      name: ex.name,
      shortName: makeShortName(ex.name),
      category: ex.movementPattern || "—",
      primaryMuscle: ex.primaryMuscle ?? null,
      targetSets: 3,
      targetRepRange: "8-12",
      targetRpe: null,
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

  const swapExercise = useCallback((index: number, ex: SearchExercise) => {
    setExercises((prev) =>
      prev.map((existing, i) =>
        i !== index
          ? existing
          : {
              ...existing,
              exerciseId: ex.id,
              name: ex.name,
              shortName: makeShortName(ex.name),
              category: ex.movementPattern || "—",
              primaryMuscle: ex.primaryMuscle ?? null,
              // Reset last performance data; will be re-fetched for the new exercise
              lastSets: [],
              suggestedWeight: null,
              progressionInfo: {
                estimated1RM: null,
                progressionStatus: null,
                stalledSessions: 0,
              },
            }
      )
    );
    setShowPicker(false);
    setSwapIndex(null);

    // Fetch progression data for the swapped-in exercise
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
        prev.map((exercise, i) =>
          i === index ? { ...exercise, lastSets, progressionInfo } : exercise
        )
      );
    });
  }, []);

  const removeExercise = useCallback((index: number) => {
    const ex = exercises[index];
    if (!ex) return;
    const hasLoggedSets = ex.sets.some((s) => s.done || s.weight != null || s.reps != null);
    if (hasLoggedSets) {
      const confirmed = typeof window !== "undefined"
        ? window.confirm(`Remove "${ex.name}"? Any logged sets for this exercise will be discarded.`)
        : true;
      if (!confirmed) return;
    }
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }, [exercises]);

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
        <p className="text-ft-dim font-body text-sm">Loading workout...</p>
      </div>
    );
  }

  // Running totals for the FinishBar — recomputed on every render. Cheap
  // for the set counts we deal with (low hundreds).
  let setsDone = 0;
  let setsTotal = 0;
  let totalVolume = 0;
  for (const ex of exercises) {
    for (const s of ex.sets) {
      setsTotal++;
      if (s.done) {
        setsDone++;
        if (s.weight != null && s.reps != null) totalVolume += s.weight * s.reps;
      }
    }
  }
  // Build the WeekStrip tab list. Each completed sibling is a past week;
  // the current workout is the trailing "TODAY" tab.
  const currentWeekIdx = siblingWorkouts.length;
  const weeks: WeekTab[] = [
    ...siblingWorkouts.map((s, i) => ({
      weekIdx: i,
      label: `W${i + 1}`,
      date: shortDate(s.date),
      pastComplete: true,
      isCurrent: false,
    })),
    {
      weekIdx: currentWeekIdx,
      label: `W${currentWeekIdx + 1}`,
      date: null,
      pastComplete: false,
      isCurrent: true,
    },
  ];

  // When viewing a past week, overlay each lane's sets with the sibling's
  // logged values. Match by exerciseId; lanes without a match render empty.
  const isViewingPast = selectedWeekIdx < currentWeekIdx;
  const viewingSibling = isViewingPast ? siblingWorkouts[selectedWeekIdx] : null;
  const displayExercises =
    viewingSibling != null
      ? exercises.map((curr) => {
          const past = viewingSibling.exercises.find(
            (pe) => pe.exercise && (pe.exercise as { id?: string }).id === curr.exerciseId,
          );
          if (!past) return { ...curr, sets: [] };
          return {
            ...curr,
            sets: past.sets.map((s, idx) => ({
              set: s.setNumber ?? idx + 1,
              weight: s.weight != null ? Number(s.weight) : null,
              reps: s.reps,
              rir: s.rir,
              done: true,
            })),
          };
        })
      : exercises;

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white pb-32 max-w-2xl mx-auto">
      {/* Exercise Picker Overlay */}
      {showPicker && (
        <ExercisePicker
          title={swapIndex !== null ? "Swap Exercise" : "Add Exercise"}
          onSelect={(ex) => {
            if (swapIndex !== null) {
              swapExercise(swapIndex, ex);
            } else {
              addExercise(ex);
            }
          }}
          onClose={() => {
            setShowPicker(false);
            setSwapIndex(null);
          }}
        />
      )}

      {/* Header — per-chrome theme branches preserved */}
      <WorkoutHeader
        blockName={dayInfo?.blockName ?? null}
        dayName={dayInfo?.name ?? "Workout"}
        currentWeekIdx={siblingWorkouts.length}
        totalWeeks={null}
        dateLabel={new Date().toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
        backHref="/gameplan"
        backLabel={dayInfo?.blockName ?? "Back"}
        rightSlot={<WorkoutTimer startTime={startTime} />}
      />

      {/* Restored draft banner */}
      {restored && (
        <div className="mx-4 mt-3 bg-ft-surface border border-ft-card rounded px-3 py-2 flex items-center justify-between">
          <span className="text-ft-dim text-xs font-body">Draft restored from previous session</span>
          <button
            onClick={() => setRestored(false)}
            className="text-ft-muted text-xs font-body hover:text-ft-light"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Empty state — no exercises yet */}
      {exercises.length === 0 && (
        <div className="px-4 mt-8">
          <Card className="ft-card">
            <div className="flex flex-col items-center py-6 gap-3">
              <p className="text-ft-light font-body text-sm text-center">
                No exercises yet. Search and add exercises to start your workout.
              </p>
              <button
                onClick={() => setShowPicker(true)}
                className="cta-underline font-display text-base text-ft-accent px-4 py-2"
              >
                + Add Exercise
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* WeekStrip — only render once we know currentWeekIdx (after the
          sibling-workouts fetch resolves). Default "current only" tab on
          first paint reads as a single highlighted W1 — fine. */}
      {weeks.length > 0 && (
        <WeekStrip
          weeks={weeks}
          selected={selectedWeekIdx}
          onSelect={(w) => setSelectedWeekIdx(w)}
        />
      )}

      {/* Read-only banner when viewing a past week */}
      {isViewingPast && viewingSibling && (
        <div className="mx-4 mt-3 bg-ft-accent/10 border border-ft-accent/30 px-3 py-2 flex items-center justify-between rounded-ft">
          <span className="text-ft-accent text-xs font-body uppercase tracking-[0.15em]">
            VIEWING WEEK {selectedWeekIdx + 1} · READ ONLY
          </span>
          <button
            onClick={() => setSelectedWeekIdx(currentWeekIdx)}
            className="text-ft-accent text-[11px] font-body uppercase tracking-[0.15em] border-b border-ft-accent"
          >
            Back to today
          </button>
        </div>
      )}

      {/* Lane stack — every exercise is a row of tappable set cells. */}
      {exercises.length > 0 && (
        <>
          <div className="px-4 mt-4 mb-4 flex flex-col gap-3">
            {displayExercises.map((ex, i) => (
              <Lane
                key={ex.id}
                name={ex.name}
                category={ex.category}
                movementPattern={ex.category}
                primaryMuscle={ex.primaryMuscle}
                targetSets={ex.targetSets}
                targetRepRange={ex.targetRepRange}
                sets={ex.sets}
                lastWeek={ex.lastSets.map((s) => ({ weight: s.weight, reps: s.reps }))}
                activeCellIdx={
                  !isViewingPast && activeCell?.exerciseIdx === i
                    ? activeCell.setIdx
                    : null
                }
                readOnly={isViewingPast}
                onTapSet={(setIdx) => setActiveCell({ exerciseIdx: i, setIdx })}
                onAddSet={() => addSet(i)}
                onSwap={() => {
                  setSwapIndex(i);
                  setShowPicker(true);
                }}
                onRemove={() => removeExercise(i)}
              />
            ))}
            {!isViewingPast && (
              <button
                onClick={() => setShowPicker(true)}
                className="self-center cta-underline font-display text-base text-ft-accent px-5 py-2 mt-1"
              >
                + Add exercise
              </button>
            )}
          </div>

          {/* Workout-level notes */}
          <div className="px-4 mb-6">
            <Card className="ft-card">
              <SectionHeader title="Workout notes" />
              <textarea
                rows={2}
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="Overall session notes..."
                className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-body text-ft-light placeholder:text-ft-muted focus:outline-none focus:border-ft-dim resize-none transition-colors"
              />
            </Card>
          </div>
        </>
      )}

      {/* SetSheet — bottom modal for entering / editing one set's values. */}
      {activeCell && exercises[activeCell.exerciseIdx] && (
        <SetSheet
          exerciseName={exercises[activeCell.exerciseIdx].name}
          setIdx={activeCell.setIdx}
          category={exercises[activeCell.exerciseIdx].primaryMuscle ?? exercises[activeCell.exerciseIdx].category}
          targetReps={exercises[activeCell.exerciseIdx].targetRepRange}
          targetRpe={exercises[activeCell.exerciseIdx].targetRpe}
          initial={{
            weight:
              exercises[activeCell.exerciseIdx].sets[activeCell.setIdx]?.weight ??
              null,
            reps:
              exercises[activeCell.exerciseIdx].sets[activeCell.setIdx]?.reps ??
              null,
            rir:
              exercises[activeCell.exerciseIdx].sets[activeCell.setIdx]?.rir ??
              null,
          }}
          lastWeek={
            exercises[activeCell.exerciseIdx].lastSets[activeCell.setIdx]
              ? {
                  weight:
                    exercises[activeCell.exerciseIdx].lastSets[activeCell.setIdx]
                      .weight,
                  reps:
                    exercises[activeCell.exerciseIdx].lastSets[activeCell.setIdx]
                      .reps,
                }
              : null
          }
          onCommit={(values) => {
            commitSet(activeCell.exerciseIdx, activeCell.setIdx, values);
            setActiveCell(null);
          }}
          onCancel={() => setActiveCell(null)}
        />
      )}

      {/*
       * FinishBar — sticky bottom strip with running session stats.
       * Per-chrome theme branches (arcade text-color, lab/notebook
       * radii) ported verbatim from logger-app.jsx#FinishBar.
       *
       * Only renders once at least one exercise is loaded; before that
       * the empty state ("No exercises yet") is the only thing on screen.
       */}
      {exercises.length > 0 && (
        <FinishBar
          setsDone={setsDone}
          setsTotal={setsTotal}
          totalVolume={totalVolume}
          startTime={startTime}
          restEndsAt={restEndsAt}
          onClearRest={() => setRestEndsAt(null)}
          finishing={finishing}
          onFinish={handleFinish}
        />
      )}
    </div>
  );
}
