"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import Stat from "@/components/ui/Stat";
import StatusIcon from "@/components/ui/StatusIcon";
import Timeline from "@/components/ui/Timeline";
import EditableExerciseTable from "@/components/ui/EditableExerciseTable";
import CategoryLaneView from "@/components/ui/CategoryLaneView";
import { useToast } from "@/components/ui/Toast";
import { PlanningSection, PlanningSectionHeader, PlanningStamp } from "@/components/ui/PlanningSection";

interface BlockDayExercise {
  id: string;
  exercise: { id?: string; name: string; equipment: string | null; movementPattern?: string | null };
  altExercise: { id?: string; name: string; equipment: string | null } | null;
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
  phase: string | null;
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
  }, [programId]);

  const activeBlock = program?.blocks.find((b) => b.id === activeBlockId) ?? null;

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
      await fetch(`/api/blocks/day/${dayId}/exercises/${exerciseId}`, { method: "DELETE" });
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
    } catch {
      toast.error("Failed to delete exercise.");
    }
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
                ? { ...d, exercises: [...d.exercises, { ...bde, altExercise: null, progressionIncrement: null }] }
                : d
            ),
          })),
        };
      });
    } catch {
      toast.error("Failed to add exercise.");
    }
  };

  const handleSetAlternative = async (exerciseId: string, altExerciseId: string | null) => {
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
        body: JSON.stringify({ altExerciseId }),
      });
      // Refetch to get updated alt exercise data
      const res = await fetch(`/api/programs/${programId}`);
      if (res.ok) {
        const data = await res.json();
        setProgram(data);
      }
    } catch {
      toast.error("Failed to set alternative.");
    }
  };

  const handleSwapExercise = async (blockDayExerciseId: string, newExerciseId: string) => {
    try {
      // Find which day this exercise belongs to
      let dayId: string | null = null;
      for (const b of program?.blocks ?? []) {
        for (const d of b.days) {
          if (d.exercises.some((e) => e.id === blockDayExerciseId)) {
            dayId = d.id;
            break;
          }
        }
      }
      if (!dayId) return;

      await fetch(`/api/blocks/day/${dayId}/exercises/${blockDayExerciseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: newExerciseId }),
      });

      // Refetch to get the new exercise data
      const res = await fetch(`/api/programs/${programId}`);
      if (res.ok) {
        const data = await res.json();
        setProgram(data);
      }
    } catch {
      toast.error("Failed to swap exercise.");
    }
  };

  // Parse warnings from description
  const parseDescription = (desc: string | null): { text: string; warnings: string[] } => {
    if (!desc) return { text: "", warnings: [] };
    const parts = desc.split("\n---WARNINGS---\n");
    if (parts.length < 2) return { text: desc, warnings: [] };
    try {
      return { text: parts[0], warnings: JSON.parse(parts[1]) };
    } catch {
      return { text: parts[0], warnings: [] };
    }
  };

  const { text: descriptionText, warnings: engineWarnings } = parseDescription(program?.description ?? null);

  // Check if this is a generated program (has category metadata)
  const isGenerated = program?.blocks.some((b) =>
    b.days.some((d) =>
      d.exercises.some((e) => e.notes?.match(/^\[.+\|.+\|/))
    )
  ) ?? false;

  // Phase badge helpers
  const PHASE_BADGES: Record<string, { label: string; color: string }> = {
    accumulation: { label: "Volume", color: "bg-blue-500/20 text-blue-400" },
    intensification: { label: "Strength", color: "bg-orange-500/20 text-orange-400" },
    peaking: { label: "Peak", color: "bg-red-500/20 text-red-400" },
    deload: { label: "Deload", color: "bg-emerald-500/20 text-emerald-400" },
    prep: { label: "Prep", color: "bg-purple-500/20 text-purple-400" },
    peak_week: { label: "Peak Week", color: "bg-pink-500/20 text-pink-400" },
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
        <p className="text-ft-dim font-body text-sm">Loading...</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-ft-bg text-ft-white p-6">
        <p className="text-ft-light font-body">Program not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/programs"
        className="inline-flex items-center gap-1.5 text-ft-dim text-sm font-body hover:text-ft-light transition-colors mb-4"
      >
        <span>&larr;</span>
        <span>Programs</span>
      </Link>

      {/* Planning-mode header */}
      <div className="ft-card relative bg-ft-surface border border-ft-border p-5 mb-6">
        <div className="absolute top-3 right-3">
          <PlanningStamp />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <StatusIcon type="program" status={program.status as "active" | "paused" | "completed"} size="md" />
          {program.status === "active" && <Tag className="bg-ft-success/20 text-ft-success border border-ft-success/40">Active</Tag>}
          {program.status === "completed" && <Tag>Completed</Tag>}
          {program.status === "paused" && <Tag variant="warn">Paused</Tag>}
          {isGenerated && (
            <span className="text-[10px] font-body uppercase tracking-[0.2em] px-1.5 py-0.5 bg-ft-accent/15 text-ft-accent border border-ft-accent/30">
              Generated
            </span>
          )}
        </div>
        <h1 className="font-display text-3xl text-ft-white tracking-wide leading-tight">
          {program.name}
        </h1>
        {totalWeeks > 0 && (
          <div className="font-body text-[10px] uppercase tracking-[0.18em] text-ft-light font-semibold mt-1">
            {activeBlock ? `BLOCK ${activeBlock.blockNumber} / ${program.blocks.length}` : `${program.blocks.length} BLOCKS`}
            {currentWeek > 0 && ` · WK ${currentWeek} / ${totalWeeks}`}
          </div>
        )}
        {descriptionText && (
          <p className="text-ft-light text-sm font-body mt-3">{descriptionText}</p>
        )}
      </div>

      {/* Section 01 — Timeline */}
      {program.blocks.length > 0 && (
        <PlanningSection num="01" title="timeline" sub="block layout · phase markers · current week">
          <Timeline
            segments={program.blocks.map((b) => ({
              label: b.name,
              width: b.durationWeeks ?? 1,
              status: b.status as "active" | "completed" | "upcoming",
              phase: b.phase,
            }))}
            currentPosition={progressPct > 0 ? progressPct : undefined}
          />
        </PlanningSection>
      )}

      {/* Section 02 — Overview */}
      <PlanningSection num="02" title="overview" sub="sessions · blocks · progress · goal">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="ft-card"><Stat label="Sessions" value={totalSessions} small /></Card>
          <Card className="ft-card"><Stat label="Blocks" value={program.blocks.length} small /></Card>
          <Card className="ft-card">
            <Stat
              label="Progress"
              value={totalWeeks > 0 ? `Wk ${currentWeek}/${totalWeeks}` : "—"}
              small
            />
          </Card>
          <Card className="ft-card"><Stat label="Goal" value={program.goals?.[0]?.title ?? program.goal?.title ?? "—"} small /></Card>
        </div>

        {engineWarnings.length > 0 && (
          <div className="mt-4 bg-ft-warn/10 border border-ft-warn/30 p-3">
            <div className="font-body text-[9px] uppercase tracking-[0.25em] text-ft-warn font-bold mb-1">
              ENGINE NOTES
            </div>
            {engineWarnings.map((w: string, i: number) => (
              <p key={i} className="text-ft-light text-xs font-body">• {w}</p>
            ))}
          </div>
        )}
      </PlanningSection>

      {/* Section 03 — Blocks workspace */}
      <PlanningSectionHeader num="03" title="blocks" sub="select a block · edit days and exercises" />
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4">
        {/* Left: Blocks Panel */}
        <div className="lg:block">
          {/* Mobile: horizontal scroll */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {program.blocks.map((block) => (
              <button
                key={block.id}
                onClick={() => setActiveBlockId(block.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded font-body text-sm text-left whitespace-nowrap transition-colors ${
                  block.id === activeBlockId
                    ? "bg-ft-surface border border-ft-white text-ft-white"
                    : "bg-ft-bg border border-ft-border text-ft-dim hover:text-ft-light hover:border-ft-dim"
                }`}
              >
                <StatusIcon type="block" status={block.status as "active" | "completed" | "upcoming"} />
                <span className="font-bold">{block.name}</span>
                {block.phase && PHASE_BADGES[block.phase] && (
                  <span className={`text-[9px] font-body px-1 py-0.5 rounded ${PHASE_BADGES[block.phase].color}`}>
                    {PHASE_BADGES[block.phase].label}
                  </span>
                )}
                {block.durationWeeks && (
                  <span className="text-[10px] text-ft-muted">{block.durationWeeks}wk</span>
                )}
              </button>
            ))}
            <button
              onClick={() => setShowBlockForm(!showBlockForm)}
              className="flex items-center gap-1 px-3 py-2 rounded font-body text-xs text-ft-muted hover:text-ft-light border border-dashed border-ft-border hover:border-ft-dim transition-colors whitespace-nowrap"
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
                className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-body text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
              />
              <input
                type="text"
                value={blockFocus}
                onChange={(e) => setBlockFocus(e.target.value)}
                placeholder="Focus (optional)"
                className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-body text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={blockDesc}
                  onChange={(e) => setBlockDesc(e.target.value)}
                  placeholder="Description"
                  className="bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-body text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                />
                <input
                  type="number"
                  value={blockWeeks}
                  onChange={(e) => setBlockWeeks(e.target.value)}
                  placeholder="Weeks"
                  min="1"
                  className="bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-body text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBlockForm(false)}
                  className="text-ft-dim text-xs font-body hover:text-ft-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBlock || !blockName.trim()}
                  className="bg-ft-white text-ft-bg font-body text-xs font-bold px-3 py-1 rounded hover:bg-ft-light disabled:opacity-50"
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
                    <h2 className="font-body text-lg font-bold">{activeBlock.name}</h2>
                    {activeBlock.focus && (
                      <span className="text-ft-dim text-xs font-body">&middot; {activeBlock.focus}</span>
                    )}
                  </div>
                  <p className="text-ft-muted text-xs font-body">
                    {activeBlock.durationWeeks ? `${activeBlock.durationWeeks} weeks · ` : ""}
                    {activeBlock.days.length} days · {activeBlock._count.workouts} sessions
                  </p>
                </div>
                <button
                  onClick={() => setShowDayForm(!showDayForm)}
                  className="text-ft-dim text-xs font-body hover:text-ft-light border border-ft-border rounded px-3 py-1 transition-colors"
                >
                  + Day
                </button>
              </div>

              {/* Add Day Form */}
              {showDayForm && (
                <Card className="mb-4">
                  <form onSubmit={handleAddDay} className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-ft-dim text-[10px] font-body uppercase tracking-wider mb-1">Name</label>
                      <input
                        type="text"
                        value={dayName}
                        onChange={(e) => setDayName(e.target.value)}
                        placeholder="e.g. Upper Push"
                        required
                        className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-body text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                      />
                    </div>
                    <div>
                      <label className="block text-ft-dim text-[10px] font-body uppercase tracking-wider mb-1">Type</label>
                      <select
                        value={dayType}
                        onChange={(e) => setDayType(e.target.value)}
                        className="bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-body text-ft-white focus:outline-none focus:border-ft-dim"
                      >
                        {DAY_TYPES.map((t) => (
                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDayForm(false)}
                      className="text-ft-dim text-xs font-body hover:text-ft-light px-2 py-1.5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingDay || !dayName.trim()}
                      className="bg-ft-white text-ft-bg font-body text-xs font-bold px-3 py-1.5 rounded hover:bg-ft-light disabled:opacity-50"
                    >
                      {savingDay ? "..." : "Add"}
                    </button>
                  </form>
                </Card>
              )}

              {/* Days list (accordion) */}
              {activeBlock.days.length === 0 && !showDayForm ? (
                <Card className="border-dashed">
                  <p className="text-ft-muted font-body text-sm text-center py-6">
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
                            <span className="font-body text-sm font-bold text-ft-white">
                              Day {day.dayNumber} &middot; {day.name}
                            </span>
                            <Tag>{day.dayType}</Tag>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-ft-dim text-xs font-body">
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
                            {isGenerated ? (
                              <CategoryLaneView
                                dayId={day.id}
                                exercises={day.exercises}
                                onUpdate={handleExerciseUpdate}
                                onDelete={handleExerciseDelete}
                                onReorder={(ids) => handleExerciseReorder(day.id, ids)}
                                onAddExercise={handleAddExerciseToDay}
                                onSwapExercise={handleSwapExercise}
                              />
                            ) : (
                              <EditableExerciseTable
                                dayId={day.id}
                                exercises={day.exercises}
                                onUpdate={handleExerciseUpdate}
                                onDelete={handleExerciseDelete}
                                onReorder={(ids) => handleExerciseReorder(day.id, ids)}
                                onAddExercise={handleAddExerciseToDay}
                                onSetAlternative={handleSetAlternative}
                              />
                            )}
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
              <p className="text-ft-muted font-body text-sm text-center py-8">
                Create a block to get started
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
