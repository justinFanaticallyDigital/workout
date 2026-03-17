"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import Stat from "@/components/ui/Stat";
import ProgressBar from "@/components/ui/ProgressBar";
import StatusIcon from "@/components/ui/StatusIcon";
import Timeline from "@/components/ui/Timeline";
import EditableExerciseTable from "@/components/ui/EditableExerciseTable";
import { useToast } from "@/components/ui/Toast";

interface BlockDayExercise {
  id: string;
  exercise: { name: string; equipment: string | null; movementPattern?: string | null };
  altExercise: { name: string; equipment: string | null } | null;
  targetSets: number | null;
  targetRepRange: string | null;
  targetRpe: string | null;
  progressionType: string;
  progressionIncrement: number | null;
  notes: string | null;
  sortOrder: number;
}

interface BlockDay {
  id: string;
  dayNumber: number;
  name: string;
  dayType: string;
  sortOrder: number;
  exercises: BlockDayExercise[];
}

interface Block {
  id: string;
  name: string;
  description: string | null;
  blockNumber: number;
  durationWeeks: number | null;
  status: string;
  focus: string | null;
  scheduleDaysPerWeek: number | null;
  days: BlockDay[];
  _count: { workouts: number };
}

interface Program {
  id: string;
  name: string;
  description: string | null;
  durationWeeks: number | null;
  startDate: string | null;
  status: string;
  goal: { id: string; title: string; type: string } | null;
  goals: { id: string; title: string; priority: string; type: string }[];
  blocks: Block[];
}

interface Benchmark {
  id: string;
  label: string;
  targetValue: number;
  targetUnit: string;
  targetDate: string | null;
  actualValue: number | null;
  achievedAt: string | null;
  block: { name: string; blockNumber: number } | null;
}

const DAY_TYPES = ["lifting", "cardio", "conditioning", "mobility", "rest"];

export default function ProgramWorkspacePage({
  params,
}: {
  params: { programId: string };
}) {
  const { programId } = params;
  const toast = useToast();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Block form
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockName, setBlockName] = useState("");
  const [blockDesc, setBlockDesc] = useState("");
  const [blockWeeks, setBlockWeeks] = useState("");
  const [blockFocus, setBlockFocus] = useState("");
  const [savingBlock, setSavingBlock] = useState(false);

  // Day form
  const [showDayForm, setShowDayForm] = useState(false);
  const [dayName, setDayName] = useState("");
  const [dayType, setDayType] = useState("lifting");
  const [savingDay, setSavingDay] = useState(false);

  // Benchmarks
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [showBenchmarkForm, setShowBenchmarkForm] = useState(false);
  const [bmLabel, setBmLabel] = useState("");
  const [bmTarget, setBmTarget] = useState("");
  const [bmUnit, setBmUnit] = useState("lbs");
  const [bmDate, setBmDate] = useState("");
  const [bmBlockId, setBmBlockId] = useState("");
  const [savingBm, setSavingBm] = useState(false);

  // Nutrition targets per block
  const [blockNutrition, setBlockNutrition] = useState<Record<string, {
    calories: number | null; protein: number | null; carbs: number | null; fat: number | null; label: string;
  } | null>>({});
  const [showNutritionForm, setShowNutritionForm] = useState(false);
  const [ntGoalType, setNtGoalType] = useState("maintenance");
  const [ntCalories, setNtCalories] = useState("");
  const [ntProtein, setNtProtein] = useState("");
  const [ntCarbs, setNtCarbs] = useState("");
  const [ntFat, setNtFat] = useState("");
  const [savingNt, setSavingNt] = useState(false);

  // Deletion undo state
  const [pendingDelete, setPendingDelete] = useState<{
    exerciseId: string;
    dayId: string;
    exercise: BlockDayExercise;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);

  // Close all forms except the one being opened
  const closeAllForms = () => {
    setShowBlockForm(false);
    setShowDayForm(false);
    setShowBenchmarkForm(false);
    setShowNutritionForm(false);
  };

  const openForm = (setter: (v: boolean) => void) => {
    closeAllForms();
    setter(true);
  };


  useEffect(() => {
    fetch(`/api/programs/${programId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setProgram(data);
        // Auto-select first active block, or first block
        if (data?.blocks?.length > 0) {
          const active = data.blocks.find((b: Block) => b.status === "active");
          setActiveBlockId(active?.id ?? data.blocks[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch benchmarks
    fetch(`/api/programs/${programId}/benchmarks`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.benchmarks) setBenchmarks(data.benchmarks); })
      .catch(() => {});
  }, [programId]);

  const activeBlock = program?.blocks.find((b) => b.id === activeBlockId) ?? null;

  // Track which blocks we've already fetched nutrition for
  const fetchedNutritionRef = useRef<Set<string>>(new Set());

  // Fetch nutrition target when active block changes
  useEffect(() => {
    if (!activeBlockId) return;
    if (fetchedNutritionRef.current.has(activeBlockId)) return;
    fetchedNutritionRef.current.add(activeBlockId);

    fetch(`/api/nutrition/targets?blockId=${activeBlockId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.target) {
          setBlockNutrition((prev) => ({
            ...prev,
            [activeBlockId]: {
              calories: data.target.calories ? Number(data.target.calories) : null,
              protein: data.target.protein ? Number(data.target.protein) : null,
              carbs: data.target.carbs ? Number(data.target.carbs) : null,
              fat: data.target.fat ? Number(data.target.fat) : null,
              label: data.target.label,
            },
          }));
        } else {
          setBlockNutrition((prev) => ({ ...prev, [activeBlockId]: null }));
        }
      })
      .catch(() => {
        setBlockNutrition((prev) => ({ ...prev, [activeBlockId]: null }));
      });
  }, [activeBlockId]);

  const handleSetBlockNutrition = async (autoCalc: boolean) => {
    if (!activeBlockId) return;
    setSavingNt(true);
    try {
      const payload: Record<string, unknown> = {
        blockId: activeBlockId,
        label: activeBlock?.name ? `${activeBlock.name} Target` : "Block Target",
      };
      if (autoCalc) {
        payload.autoCalc = true;
        payload.goalType = ntGoalType;
      } else {
        payload.calories = ntCalories ? Number(ntCalories) : null;
        payload.protein = ntProtein ? Number(ntProtein) : null;
        payload.carbs = ntCarbs ? Number(ntCarbs) : null;
        payload.fat = ntFat ? Number(ntFat) : null;
      }
      const res = await fetch("/api/nutrition/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const target = await res.json();
        setBlockNutrition((prev) => ({
          ...prev,
          [activeBlockId]: {
            calories: target.calories ? Number(target.calories) : null,
            protein: target.protein ? Number(target.protein) : null,
            carbs: target.carbs ? Number(target.carbs) : null,
            fat: target.fat ? Number(target.fat) : null,
            label: target.label,
          },
        }));
        setShowNutritionForm(false);
        toast.success("Nutrition target set");
      }
    } finally {
      setSavingNt(false);
    }
  };

  const toggleDay = (dayId: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockName.trim()) return;
    setSavingBlock(true);
    try {
      const res = await fetch(`/api/programs/${programId}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: blockName.trim(),
          description: blockDesc.trim() || null,
          durationWeeks: blockWeeks ? parseInt(blockWeeks) : null,
          focus: blockFocus.trim() || null,
          status: program?.blocks.length === 0 ? "active" : "upcoming",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const block = await res.json();
      const newBlock = { ...block, days: [], _count: { workouts: 0 } };
      setProgram((prev) =>
        prev ? { ...prev, blocks: [...prev.blocks, newBlock] } : prev
      );
      setActiveBlockId(block.id);
      setShowBlockForm(false);
      setBlockName("");
      setBlockDesc("");
      setBlockWeeks("");
      setBlockFocus("");
    } catch {
      toast.error("Failed to create block.");
    }
    setSavingBlock(false);
  };

  const handleAddDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayName.trim() || !activeBlockId) return;
    setSavingDay(true);
    try {
      const res = await fetch(`/api/blocks/${activeBlockId}/days`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: dayName.trim(), dayType }),
      });
      if (!res.ok) throw new Error("Failed");
      const day = await res.json();
      setProgram((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          blocks: prev.blocks.map((b) =>
            b.id === activeBlockId
              ? { ...b, days: [...b.days, { ...day, exercises: [] }] }
              : b
          ),
        };
      });
      setShowDayForm(false);
      setDayName("");
      setDayType("lifting");
    } catch {
      toast.error("Failed to create day.");
    }
    setSavingDay(false);
  };

  // Exercise CRUD handlers for EditableExerciseTable
  const handleExerciseUpdate = async (exerciseId: string, field: string, value: string | number | null) => {
    // Find which day this exercise belongs to
    let dayId: string | null = null;
    for (const b of program?.blocks ?? []) {
      for (const d of b.days) {
        if (d.exercises.some((e) => e.id === exerciseId)) {
          dayId = d.id;
          break;
        }
      }
    }
    if (!dayId) return;

    try {
      await fetch(`/api/blocks/day/${dayId}/exercises/${exerciseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      // Optimistic update
      setProgram((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          blocks: prev.blocks.map((b) => ({
            ...b,
            days: b.days.map((d) => ({
              ...d,
              exercises: d.exercises.map((e) =>
                e.id === exerciseId ? { ...e, [field]: value } : e
              ),
            })),
          })),
        };
      });
    } catch {
      toast.error("Failed to update exercise.");
    }
  };

  const handleExerciseDelete = async (exerciseId: string) => {
    let dayId: string | null = null;
    let deletedExercise: BlockDayExercise | null = null;
    for (const b of program?.blocks ?? []) {
      for (const d of b.days) {
        const found = d.exercises.find((e) => e.id === exerciseId);
        if (found) {
          dayId = d.id;
          deletedExercise = found;
          break;
        }
      }
    }
    if (!dayId || !deletedExercise) return;

    // Cancel any existing pending delete
    if (pendingDelete) {
      clearTimeout(pendingDelete.timer);
      // Execute the previous pending delete immediately
      fetch(`/api/blocks/day/${pendingDelete.dayId}/exercises/${pendingDelete.exerciseId}`, { method: "DELETE" }).catch(() => {});
    }

    // Optimistically remove from UI
    const capturedDayId = dayId;
    setProgram((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        blocks: prev.blocks.map((b) => ({
          ...b,
          days: b.days.map((d) => ({
            ...d,
            exercises: d.exercises.filter((e) => e.id !== exerciseId),
          })),
        })),
      };
    });

    // Set up undo window (10 seconds)
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/blocks/day/${capturedDayId}/exercises/${exerciseId}`, { method: "DELETE" });
      } catch {
        toast.error("Failed to delete exercise.");
      }
      setPendingDelete(null);
    }, 10000);

    setPendingDelete({ exerciseId, dayId: capturedDayId, exercise: deletedExercise, timer });

    toast.success(
      `Removed ${deletedExercise.exercise.name}`,
      10000,
      {
        label: "Undo",
        onClick: () => {
          clearTimeout(timer);
          // Restore the exercise in UI
          setProgram((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              blocks: prev.blocks.map((b) => ({
                ...b,
                days: b.days.map((d) =>
                  d.id === capturedDayId
                    ? { ...d, exercises: [...d.exercises, deletedExercise!] }
                    : d
                ),
              })),
            };
          });
          setPendingDelete(null);
          toast.success("Exercise restored");
        },
      }
    );
  };

  const handleExerciseReorder = async (dayId: string, exerciseIds: string[]) => {
    try {
      await fetch(`/api/blocks/day/${dayId}/exercises/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: exerciseIds }),
      });
      // Optimistic reorder
      setProgram((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          blocks: prev.blocks.map((b) => ({
            ...b,
            days: b.days.map((d) => {
              if (d.id !== dayId) return d;
              const ordered = exerciseIds
                .map((id) => d.exercises.find((e) => e.id === id))
                .filter(Boolean) as typeof d.exercises;
              return { ...d, exercises: ordered };
            }),
          })),
        };
      });
    } catch {
      toast.error("Failed to reorder exercises.");
    }
  };

  const handleAddExerciseToDay = async (dayId: string, exerciseId: string, data: {
    targetSets: number | null;
    targetRepRange: string | null;
    targetRpe: string | null;
    progressionType: string;
    progressionIncrement: number | null;
  }) => {
    try {
      const res = await fetch(`/api/blocks/day/${dayId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId, ...data }),
      });
      if (!res.ok) throw new Error("Failed");
      const bde = await res.json();
      setProgram((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          blocks: prev.blocks.map((b) => ({
            ...b,
            days: b.days.map((d) =>
              d.id === dayId
                ? { ...d, exercises: [...d.exercises, { ...bde, altExercise: null, progressionIncrement: bde.progressionIncrement ?? null }] }
                : d
            ),
          })),
        };
      });
    } catch {
      toast.error("Failed to add exercise.");
    }
  };

  // Benchmark handlers
  const handleAddBenchmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bmLabel.trim() || !bmTarget) return;
    setSavingBm(true);
    try {
      const res = await fetch(`/api/programs/${programId}/benchmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: bmLabel.trim(),
          targetValue: parseFloat(bmTarget),
          targetUnit: bmUnit,
          targetDate: bmDate || null,
          blockId: bmBlockId || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const bm = await res.json();
      setBenchmarks((prev) => [...prev, bm]);
      setShowBenchmarkForm(false);
      setBmLabel("");
      setBmTarget("");
      setBmUnit("lbs");
      setBmDate("");
      setBmBlockId("");
    } catch {
      toast.error("Failed to create benchmark.");
    }
    setSavingBm(false);
  };

  const handleUpdateBenchmarkActual = async (bmId: string, actualValue: string) => {
    const val = actualValue ? parseFloat(actualValue) : null;
    try {
      const res = await fetch(`/api/programs/${programId}/benchmarks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ benchmarkId: bmId, actualValue: val }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBenchmarks((prev) =>
          prev.map((b) => b.id === bmId ? updated : b)
        );
      }
    } catch {
      toast.error("Failed to update benchmark.");
    }
  };

  // Progress calculation
  const totalWeeks = program?.durationWeeks ?? 0;
  let currentWeek = 0;
  if (program?.startDate && totalWeeks > 0) {
    const start = new Date(program.startDate);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    currentWeek = Math.min(Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)), totalWeeks);
  }
  const progressPct = totalWeeks > 0 ? Math.round((currentWeek / totalWeeks) * 100) : 0;
  const totalSessions = program?.blocks.reduce((sum, b) => sum + (b._count?.workouts ?? 0), 0) ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-ft-bg text-ft-white flex items-center justify-center">
        <p className="text-ft-dim font-mono text-sm">Loading...</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-ft-bg text-ft-white p-6">
        <p className="text-ft-light font-mono">Program not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/programs"
        className="inline-flex items-center gap-1.5 text-ft-dim text-sm font-mono hover:text-ft-light transition-colors mb-4"
      >
        <span>&larr;</span>
        <span>Programs</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <StatusIcon type="program" status={program.status as "active" | "paused" | "completed"} size="md" />
            <h1 className="font-mono text-2xl font-bold tracking-tight">
              {program.name}
            </h1>
            {program.status === "active" && <Tag className="bg-ft-white text-ft-bg">Active</Tag>}
            {program.status === "completed" && <Tag>Completed</Tag>}
            {program.status === "paused" && <Tag variant="warn">Paused</Tag>}
          </div>
          {program.description && (
            <p className="text-ft-dim text-sm font-mono">{program.description}</p>
          )}
        </div>
      </div>

      {/* Timeline */}
      {program.blocks.length > 0 && (
        <Timeline
          className="mb-4"
          segments={program.blocks.map((b) => ({
            label: b.name,
            width: b.durationWeeks ?? 1,
            status: b.status as "active" | "completed" | "upcoming",
          }))}
          currentPosition={progressPct > 0 ? progressPct : undefined}
          milestones={benchmarks
            .filter((bm) => bm.targetDate && program.startDate && totalWeeks > 0)
            .map((bm) => {
              const start = new Date(program.startDate!).getTime();
              const end = start + totalWeeks * 7 * 24 * 60 * 60 * 1000;
              const target = new Date(bm.targetDate!).getTime();
              const pos = Math.max(0, Math.min(100, ((target - start) / (end - start)) * 100));
              return {
                label: bm.label,
                position: pos,
                achieved: bm.actualValue != null && bm.actualValue >= bm.targetValue,
              };
            })}
        />
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Card><Stat label="Sessions" value={totalSessions} small /></Card>
        <Card><Stat label="Blocks" value={program.blocks.length} small /></Card>
        <Card>
          <Stat
            label="Progress"
            value={totalWeeks > 0 ? `Wk ${currentWeek}/${totalWeeks}` : "—"}
            small
          />
        </Card>
        <Card><Stat label="Goal" value={program.goals?.[0]?.title ?? program.goal?.title ?? "—"} small /></Card>
      </div>

      {/* Benchmarks */}
      {(benchmarks.length > 0 || showBenchmarkForm) && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono text-sm font-bold text-ft-white">Benchmarks</h3>
            {!showBenchmarkForm && (
              <button
                onClick={() => openForm(setShowBenchmarkForm)}
                className="text-ft-dim text-xs font-mono hover:text-ft-light"
              >
                + Add
              </button>
            )}
          </div>
          <div className="space-y-3">
            {benchmarks.map((bm) => {
              const pct = bm.actualValue != null
                ? Math.min(100, Math.round((bm.actualValue / bm.targetValue) * 100))
                : 0;
              const achieved = bm.actualValue != null && bm.actualValue >= bm.targetValue;
              return (
                <div key={bm.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-ft-light text-xs font-mono font-bold">{bm.label}</span>
                      {bm.block && (
                        <span className="text-ft-muted text-[10px] font-mono">{bm.block.name}</span>
                      )}
                      {achieved && <Tag variant="success">Hit</Tag>}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Actual"
                        defaultValue={bm.actualValue ?? ""}
                        onBlur={(e) => handleUpdateBenchmarkActual(bm.id, e.target.value)}
                        className="w-16 bg-ft-bg border border-ft-card rounded px-1.5 py-0.5 text-xs font-mono text-ft-white text-center focus:outline-none focus:border-ft-dim"
                      />
                      <span className="text-ft-dim text-[10px] font-mono">
                        / {bm.targetValue} {bm.targetUnit}
                      </span>
                    </div>
                  </div>
                  <ProgressBar value={pct} max={100} />
                  {bm.targetDate && (
                    <span className="text-ft-muted text-[10px] font-mono">
                      Target: {new Date(bm.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {bm.achievedAt && ` · Achieved: ${new Date(bm.achievedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {showBenchmarkForm && (
            <form onSubmit={handleAddBenchmark} className="mt-3 pt-3 border-t border-ft-border space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={bmLabel}
                  onChange={(e) => setBmLabel(e.target.value)}
                  placeholder="Benchmark label"
                  required
                  className="bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                />
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={bmTarget}
                    onChange={(e) => setBmTarget(e.target.value)}
                    placeholder="Target"
                    required
                    className="flex-1 bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                  />
                  <select
                    value={bmUnit}
                    onChange={(e) => setBmUnit(e.target.value)}
                    className="bg-ft-bg border border-ft-card rounded px-1 py-1.5 text-xs font-mono text-ft-white focus:outline-none focus:border-ft-dim"
                  >
                    <option value="lbs">lbs</option>
                    <option value="kg">kg</option>
                    <option value="reps">reps</option>
                    <option value="%">%</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={bmDate}
                  onChange={(e) => setBmDate(e.target.value)}
                  className="bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white focus:outline-none focus:border-ft-dim"
                />
                <select
                  value={bmBlockId}
                  onChange={(e) => setBmBlockId(e.target.value)}
                  className="bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white focus:outline-none focus:border-ft-dim"
                >
                  <option value="">All blocks</option>
                  {program.blocks.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBenchmarkForm(false)}
                  className="text-ft-dim text-xs font-mono hover:text-ft-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBm || !bmLabel.trim() || !bmTarget}
                  className="bg-ft-white text-ft-bg font-mono text-xs font-bold px-3 py-1 rounded hover:bg-ft-light disabled:opacity-50"
                >
                  {savingBm ? "..." : "Add Benchmark"}
                </button>
              </div>
            </form>
          )}
        </Card>
      )}
      {benchmarks.length === 0 && !showBenchmarkForm && (
        <div className="mb-6">
          <button
            onClick={() => openForm(setShowBenchmarkForm)}
            className="text-ft-muted text-xs font-mono hover:text-ft-light transition-colors"
          >
            + Add Benchmarks
          </button>
        </div>
      )}

      {/* Block Nutrition Target */}
      {activeBlockId && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-mono text-sm font-bold text-ft-white">
              Nutrition Target
              {activeBlock && <span className="text-ft-dim font-normal ml-2">({activeBlock.name})</span>}
            </h3>
            {!showNutritionForm && (
              <button
                onClick={() => openForm(setShowNutritionForm)}
                className="text-ft-dim text-xs font-mono hover:text-ft-light"
              >
                {blockNutrition[activeBlockId] ? "Edit" : "+ Set Target"}
              </button>
            )}
          </div>
          {blockNutrition[activeBlockId] ? (
            <div className="grid grid-cols-4 gap-3">
              <div>
                <span className="text-ft-dim text-xs font-mono block">Calories</span>
                <span className="text-ft-white text-sm font-mono font-bold">
                  {blockNutrition[activeBlockId]!.calories ?? "—"}
                </span>
              </div>
              <div>
                <span className="text-ft-dim text-xs font-mono block">Protein</span>
                <span className="text-ft-white text-sm font-mono font-bold">
                  {blockNutrition[activeBlockId]!.protein ? `${blockNutrition[activeBlockId]!.protein}g` : "—"}
                </span>
              </div>
              <div>
                <span className="text-ft-dim text-xs font-mono block">Carbs</span>
                <span className="text-ft-white text-sm font-mono font-bold">
                  {blockNutrition[activeBlockId]!.carbs ? `${blockNutrition[activeBlockId]!.carbs}g` : "—"}
                </span>
              </div>
              <div>
                <span className="text-ft-dim text-xs font-mono block">Fat</span>
                <span className="text-ft-white text-sm font-mono font-bold">
                  {blockNutrition[activeBlockId]!.fat ? `${blockNutrition[activeBlockId]!.fat}g` : "—"}
                </span>
              </div>
            </div>
          ) : !showNutritionForm ? (
            <p className="text-ft-muted text-xs font-mono">No nutrition target set for this block</p>
          ) : null}

          {showNutritionForm && (
            <div className="mt-3 border-t border-ft-border pt-3 space-y-3">
              <div>
                <label className="text-ft-dim text-xs font-mono block mb-1">Auto-calculate from body weight</label>
                <div className="flex gap-2 items-center">
                  <select
                    value={ntGoalType}
                    onChange={(e) => setNtGoalType(e.target.value)}
                    className="bg-ft-bg border border-ft-border rounded px-2 py-1 text-xs font-mono text-ft-white"
                  >
                    <option value="bulk">Bulk (+300 cal)</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="cut">Cut (-400 cal)</option>
                  </select>
                  <button
                    onClick={() => handleSetBlockNutrition(true)}
                    disabled={savingNt}
                    className="px-3 py-1 text-xs font-mono bg-ft-success text-ft-bg rounded hover:opacity-90 disabled:opacity-50"
                  >
                    Auto Calculate
                  </button>
                </div>
              </div>
              <div className="text-ft-muted text-xs font-mono text-center">— or set manually —</div>
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="number" placeholder="Calories" value={ntCalories}
                  onChange={(e) => setNtCalories(e.target.value)}
                  className="bg-ft-bg border border-ft-border rounded px-2 py-1 text-xs font-mono text-ft-white"
                />
                <input
                  type="number" placeholder="Protein (g)" value={ntProtein}
                  onChange={(e) => setNtProtein(e.target.value)}
                  className="bg-ft-bg border border-ft-border rounded px-2 py-1 text-xs font-mono text-ft-white"
                />
                <input
                  type="number" placeholder="Carbs (g)" value={ntCarbs}
                  onChange={(e) => setNtCarbs(e.target.value)}
                  className="bg-ft-bg border border-ft-border rounded px-2 py-1 text-xs font-mono text-ft-white"
                />
                <input
                  type="number" placeholder="Fat (g)" value={ntFat}
                  onChange={(e) => setNtFat(e.target.value)}
                  className="bg-ft-bg border border-ft-border rounded px-2 py-1 text-xs font-mono text-ft-white"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowNutritionForm(false)}
                  className="text-ft-dim text-xs font-mono hover:text-ft-light"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSetBlockNutrition(false)}
                  disabled={savingNt || !ntCalories}
                  className="px-3 py-1 text-xs font-mono bg-ft-white text-ft-bg rounded hover:bg-ft-light disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Workspace: Blocks panel + Day details */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4">
        {/* Left: Blocks Panel */}
        <div className="lg:block">
          {/* Mobile: horizontal scroll */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {program.blocks.map((block) => (
              <button
                key={block.id}
                onClick={() => setActiveBlockId(block.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded font-mono text-sm text-left whitespace-nowrap transition-colors ${
                  block.id === activeBlockId
                    ? "bg-ft-surface border border-ft-white text-ft-white"
                    : "bg-ft-bg border border-ft-border text-ft-dim hover:text-ft-light hover:border-ft-dim"
                }`}
              >
                <StatusIcon type="block" status={block.status as "active" | "completed" | "upcoming"} />
                <span className="font-bold">{block.name}</span>
                {block.durationWeeks && (
                  <span className="text-[10px] text-ft-muted">{block.durationWeeks}wk</span>
                )}
              </button>
            ))}
            <button
              onClick={() => showBlockForm ? setShowBlockForm(false) : openForm(setShowBlockForm)}
              className="flex items-center gap-1 px-3 py-2 rounded font-mono text-xs text-ft-muted hover:text-ft-light border border-dashed border-ft-border hover:border-ft-dim transition-colors whitespace-nowrap"
            >
              + Block
            </button>
          </div>

          {/* Add Block Form (inline) */}
          {showBlockForm && (
            <form onSubmit={handleAddBlock} className="mt-3 space-y-2">
              <input
                type="text"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                placeholder="Block name"
                required
                className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
              />
              <input
                type="text"
                value={blockFocus}
                onChange={(e) => setBlockFocus(e.target.value)}
                placeholder="Focus (optional)"
                className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={blockDesc}
                  onChange={(e) => setBlockDesc(e.target.value)}
                  placeholder="Description"
                  className="bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                />
                <input
                  type="number"
                  value={blockWeeks}
                  onChange={(e) => setBlockWeeks(e.target.value)}
                  placeholder="Weeks"
                  min="1"
                  className="bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBlockForm(false)}
                  className="text-ft-dim text-xs font-mono hover:text-ft-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBlock || !blockName.trim()}
                  className="bg-ft-white text-ft-bg font-mono text-xs font-bold px-3 py-1 rounded hover:bg-ft-light disabled:opacity-50"
                >
                  {savingBlock ? "..." : "Add"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Day Details */}
        <div className="min-w-0">
          {activeBlock ? (
            <>
              {/* Block header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-mono text-lg font-bold">{activeBlock.name}</h2>
                    {activeBlock.focus && (
                      <span className="text-ft-dim text-xs font-mono">&middot; {activeBlock.focus}</span>
                    )}
                  </div>
                  <p className="text-ft-muted text-xs font-mono">
                    {activeBlock.durationWeeks ? `${activeBlock.durationWeeks} weeks · ` : ""}
                    {activeBlock.days.length} days · {activeBlock._count.workouts} sessions
                  </p>
                </div>
                <button
                  onClick={() => showDayForm ? setShowDayForm(false) : openForm(setShowDayForm)}
                  className="text-ft-dim text-xs font-mono hover:text-ft-light border border-ft-border rounded px-3 py-1 transition-colors"
                >
                  + Day
                </button>
              </div>

              {/* Add Day Form */}
              {showDayForm && (
                <Card className="mb-4">
                  <form onSubmit={handleAddDay} className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-ft-dim text-[10px] font-mono uppercase tracking-wider mb-1">Name</label>
                      <input
                        type="text"
                        value={dayName}
                        onChange={(e) => setDayName(e.target.value)}
                        placeholder="e.g. Upper Push"
                        required
                        className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                      />
                    </div>
                    <div>
                      <label className="block text-ft-dim text-[10px] font-mono uppercase tracking-wider mb-1">Type</label>
                      <select
                        value={dayType}
                        onChange={(e) => setDayType(e.target.value)}
                        className="bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white focus:outline-none focus:border-ft-dim"
                      >
                        {DAY_TYPES.map((t) => (
                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDayForm(false)}
                      className="text-ft-dim text-xs font-mono hover:text-ft-light px-2 py-1.5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingDay || !dayName.trim()}
                      className="bg-ft-white text-ft-bg font-mono text-xs font-bold px-3 py-1.5 rounded hover:bg-ft-light disabled:opacity-50"
                    >
                      {savingDay ? "..." : "Add"}
                    </button>
                  </form>
                </Card>
              )}

              {/* Days list (accordion) */}
              {activeBlock.days.length === 0 && !showDayForm ? (
                <Card className="border-dashed">
                  <p className="text-ft-muted font-mono text-sm text-center py-6">
                    No training days yet. Click &ldquo;+ Day&rdquo; to start building.
                  </p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {activeBlock.days.map((day) => {
                    const isExpanded = expandedDays.has(day.id);
                    return (
                      <div key={day.id} className="border border-ft-border rounded bg-ft-surface/50">
                        {/* Day Header (clickable) */}
                        <button
                          onClick={() => toggleDay(day.id)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-ft-surface/80 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <StatusIcon
                              type="day"
                              dayType={day.dayType as "lifting" | "cardio" | "conditioning" | "mobility" | "rest"}
                            />
                            <span className="font-mono text-sm font-bold text-ft-white">
                              Day {day.dayNumber} &middot; {day.name}
                            </span>
                            <Tag>{day.dayType}</Tag>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-ft-dim text-xs font-mono">
                              {day.exercises.length} exercises
                            </span>
                            <span className="text-ft-muted text-xs">
                              {isExpanded ? "▾" : "▸"}
                            </span>
                          </div>
                        </button>

                        {/* Expanded: exercises (editable table) */}
                        {isExpanded && (
                          <div className="border-t border-ft-border px-4 py-3">
                            <EditableExerciseTable
                              dayId={day.id}
                              exercises={day.exercises}
                              onUpdate={handleExerciseUpdate}
                              onDelete={handleExerciseDelete}
                              onReorder={(ids) => handleExerciseReorder(day.id, ids)}
                              onAddExercise={handleAddExerciseToDay}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <Card className="border-dashed">
              <p className="text-ft-muted font-mono text-sm text-center py-8">
                Create a block to get started
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
