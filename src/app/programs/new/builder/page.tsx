"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import Timeline from "@/components/ui/Timeline";
import ExerciseBrowserPanel from "@/components/ui/ExerciseBrowserPanel";
import { useToast } from "@/components/ui/Toast";
import { saveDraft, loadDraft, clearDraft } from "@/lib/draft-store";

// ─── Types ──────────────────────────────────────────────
const BLOCK_PHASES = [
  { value: "volume", label: "Volume", color: "text-blue-400" },
  { value: "strength", label: "Strength", color: "text-ft-warn" },
  { value: "peak", label: "Peak", color: "text-red-400" },
  { value: "deload", label: "Deload", color: "text-ft-success" },
  { value: "cut", label: "Cut", color: "text-purple-400" },
  { value: "maintain", label: "Maintain", color: "text-ft-dim" },
  { value: "bulk", label: "Bulk", color: "text-orange-400" },
  { value: "taper", label: "Taper", color: "text-cyan-400" },
  { value: "custom", label: "Custom", color: "text-ft-light" },
] as const;

const DAY_TYPES = [
  { value: "lifting", label: "Lifting", icon: "⬆" },
  { value: "cardio", label: "Cardio", icon: "♥" },
  { value: "conditioning", label: "Conditioning", icon: "⚡" },
  { value: "mobility", label: "Mobility", icon: "↻" },
  { value: "rest", label: "Rest", icon: "—" },
] as const;

const GOAL_TYPES = [
  { value: "weight", label: "Body Weight", metric: "lbs" },
  { value: "strength", label: "Strength PR", metric: "lbs" },
  { value: "bodycomp", label: "Body Comp", metric: "%" },
  { value: "frequency", label: "Frequency", metric: "days/week" },
  { value: "competition", label: "Competition", metric: "" },
  { value: "custom", label: "Custom", metric: "" },
] as const;

interface BuilderBenchmark {
  label: string;
  targetValue: string;
  targetUnit: string;
}

interface BuilderBlock {
  id: string; // temp client id or server id
  name: string;
  blockNumber: number;
  phase: string | null;
  durationWeeks: number;
  scheduleDaysPerWeek: number;
  focus: string;
  days: BuilderDay[];
  benchmark: BuilderBenchmark | null;
  saved?: boolean; // true once persisted
}

interface BuilderExercise {
  id: string;
  exerciseId: string;
  name: string;
  targetSets: number;
  targetRepRange: string;
  sortOrder: number;
}

interface BuilderDay {
  id: string;
  dayNumber: number;
  name: string;
  dayType: string;
  sortOrder: number;
  exercises: BuilderExercise[];
}

interface BuilderGoal {
  type: string;
  priority: "primary" | "secondary";
  title: string;
  startValue: string;
  targetValue: string;
  targetUnit: string;
  targetDate: string;
}

// ─── Helpers ────────────────────────────────────────────
let tempId = 0;
function nextTempId() {
  return `temp-${++tempId}`;
}

function defaultBlockName(num: number, phase: string | null): string {
  if (phase) {
    const p = BLOCK_PHASES.find((bp) => bp.value === phase);
    return p ? `${p.label} Block` : `Block ${num}`;
  }
  return `Block ${num}`;
}

function defaultDays(count: number): BuilderDay[] {
  const dayNames = ["Day A", "Day B", "Day C", "Day D", "Day E", "Day F", "Day G"];
  return Array.from({ length: count }, (_, i) => ({
    id: nextTempId(),
    dayNumber: i + 1,
    name: dayNames[i] ?? `Day ${i + 1}`,
    dayType: "lifting",
    sortOrder: i,
    exercises: [],
  }));
}

const PHASE_COLORS: Record<string, string> = {
  volume: "border-l-blue-400",
  strength: "border-l-ft-warn",
  peak: "border-l-red-400",
  deload: "border-l-ft-success",
  cut: "border-l-purple-400",
  maintain: "border-l-ft-dim",
  bulk: "border-l-orange-400",
  taper: "border-l-cyan-400",
  custom: "border-l-ft-light",
};

// ─── Component ──────────────────────────────────────────
export default function ProgramBuilderPage() {
  const router = useRouter();
  const toast = useToast();

  // Program-level config
  const [programName, setProgramName] = useState("");
  const [programDesc, setProgramDesc] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [daysPerWeek, setDaysPerWeek] = useState(4);

  // Goals
  const [goals, setGoals] = useState<BuilderGoal[]>([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<BuilderGoal>({
    type: "weight",
    priority: "primary",
    title: "",
    startValue: "",
    targetValue: "",
    targetUnit: "lbs",
    targetDate: "",
  });

  // Blocks
  const [blocks, setBlocks] = useState<BuilderBlock[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // Exercise browser
  const [exerciseBrowserOpen, setExerciseBrowserOpen] = useState(false);
  const [exerciseBrowserTarget, setExerciseBrowserTarget] = useState<{
    blockId: string;
    dayId: string;
  } | null>(null);

  // Saving state
  const [saving, setSaving] = useState(false);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Draft Auto-Save ──────────────────────────────────
  const DRAFT_KEY = "program-builder";

  // Restore draft on mount
  useEffect(() => {
    const draft = loadDraft<{
      programName: string;
      programDesc: string;
      startDate: string;
      daysPerWeek: number;
      goals: BuilderGoal[];
      blocks: BuilderBlock[];
    }>(DRAFT_KEY);
    if (draft) {
      setProgramName(draft.programName || "");
      setProgramDesc(draft.programDesc || "");
      setStartDate(draft.startDate || new Date().toISOString().split("T")[0]);
      setDaysPerWeek(draft.daysPerWeek || 4);
      setGoals(draft.goals || []);
      setBlocks(draft.blocks || []);
      if (draft.blocks?.length > 0) {
        setActiveBlockId(draft.blocks[0].id);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save on changes (debounced 2s)
  useEffect(() => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      saveDraft(DRAFT_KEY, {
        programName,
        programDesc,
        startDate,
        daysPerWeek,
        goals,
        blocks,
      });
    }, 2000);
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [programName, programDesc, startDate, daysPerWeek, goals, blocks]);

  // Derived
  const activeBlock = blocks.find((b) => b.id === activeBlockId) ?? null;
  const totalWeeks = blocks.reduce((sum, b) => sum + b.durationWeeks, 0);

  const timelineSegments = useMemo(
    () =>
      blocks.map((b) => ({
        label: b.name,
        width: b.durationWeeks || 1,
        status: "upcoming" as const,
      })),
    [blocks]
  );

  // ─── Block Operations ─────────────────────────────────
  const addBlock = useCallback(() => {
    const num = blocks.length + 1;
    const newBlock: BuilderBlock = {
      id: nextTempId(),
      name: `Block ${num}`,
      blockNumber: num,
      phase: null,
      durationWeeks: 4,
      scheduleDaysPerWeek: daysPerWeek,
      focus: "",
      days: defaultDays(daysPerWeek),
      benchmark: null,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setActiveBlockId(newBlock.id);
  }, [blocks.length, daysPerWeek]);

  const updateBlock = useCallback(
    (blockId: string, updates: Partial<BuilderBlock>) => {
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId) return b;
          const updated = { ...b, ...updates };
          // Auto-rename if phase changed and name is generic
          if (updates.phase !== undefined && b.name.match(/^Block \d+$|Block$/)) {
            updated.name = defaultBlockName(b.blockNumber, updates.phase ?? null);
          }
          // If days per week changed, regenerate days
          if (
            updates.scheduleDaysPerWeek !== undefined &&
            updates.scheduleDaysPerWeek !== b.scheduleDaysPerWeek
          ) {
            const newCount = updates.scheduleDaysPerWeek;
            if (newCount > b.days.length) {
              // Add days
              const extraDays = defaultDays(newCount).slice(b.days.length);
              updated.days = [...b.days, ...extraDays];
            } else if (newCount < b.days.length) {
              updated.days = b.days.slice(0, newCount);
            }
          }
          return updated;
        })
      );
    },
    []
  );

  const removeBlock = useCallback(
    (blockId: string) => {
      setBlocks((prev) => {
        const filtered = prev.filter((b) => b.id !== blockId);
        // Re-number
        return filtered.map((b, i) => ({ ...b, blockNumber: i + 1 }));
      });
      if (activeBlockId === blockId) {
        setActiveBlockId(blocks.length > 1 ? blocks[0]?.id ?? null : null);
      }
    },
    [activeBlockId, blocks]
  );

  const moveBlock = useCallback((blockId: string, direction: -1 | 1) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === blockId);
      if (idx < 0) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr.map((b, i) => ({ ...b, blockNumber: i + 1 }));
    });
  }, []);

  // ─── Day Operations ───────────────────────────────────
  const updateDay = useCallback(
    (blockId: string, dayId: string, updates: Partial<BuilderDay>) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? {
                ...b,
                days: b.days.map((d) =>
                  d.id === dayId ? { ...d, ...updates } : d
                ),
              }
            : b
        )
      );
    },
    []
  );

  // ─── Exercise Operations ────────────────────────────────
  const openExerciseBrowser = useCallback(
    (blockId: string, dayId: string) => {
      setExerciseBrowserTarget({ blockId, dayId });
      setExerciseBrowserOpen(true);
    },
    []
  );

  const addExerciseToDay = useCallback(
    (exercise: { id: string; name: string }) => {
      if (!exerciseBrowserTarget) return;
      const { blockId, dayId } = exerciseBrowserTarget;
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? {
                ...b,
                days: b.days.map((d) =>
                  d.id === dayId
                    ? {
                        ...d,
                        exercises: [
                          ...d.exercises,
                          {
                            id: nextTempId(),
                            exerciseId: exercise.id,
                            name: exercise.name,
                            targetSets: 3,
                            targetRepRange: "8-12",
                            sortOrder: d.exercises.length,
                          },
                        ],
                      }
                    : d
                ),
              }
            : b
        )
      );
    },
    [exerciseBrowserTarget]
  );

  const removeExerciseFromDay = useCallback(
    (blockId: string, dayId: string, exerciseEntryId: string) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? {
                ...b,
                days: b.days.map((d) =>
                  d.id === dayId
                    ? {
                        ...d,
                        exercises: d.exercises.filter(
                          (e) => e.id !== exerciseEntryId
                        ),
                      }
                    : d
                ),
              }
            : b
        )
      );
    },
    []
  );

  // ─── Goal Operations ──────────────────────────────────
  const addGoal = useCallback(() => {
    if (!editingGoal.title.trim()) return;
    setGoals((prev) => [...prev, { ...editingGoal }]);
    setEditingGoal({
      type: "weight",
      priority: goals.length === 0 ? "primary" : "secondary",
      title: "",
      startValue: "",
      targetValue: "",
      targetUnit: "lbs",
      targetDate: "",
    });
    setShowGoalForm(false);
  }, [editingGoal, goals.length]);

  const removeGoal = useCallback((index: number) => {
    setGoals((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ─── Rate Calculator ──────────────────────────────────
  const primaryGoal = goals.find((g) => g.priority === "primary");
  const rateInfo = useMemo(() => {
    if (!primaryGoal || !primaryGoal.startValue || !primaryGoal.targetValue || totalWeeks === 0) return null;
    const start = parseFloat(primaryGoal.startValue);
    const target = parseFloat(primaryGoal.targetValue);
    if (isNaN(start) || isNaN(target)) return null;
    const change = target - start;
    const perWeek = change / totalWeeks;
    const isWeight = primaryGoal.type === "weight";
    const aggressive = isWeight && Math.abs(perWeek) > start * 0.01;
    return {
      change: change.toFixed(1),
      perWeek: perWeek.toFixed(2),
      unit: primaryGoal.targetUnit || "lbs",
      aggressive,
      direction: change > 0 ? "gain" : "loss",
    };
  }, [primaryGoal, totalWeeks]);

  // ─── Save / Create ────────────────────────────────────
  const handleCreate = async () => {
    if (!programName.trim()) {
      toast.error("Program needs a name.");
      return;
    }
    if (blocks.length === 0) {
      toast.error("Add at least one block.");
      return;
    }
    setSaving(true);
    try {
      // 1. Create program
      const progRes = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: programName.trim(),
          description: programDesc.trim() || null,
          startDate: startDate || null,
          durationWeeks: totalWeeks || null,
          status: "active",
        }),
      });
      if (!progRes.ok) throw new Error("Failed to create program");
      const program = await progRes.json();

      // 2. Create goals linked to program
      for (const goal of goals) {
        await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            programId: program.id,
            type: goal.type,
            priority: goal.priority,
            title: goal.title,
            startValue: goal.startValue ? parseFloat(goal.startValue) : null,
            targetValue: goal.targetValue ? parseFloat(goal.targetValue) : null,
            targetUnit: goal.targetUnit || null,
            targetDate: goal.targetDate || null,
          }),
        });
      }

      // 3. Create blocks sequentially
      for (const block of blocks) {
        const blockRes = await fetch(`/api/programs/${program.id}/blocks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: block.name,
            blockNumber: block.blockNumber,
            phase: block.phase || null,
            durationWeeks: block.durationWeeks,
            scheduleDaysPerWeek: block.scheduleDaysPerWeek,
            focus: block.focus || null,
            status: block.blockNumber === 1 ? "active" : "upcoming",
          }),
        });
        if (!blockRes.ok) continue;
        const savedBlock = await blockRes.json();

        // 3b. Create benchmark for block if set
        if (block.benchmark?.targetValue) {
          await fetch(`/api/programs/${program.id}/benchmarks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              blockId: savedBlock.id,
              label: block.benchmark.label || `End of ${block.name}`,
              targetValue: parseFloat(block.benchmark.targetValue),
              targetUnit: block.benchmark.targetUnit || "lbs",
            }),
          });
        }

        // 4. Create days for block
        for (const day of block.days) {
          const dayRes = await fetch(`/api/blocks/${savedBlock.id}/days`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dayNumber: day.dayNumber,
              name: day.name,
              dayType: day.dayType,
              sortOrder: day.sortOrder,
            }),
          });
          if (!dayRes.ok) continue;
          const savedDay = await dayRes.json();

          // 5. Create exercises for each day
          for (const ex of day.exercises) {
            await fetch(`/api/blocks/day/${savedDay.id}/exercises`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                exerciseId: ex.exerciseId,
                sortOrder: ex.sortOrder,
                targetSets: ex.targetSets,
                targetRepRange: ex.targetRepRange,
              }),
            });
          }
        }
      }

      clearDraft(DRAFT_KEY);
      router.push(`/programs/${program.id}`);
    } catch {
      toast.error("Failed to create program.");
      setSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-ft-bg text-ft-white">
      {/* Top bar */}
      <div className="border-b border-ft-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/programs/new"
            className="text-ft-dim text-sm font-mono hover:text-ft-light transition-colors"
          >
            &larr; Back
          </Link>
          <h1 className="font-mono text-lg font-bold tracking-tight">
            Program Builder
          </h1>
        </div>
        <button
          onClick={handleCreate}
          disabled={saving || !programName.trim() || blocks.length === 0}
          className="bg-ft-white text-ft-bg font-mono text-sm font-bold px-5 py-2 rounded hover:bg-ft-light transition-colors disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Program"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* ─── Sidebar ──────────────────────────────────── */}
        <div className="lg:w-80 lg:min-w-[320px] border-r border-ft-border p-5 space-y-6 lg:max-h-[calc(100vh-57px)] lg:overflow-y-auto">
          {/* Program Config */}
          <div className="space-y-3">
            <label className="block text-ft-dim text-[10px] font-mono uppercase tracking-wider">
              Program Name *
            </label>
            <input
              type="text"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="e.g. 16-Week Prep"
              autoFocus
              className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
            />
            <input
              type="text"
              value={programDesc}
              onChange={(e) => setProgramDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-ft-dim text-[10px] font-mono uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
              <div>
                <label className="block text-ft-dim text-[10px] font-mono uppercase tracking-wider mb-1">
                  Days/Week
                </label>
                <select
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
                  className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
                >
                  {[2, 3, 4, 5, 6, 7].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-ft-dim text-[10px] font-mono uppercase tracking-wider">
                Goals
              </span>
              <button
                onClick={() => setShowGoalForm(!showGoalForm)}
                className="text-ft-dim text-xs font-mono hover:text-ft-light transition-colors"
              >
                + Add
              </button>
            </div>

            {goals.map((goal, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-ft-bg border border-ft-border rounded mb-1.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-ft-light text-xs font-mono font-bold truncate">
                      {goal.title}
                    </span>
                    <Tag className={goal.priority === "primary" ? "bg-ft-white text-ft-bg" : ""}>
                      {goal.priority}
                    </Tag>
                  </div>
                  {goal.startValue && goal.targetValue && (
                    <p className="text-ft-muted text-[10px] font-mono mt-0.5">
                      {goal.startValue} → {goal.targetValue} {goal.targetUnit}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeGoal(i)}
                  className="text-ft-muted text-xs hover:text-ft-danger ml-2 shrink-0"
                >
                  ×
                </button>
              </div>
            ))}

            {showGoalForm && (
              <div className="p-3 bg-ft-bg border border-ft-border rounded mt-2 space-y-2">
                <select
                  value={editingGoal.type}
                  onChange={(e) =>
                    setEditingGoal((prev) => ({
                      ...prev,
                      type: e.target.value,
                      targetUnit:
                        GOAL_TYPES.find((g) => g.value === e.target.value)?.metric ??
                        prev.targetUnit,
                    }))
                  }
                  className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white focus:outline-none"
                >
                  {GOAL_TYPES.map((gt) => (
                    <option key={gt.value} value={gt.value}>
                      {gt.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={editingGoal.title}
                  onChange={(e) =>
                    setEditingGoal((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Goal title"
                  className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={editingGoal.startValue}
                    onChange={(e) =>
                      setEditingGoal((prev) => ({
                        ...prev,
                        startValue: e.target.value,
                      }))
                    }
                    placeholder="Start"
                    className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none"
                  />
                  <input
                    type="number"
                    value={editingGoal.targetValue}
                    onChange={(e) =>
                      setEditingGoal((prev) => ({
                        ...prev,
                        targetValue: e.target.value,
                      }))
                    }
                    placeholder="Target"
                    className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none"
                  />
                  <input
                    type="text"
                    value={editingGoal.targetUnit}
                    onChange={(e) =>
                      setEditingGoal((prev) => ({
                        ...prev,
                        targetUnit: e.target.value,
                      }))
                    }
                    placeholder="Unit"
                    className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={editingGoal.priority}
                    onChange={(e) =>
                      setEditingGoal((prev) => ({
                        ...prev,
                        priority: e.target.value as "primary" | "secondary",
                      }))
                    }
                    className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white focus:outline-none"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                  </select>
                  <input
                    type="date"
                    value={editingGoal.targetDate}
                    onChange={(e) =>
                      setEditingGoal((prev) => ({
                        ...prev,
                        targetDate: e.target.value,
                      }))
                    }
                    className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowGoalForm(false)}
                    className="text-ft-dim text-xs font-mono hover:text-ft-light"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addGoal}
                    disabled={!editingGoal.title.trim()}
                    className="bg-ft-white text-ft-bg font-mono text-xs font-bold px-3 py-1 rounded disabled:opacity-50"
                  >
                    Add Goal
                  </button>
                </div>
              </div>
            )}

            {/* Rate indicator */}
            {rateInfo && (
              <div
                className={`mt-2 p-2 rounded border text-xs font-mono ${
                  rateInfo.aggressive
                    ? "border-ft-warn/30 bg-ft-warn/10 text-ft-warn"
                    : "border-ft-border bg-ft-bg text-ft-dim"
                }`}
              >
                {Math.abs(parseFloat(rateInfo.perWeek)).toFixed(2)} {rateInfo.unit}/week
                {rateInfo.aggressive && " — aggressive rate"}
              </div>
            )}
          </div>

          {/* Block List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-ft-dim text-[10px] font-mono uppercase tracking-wider">
                Blocks ({blocks.length})
                {totalWeeks > 0 && (
                  <span className="text-ft-muted ml-1">· {totalWeeks}wk</span>
                )}
              </span>
              <button
                onClick={addBlock}
                className="text-ft-dim text-xs font-mono hover:text-ft-light transition-colors"
              >
                + Add
              </button>
            </div>

            <div className="space-y-1">
              {blocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => setActiveBlockId(block.id)}
                  className={`w-full text-left p-2.5 rounded border transition-colors ${
                    activeBlockId === block.id
                      ? "border-ft-white bg-ft-surface"
                      : "border-ft-border bg-ft-bg hover:border-ft-dim"
                  } ${block.phase ? `border-l-2 ${PHASE_COLORS[block.phase] ?? ""}` : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-ft-light truncate">
                      {block.name}
                    </span>
                    <span className="text-[10px] font-mono text-ft-muted shrink-0 ml-2">
                      {block.durationWeeks}wk
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {block.phase && (
                      <span
                        className={`text-[10px] font-mono ${
                          BLOCK_PHASES.find((p) => p.value === block.phase)?.color ?? "text-ft-dim"
                        }`}
                      >
                        {BLOCK_PHASES.find((p) => p.value === block.phase)?.label}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-ft-muted">
                      {block.days.length}d/wk
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {blocks.length === 0 && (
              <button
                onClick={addBlock}
                className="w-full p-4 border border-dashed border-ft-border rounded text-center hover:border-ft-dim transition-colors"
              >
                <span className="text-ft-dim text-xs font-mono">
                  + Add first block
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ─── Canvas ───────────────────────────────────── */}
        <div className="flex-1 p-5 lg:max-h-[calc(100vh-57px)] lg:overflow-y-auto">
          {/* Timeline */}
          {blocks.length > 0 && (
            <div className="mb-6">
              <Timeline segments={timelineSegments} />
            </div>
          )}

          {/* Goal Trajectory Preview */}
          {primaryGoal && primaryGoal.startValue && primaryGoal.targetValue && blocks.length > 0 && (
            <Card className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-ft-dim text-[10px] font-mono uppercase tracking-wider">
                  Goal Trajectory
                </span>
                <span className="text-ft-muted text-[10px] font-mono">
                  {primaryGoal.title}
                </span>
              </div>
              <div className="relative h-24">
                {(() => {
                  const startVal = parseFloat(primaryGoal.startValue);
                  const targetVal = parseFloat(primaryGoal.targetValue);
                  const minVal = Math.min(startVal, targetVal);
                  const maxVal = Math.max(startVal, targetVal);
                  const range = maxVal - minVal || 1;
                  const yForVal = (v: number) => 70 - ((v - minVal) / range) * 60;

                  // Compute benchmark points at end of each block
                  const benchmarkPoints: { x: number; y: number; label: string }[] = [];
                  let cumulativeWeeks = 0;
                  for (const block of blocks) {
                    cumulativeWeeks += block.durationWeeks;
                    if (block.benchmark?.targetValue) {
                      const bx = (cumulativeWeeks / totalWeeks) * 400;
                      const bv = parseFloat(block.benchmark.targetValue);
                      if (!isNaN(bv)) {
                        benchmarkPoints.push({
                          x: bx,
                          y: yForVal(bv),
                          label: `${bv}`,
                        });
                      }
                    }
                  }

                  // Build path through start → benchmarks → end
                  const points = [
                    { x: 0, y: yForVal(startVal) },
                    ...benchmarkPoints,
                    { x: 400, y: yForVal(targetVal) },
                  ];
                  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

                  return (
                    <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="none">
                      {/* Grid */}
                      <line x1="0" y1="0" x2="400" y2="0" stroke="rgb(var(--ft-border))" strokeWidth="0.5" />
                      <line x1="0" y1="40" x2="400" y2="40" stroke="rgb(var(--ft-border))" strokeWidth="0.5" strokeDasharray="4" />
                      <line x1="0" y1="80" x2="400" y2="80" stroke="rgb(var(--ft-border))" strokeWidth="0.5" />
                      {/* Block dividers */}
                      {blocks.reduce<{ lines: React.ReactNode[]; x: number }>(
                        (acc, block, i) => {
                          const w = (block.durationWeeks / totalWeeks) * 400;
                          const nextX = acc.x + w;
                          if (i < blocks.length - 1) {
                            acc.lines.push(
                              <line key={i} x1={nextX} y1="0" x2={nextX} y2="80" stroke="rgb(var(--ft-border))" strokeWidth="0.5" />
                            );
                          }
                          return { lines: acc.lines, x: nextX };
                        },
                        { lines: [], x: 0 }
                      ).lines}
                      {/* Trajectory path through benchmarks */}
                      <path d={pathD} fill="none" stroke="rgb(var(--ft-white))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Start dot */}
                      <circle cx="0" cy={yForVal(startVal)} r="3" fill="rgb(var(--ft-dim))" />
                      {/* End dot */}
                      <circle cx="400" cy={yForVal(targetVal)} r="3" fill="rgb(var(--ft-white))" />
                      {/* Benchmark dots */}
                      {benchmarkPoints.map((bp, i) => (
                        <circle key={i} cx={bp.x} cy={bp.y} r="4" fill="rgb(var(--ft-warn))" />
                      ))}
                    </svg>
                  );
                })()}
                {/* Labels */}
                <div className="absolute top-0 left-1 text-[10px] font-mono text-ft-dim">
                  {primaryGoal.startValue} {primaryGoal.targetUnit}
                </div>
                <div className="absolute bottom-0 right-1 text-[10px] font-mono text-ft-light">
                  {primaryGoal.targetValue} {primaryGoal.targetUnit}
                </div>
              </div>
              {/* Block phase labels under trajectory */}
              <div className="flex mt-1">
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    className="text-center"
                    style={{
                      width: `${((block.durationWeeks || 1) / totalWeeks) * 100}%`,
                    }}
                  >
                    <span
                      className={`text-[9px] font-mono ${
                        BLOCK_PHASES.find((p) => p.value === block.phase)?.color ?? "text-ft-muted"
                      }`}
                    >
                      {block.phase
                        ? BLOCK_PHASES.find((p) => p.value === block.phase)?.label
                        : block.name}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Active Block Editor */}
          {activeBlock ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-mono text-lg font-bold">
                    {activeBlock.name}
                  </h2>
                  {activeBlock.phase && (
                    <Tag>
                      {BLOCK_PHASES.find((p) => p.value === activeBlock.phase)?.label}
                    </Tag>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveBlock(activeBlock.id, -1)}
                    disabled={activeBlock.blockNumber === 1}
                    className="text-ft-dim text-xs font-mono hover:text-ft-light disabled:opacity-30 px-1.5 py-0.5"
                    title="Move earlier"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => moveBlock(activeBlock.id, 1)}
                    disabled={activeBlock.blockNumber === blocks.length}
                    className="text-ft-dim text-xs font-mono hover:text-ft-light disabled:opacity-30 px-1.5 py-0.5"
                    title="Move later"
                  >
                    ▶
                  </button>
                  <button
                    onClick={() => removeBlock(activeBlock.id)}
                    className="text-ft-danger text-xs font-mono hover:text-red-400 ml-2 px-1.5 py-0.5"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Block Config */}
              <Card className="mb-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-ft-dim text-[10px] font-mono uppercase tracking-wider mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={activeBlock.name}
                      onChange={(e) =>
                        updateBlock(activeBlock.id, { name: e.target.value })
                      }
                      className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-ft-dim text-[10px] font-mono uppercase tracking-wider mb-1">
                      Phase
                    </label>
                    <select
                      value={activeBlock.phase ?? ""}
                      onChange={(e) =>
                        updateBlock(activeBlock.id, {
                          phase: e.target.value || null,
                        })
                      }
                      className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
                    >
                      <option value="">None</option>
                      {BLOCK_PHASES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-ft-dim text-[10px] font-mono uppercase tracking-wider mb-1">
                      Weeks
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={52}
                      value={activeBlock.durationWeeks}
                      onChange={(e) =>
                        updateBlock(activeBlock.id, {
                          durationWeeks: Math.max(
                            1,
                            parseInt(e.target.value) || 1
                          ),
                        })
                      }
                      className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-ft-dim text-[10px] font-mono uppercase tracking-wider mb-1">
                      Days/Week
                    </label>
                    <select
                      value={activeBlock.scheduleDaysPerWeek}
                      onChange={(e) =>
                        updateBlock(activeBlock.id, {
                          scheduleDaysPerWeek: parseInt(e.target.value),
                        })
                      }
                      className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
                    >
                      {[2, 3, 4, 5, 6, 7].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-ft-dim text-[10px] font-mono uppercase tracking-wider mb-1">
                    Focus / Notes
                  </label>
                  <input
                    type="text"
                    value={activeBlock.focus}
                    onChange={(e) =>
                      updateBlock(activeBlock.id, { focus: e.target.value })
                    }
                    placeholder="e.g. Hypertrophy, higher volume"
                    className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
                  />
                </div>

                {/* Block benchmark / sub-target */}
                {primaryGoal && (
                  <div className="mt-3 pt-3 border-t border-ft-border">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-ft-dim text-[10px] font-mono uppercase tracking-wider">
                        Block Target
                      </label>
                      {!activeBlock.benchmark && (
                        <button
                          onClick={() =>
                            updateBlock(activeBlock.id, {
                              benchmark: {
                                label: `End of ${activeBlock.name}`,
                                targetValue: "",
                                targetUnit: primaryGoal.targetUnit || "lbs",
                              },
                            })
                          }
                          className="text-ft-dim text-[10px] font-mono hover:text-ft-light"
                        >
                          + Set
                        </button>
                      )}
                    </div>
                    {activeBlock.benchmark ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={activeBlock.benchmark.targetValue}
                          onChange={(e) =>
                            updateBlock(activeBlock.id, {
                              benchmark: {
                                ...activeBlock.benchmark!,
                                targetValue: e.target.value,
                              },
                            })
                          }
                          placeholder="Target"
                          className="w-20 bg-ft-bg border border-ft-card rounded px-2 py-1 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                        />
                        <span className="text-ft-muted text-[10px] font-mono">
                          {activeBlock.benchmark.targetUnit}
                        </span>
                        <button
                          onClick={() =>
                            updateBlock(activeBlock.id, { benchmark: null })
                          }
                          className="text-ft-muted text-[10px] hover:text-ft-danger ml-auto"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <p className="text-ft-muted text-[10px] font-mono">
                        Waypoint on the goal trajectory
                      </p>
                    )}
                  </div>
                )}
              </Card>

              {/* Day Grid */}
              <div className="mb-4">
                <span className="text-ft-dim text-[10px] font-mono uppercase tracking-wider mb-2 block">
                  Training Days
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeBlock.days.map((day) => (
                    <Card
                      key={day.id}
                      className={`border-l-2 ${
                        day.dayType === "rest"
                          ? "border-l-ft-muted opacity-60"
                          : day.dayType === "lifting"
                          ? "border-l-ft-white"
                          : day.dayType === "cardio"
                          ? "border-l-red-400"
                          : day.dayType === "conditioning"
                          ? "border-l-ft-warn"
                          : "border-l-ft-success"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={day.name}
                            onChange={(e) =>
                              updateDay(activeBlock.id, day.id, {
                                name: e.target.value,
                              })
                            }
                            className="flex-1 bg-transparent border-none text-xs font-mono font-bold text-ft-light focus:outline-none p-0"
                          />
                          <select
                            value={day.dayType}
                            onChange={(e) =>
                              updateDay(activeBlock.id, day.id, {
                                dayType: e.target.value,
                              })
                            }
                            className="bg-ft-bg border border-ft-card rounded px-1.5 py-0.5 text-[10px] font-mono text-ft-dim focus:outline-none shrink-0"
                          >
                            {DAY_TYPES.map((dt) => (
                              <option key={dt.value} value={dt.value}>
                                {dt.icon} {dt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Exercise list */}
                        {day.exercises.length > 0 && (
                          <div className="space-y-0.5">
                            {day.exercises.map((ex, ei) => (
                              <div
                                key={ex.id}
                                className="flex items-center justify-between py-0.5 group"
                              >
                                <span className="text-ft-dim text-[10px] font-mono truncate">
                                  <span className="text-ft-muted mr-1.5">
                                    {ei + 1}.
                                  </span>
                                  {ex.name}
                                </span>
                                <button
                                  onClick={() =>
                                    removeExerciseFromDay(
                                      activeBlock.id,
                                      day.id,
                                      ex.id
                                    )
                                  }
                                  className="text-ft-muted text-[10px] opacity-0 group-hover:opacity-100 hover:text-ft-danger transition-all shrink-0 ml-1"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add exercise button */}
                        {day.dayType !== "rest" && (
                          <button
                            onClick={() =>
                              openExerciseBrowser(activeBlock.id, day.id)
                            }
                            className="w-full text-center text-ft-muted text-[10px] font-mono py-1 border border-dashed border-ft-border rounded hover:border-ft-dim hover:text-ft-dim transition-colors"
                          >
                            + exercise
                          </button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick block duplication */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const num = blocks.length + 1;
                    const clone: BuilderBlock = {
                      ...activeBlock,
                      id: nextTempId(),
                      name: `${activeBlock.name} (copy)`,
                      blockNumber: num,
                      days: activeBlock.days.map((d) => ({
                        ...d,
                        id: nextTempId(),
                      })),
                    };
                    setBlocks((prev) => [...prev, clone]);
                    setActiveBlockId(clone.id);
                  }}
                  className="text-ft-dim text-xs font-mono hover:text-ft-light transition-colors border border-ft-border rounded px-3 py-1.5"
                >
                  Duplicate Block
                </button>
                <button
                  onClick={() => {
                    // Add deload block after current
                    const num = blocks.length + 1;
                    const deload: BuilderBlock = {
                      id: nextTempId(),
                      name: "Deload",
                      blockNumber: num,
                      phase: "deload",
                      durationWeeks: 1,
                      scheduleDaysPerWeek: activeBlock.scheduleDaysPerWeek,
                      focus: "Recovery — reduce volume 40-50%",
                      days: activeBlock.days.map((d) => ({
                        ...d,
                        id: nextTempId(),
                      })),
                      benchmark: null,
                    };
                    setBlocks((prev) => [...prev, deload]);
                    setActiveBlockId(deload.id);
                  }}
                  className="text-ft-dim text-xs font-mono hover:text-ft-light transition-colors border border-ft-border rounded px-3 py-1.5"
                >
                  + Deload After
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              {blocks.length === 0 ? (
                <>
                  <div className="text-4xl text-ft-muted mb-4">+</div>
                  <p className="text-ft-light font-mono text-sm font-bold mb-1">
                    Start building your program
                  </p>
                  <p className="text-ft-muted font-mono text-xs mb-6">
                    Add blocks manually or use a quick-start structure
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center mb-6">
                    <button
                      onClick={addBlock}
                      className="bg-ft-white text-ft-bg font-mono text-xs font-bold px-4 py-2 rounded hover:bg-ft-light transition-colors"
                    >
                      + Blank Block
                    </button>
                    <button
                      onClick={() => {
                        // 3-block hypertrophy → strength → peak
                        const templates = [
                          { name: "Hypertrophy", phase: "volume", weeks: 4 },
                          { name: "Strength", phase: "strength", weeks: 4 },
                          { name: "Peak / Test", phase: "peak", weeks: 2 },
                        ];
                        const newBlocks: BuilderBlock[] = templates.map(
                          (t, i) => ({
                            id: nextTempId(),
                            name: t.name,
                            blockNumber: i + 1,
                            phase: t.phase,
                            durationWeeks: t.weeks,
                            scheduleDaysPerWeek: daysPerWeek,
                            focus: "",
                            days: defaultDays(daysPerWeek),
                            benchmark: null,
                          })
                        );
                        setBlocks(newBlocks);
                        setActiveBlockId(newBlocks[0].id);
                      }}
                      className="border border-ft-border text-ft-dim font-mono text-xs px-4 py-2 rounded hover:border-ft-dim hover:text-ft-light transition-colors"
                    >
                      Hypertrophy → Strength → Peak
                    </button>
                    <button
                      onClick={() => {
                        // Cut program: cut → maintain → cut → maintain
                        const templates = [
                          { name: "Cut 1", phase: "cut", weeks: 4 },
                          { name: "Maintain", phase: "maintain", weeks: 2 },
                          { name: "Cut 2", phase: "cut", weeks: 4 },
                          { name: "Maintain", phase: "maintain", weeks: 2 },
                        ];
                        const newBlocks: BuilderBlock[] = templates.map(
                          (t, i) => ({
                            id: nextTempId(),
                            name: t.name,
                            blockNumber: i + 1,
                            phase: t.phase,
                            durationWeeks: t.weeks,
                            scheduleDaysPerWeek: daysPerWeek,
                            focus: "",
                            days: defaultDays(daysPerWeek),
                            benchmark: null,
                          })
                        );
                        setBlocks(newBlocks);
                        setActiveBlockId(newBlocks[0].id);
                      }}
                      className="border border-ft-border text-ft-dim font-mono text-xs px-4 py-2 rounded hover:border-ft-dim hover:text-ft-light transition-colors"
                    >
                      Cut → Maintain → Cut → Maintain
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-ft-muted font-mono text-xs">
                  Select a block from the sidebar to edit
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Exercise Browser Panel */}
      <ExerciseBrowserPanel
        open={exerciseBrowserOpen}
        onClose={() => {
          setExerciseBrowserOpen(false);
          setExerciseBrowserTarget(null);
        }}
        onSelect={(exercise) => {
          addExerciseToDay(exercise);
        }}
        title={
          exerciseBrowserTarget
            ? `Add to ${
                blocks
                  .find((b) => b.id === exerciseBrowserTarget.blockId)
                  ?.days.find((d) => d.id === exerciseBrowserTarget.dayId)
                  ?.name ?? "Day"
              }`
            : "Add Exercise"
        }
      />
    </div>
  );
}
