"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExerciseRow {
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

interface ParsedMeta {
  category: string;
  role: string;
  alternatives: { id: string; name: string }[];
  text: string;
}

interface CategoryLane {
  category: string;
  role: string;
  label: string;
  exercises: ExerciseRow[];
  alternatives: { id: string; name: string }[];
}

interface SearchResult {
  id: string;
  name: string;
  primaryMuscle: string | null;
}

interface CategoryLaneViewProps {
  dayId: string;
  exercises: ExerciseRow[];
  onUpdate: (exerciseId: string, field: string, value: string | number | null) => void;
  onDelete: (exerciseId: string) => void;
  onReorder: (exerciseIds: string[]) => void;
  onAddExercise: (dayId: string, exerciseId: string, data: {
    targetSets: number | null;
    targetRepRange: string | null;
    targetRpe: string | null;
    progressionType: string;
    progressionIncrement: number | null;
  }) => void;
  onSwapExercise?: (blockDayExerciseId: string, newExerciseId: string) => void;
}

// ---------------------------------------------------------------------------
// Note Parsing
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<string, string> = {
  horizontal_push: "Horizontal Push",
  vertical_push: "Vertical Push",
  horizontal_pull: "Horizontal Pull",
  vertical_pull: "Vertical Pull",
  hip_hinge: "Hip Hinge",
  squat: "Squat",
  lunge: "Lunge",
  carry: "Carry",
  chest_isolation: "Chest Isolation",
  back_isolation: "Back Isolation",
  shoulder_isolation: "Shoulder Isolation",
  bicep: "Biceps",
  tricep: "Triceps",
  quad_isolation: "Quad Isolation",
  hamstring_isolation: "Hamstring Isolation",
  glute_isolation: "Glute Isolation",
  calf: "Calves",
  core: "Core",
  rotator_cuff: "Rotator Cuff",
  cardio: "Cardio",
  stretch: "Stretch",
};

const ROLE_COLORS: Record<string, string> = {
  primary_compound: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  secondary_compound: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  isolation: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  accessory: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  warmup: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  cardio: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  stretch: "bg-teal-500/20 text-teal-400 border-teal-500/30",
};

const PROGRESSION_LABELS: Record<string, string> = {
  linear: "Linear",
  double: "Double",
  wave: "Wave",
  rpe_based: "RPE",
  percentage_based: "%",
  none: "—",
};

const PROGRESSION_TYPES = ["none", "linear", "double", "wave", "rpe_based", "percentage_based"];

function parseNotes(notes: string | null): ParsedMeta {
  if (!notes) return { category: "", role: "", alternatives: [], text: "" };

  // New format: [category|role|altsJSON] optional text
  const pipeMatch = notes.match(/^\[([^|]+)\|([^|]+)\|(.+?)\]\s*(.*)?$/);
  if (pipeMatch) {
    let alts: { id: string; name: string }[] = [];
    try { alts = JSON.parse(pipeMatch[3]); } catch { /* ignore */ }
    return {
      category: pipeMatch[1],
      role: pipeMatch[2],
      alternatives: alts,
      text: pipeMatch[4] || "",
    };
  }

  // Legacy format: [category] optional text
  const legacyMatch = notes.match(/^\[([^\]]+)\]\s*(.*)?$/);
  if (legacyMatch) {
    return {
      category: legacyMatch[1],
      role: "",
      alternatives: [],
      text: legacyMatch[2] || "",
    };
  }

  return { category: "", role: "", alternatives: [], text: notes };
}

function isGenerated(exercises: ExerciseRow[]): boolean {
  // Check if any exercise has category metadata in notes
  return exercises.some((ex) => {
    const meta = parseNotes(ex.notes);
    return !!meta.category;
  });
}

function groupIntoLanes(exercises: ExerciseRow[]): CategoryLane[] {
  const lanes: CategoryLane[] = [];
  const laneMap = new Map<string, CategoryLane>();

  for (const ex of exercises) {
    const meta = parseNotes(ex.notes);
    const key = meta.category || `ungrouped_${ex.id}`;

    if (!laneMap.has(key)) {
      const lane: CategoryLane = {
        category: meta.category,
        role: meta.role,
        label: CATEGORY_LABELS[meta.category] || meta.category || "Other",
        exercises: [],
        alternatives: meta.alternatives,
      };
      laneMap.set(key, lane);
      lanes.push(lane);
    }

    const lane = laneMap.get(key)!;
    lane.exercises.push(ex);
    // Merge alternatives from all exercises in the lane
    if (meta.alternatives.length > lane.alternatives.length) {
      lane.alternatives = meta.alternatives;
    }
  }

  return lanes;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CategoryLaneView({
  dayId,
  exercises,
  onUpdate,
  onDelete,
  onReorder,
  onAddExercise,
  onSwapExercise,
}: CategoryLaneViewProps) {
  const generated = isGenerated(exercises);

  // If not a generated program, fall back to flat list behavior
  if (!generated) {
    return (
      <FlatExerciseList
        dayId={dayId}
        exercises={exercises}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onReorder={onReorder}
        onAddExercise={onAddExercise}
      />
    );
  }

  const lanes = groupIntoLanes(exercises);

  return (
    <div className="space-y-3">
      {lanes.map((lane, laneIdx) => (
        <LaneCard
          key={`${lane.category}-${laneIdx}`}
          lane={lane}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onSwapExercise={onSwapExercise}
        />
      ))}

      {/* Add exercise button */}
      <AddExerciseRow dayId={dayId} onAddExercise={onAddExercise} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lane Card
// ---------------------------------------------------------------------------

function LaneCard({
  lane,
  onUpdate,
  onDelete,
  onSwapExercise,
}: {
  lane: CategoryLane;
  onUpdate: (exerciseId: string, field: string, value: string | number | null) => void;
  onDelete: (exerciseId: string) => void;
  onSwapExercise?: (blockDayExerciseId: string, newExerciseId: string) => void;
}) {
  const [showAlts, setShowAlts] = useState(false);
  const roleColor = ROLE_COLORS[lane.role] || ROLE_COLORS.accessory;
  const roleLabel = lane.role?.replace(/_/g, " ") || "";

  return (
    <div className="border border-ft-border/50 rounded-lg overflow-hidden">
      {/* Lane Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-ft-surface/30">
        <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${roleColor}`}>
          {lane.label}
        </span>
        {roleLabel && (
          <span className="text-ft-muted text-[10px] font-mono">{roleLabel}</span>
        )}
        {lane.alternatives.length > 0 && (
          <button
            onClick={() => setShowAlts(!showAlts)}
            className="ml-auto text-ft-dim text-[10px] font-mono hover:text-ft-light transition-colors"
          >
            {showAlts ? "Hide alts" : `${lane.alternatives.length} alt${lane.alternatives.length > 1 ? "s" : ""}`}
          </button>
        )}
      </div>

      {/* Exercise Rows */}
      <div className="px-3 py-1.5">
        {lane.exercises.map((ex) => (
          <LaneExerciseRow
            key={ex.id}
            ex={ex}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Alternatives (collapsible) */}
      {showAlts && lane.alternatives.length > 0 && (
        <div className="border-t border-ft-border/30 px-3 py-2 bg-ft-bg/50">
          <div className="text-ft-muted text-[10px] font-mono uppercase mb-1.5">Swap with:</div>
          <div className="flex flex-wrap gap-1.5">
            {lane.alternatives.map((alt) => (
              <button
                key={alt.id}
                onClick={() => {
                  if (onSwapExercise && lane.exercises[0]) {
                    onSwapExercise(lane.exercises[0].id, alt.id);
                  }
                }}
                className="text-xs font-mono px-2 py-1 rounded bg-ft-surface border border-ft-border text-ft-light hover:border-ft-accent/50 hover:text-ft-white transition-colors"
              >
                {alt.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lane Exercise Row (inline editable)
// ---------------------------------------------------------------------------

function LaneExerciseRow({
  ex,
  onUpdate,
  onDelete,
}: {
  ex: ExerciseRow;
  onUpdate: (exerciseId: string, field: string, value: string | number | null) => void;
  onDelete: (exerciseId: string) => void;
}) {
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editField]);

  const startEdit = (field: string, value: string | number | null) => {
    setEditField(field);
    setEditValue(value?.toString() ?? "");
  };

  const commitEdit = useCallback(() => {
    if (!editField) return;
    let val: string | number | null = editValue.trim() || null;
    if (editField === "targetSets" && val) val = parseInt(val as string) || null;
    onUpdate(ex.id, editField, val);
    setEditField(null);
  }, [editField, editValue, onUpdate, ex.id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitEdit();
    else if (e.key === "Escape") setEditField(null);
  };

  const renderCell = (field: string, value: string | number | null, width: string) => {
    if (editField === field) {
      return (
        <input
          ref={inputRef}
          type={field === "targetSets" ? "number" : "text"}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className={`${width} bg-ft-bg border border-ft-dim rounded px-1.5 py-0.5 text-xs font-mono text-ft-white focus:outline-none`}
        />
      );
    }
    return (
      <button
        onClick={() => startEdit(field, value)}
        className={`${width} text-left text-xs font-mono text-ft-light hover:text-ft-white hover:bg-ft-card/50 px-1.5 py-0.5 rounded transition-colors`}
      >
        {value ?? "—"}
      </button>
    );
  };

  const meta = parseNotes(ex.notes);

  return (
    <div className="flex items-center gap-1.5 py-1 group">
      {/* Exercise name */}
      <div className="flex-1 min-w-0">
        <span className="text-ft-white text-xs font-mono font-bold truncate block" title={ex.exercise.name}>
          {ex.exercise.name}
        </span>
        {ex.altExercise && (
          <span className="text-ft-muted text-[10px] font-mono">
            alt: {ex.altExercise.name}
          </span>
        )}
      </div>

      {/* Sets */}
      {renderCell("targetSets", ex.targetSets, "w-10")}

      {/* Reps */}
      {renderCell("targetRepRange", ex.targetRepRange, "w-14")}

      {/* RPE */}
      {renderCell("targetRpe", ex.targetRpe, "w-10")}

      {/* Progression */}
      <select
        value={ex.progressionType}
        onChange={(e) => onUpdate(ex.id, "progressionType", e.target.value)}
        className="w-12 bg-transparent text-[10px] font-mono text-ft-dim focus:outline-none cursor-pointer"
        title={`Progression: ${PROGRESSION_LABELS[ex.progressionType] || ex.progressionType}`}
      >
        {PROGRESSION_TYPES.map((t) => (
          <option key={t} value={t}>{PROGRESSION_LABELS[t] || t}</option>
        ))}
      </select>

      {/* Menu */}
      <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-ft-muted text-xs hover:text-ft-light px-1"
        >
          ⋮
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 bg-ft-surface border border-ft-card rounded shadow-lg z-30 min-w-[100px]">
            <button
              onClick={() => { onDelete(ex.id); setMenuOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-xs font-mono text-ft-danger hover:bg-ft-card"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Notes tooltip */}
      {meta.text && (
        <span className="text-ft-muted text-[10px]" title={meta.text}>*</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Exercise Row
// ---------------------------------------------------------------------------

function AddExerciseRow({
  dayId,
  onAddExercise,
}: {
  dayId: string;
  onAddExercise: (dayId: string, exerciseId: string, data: {
    targetSets: number | null;
    targetRepRange: string | null;
    targetRpe: string | null;
    progressionType: string;
    progressionIncrement: number | null;
  }) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("8-12");
  const [rpe, setRpe] = useState("");
  const [prog, setProg] = useState("none");

  useEffect(() => {
    if (!search.trim() || search.length < 2) { setResults([]); return; }
    const timer = setTimeout(() => {
      fetch(`/api/exercises?search=${encodeURIComponent(search)}`)
        .then((r) => r.json())
        .then((d) => setResults(d.exercises ?? []))
        .catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAdd = () => {
    if (!selected) return;
    onAddExercise(dayId, selected.id, {
      targetSets: sets ? parseInt(sets) : null,
      targetRepRange: reps.trim() || null,
      targetRpe: rpe.trim() || null,
      progressionType: prog,
      progressionIncrement: null,
    });
    setAdding(false);
    setSelected(null);
    setSearch("");
    setSets("3");
    setReps("8-12");
    setRpe("");
    setProg("none");
  };

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="w-full text-ft-dim text-xs font-mono hover:text-ft-light transition-colors py-2 text-center border border-dashed border-ft-border/50 rounded-lg hover:border-ft-dim"
      >
        + Add Exercise
      </button>
    );
  }

  return (
    <div className="border border-ft-border/50 rounded-lg p-3 space-y-2">
      {selected ? (
        <div className="flex items-center gap-2">
          <span className="text-ft-white text-xs font-mono flex-1">{selected.name}</span>
          <button
            onClick={() => { setSelected(null); setSearch(""); }}
            className="text-ft-dim text-[10px] hover:text-ft-light"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
            autoFocus
          />
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-ft-surface border border-ft-card rounded max-h-36 overflow-y-auto z-20">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setSelected(r); setResults([]); }}
                  className="w-full text-left px-2 py-1.5 text-xs font-mono text-ft-light hover:bg-ft-card"
                >
                  {r.name}
                  {r.primaryMuscle && <span className="text-ft-muted ml-2">{r.primaryMuscle}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {selected && (
        <>
          <div className="grid grid-cols-4 gap-2">
            <input type="number" value={sets} onChange={(e) => setSets(e.target.value)} placeholder="Sets"
              className="bg-ft-bg border border-ft-card rounded px-2 py-1 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim" />
            <input type="text" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="Reps"
              className="bg-ft-bg border border-ft-card rounded px-2 py-1 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim" />
            <input type="text" value={rpe} onChange={(e) => setRpe(e.target.value)} placeholder="RPE"
              className="bg-ft-bg border border-ft-card rounded px-2 py-1 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim" />
            <select value={prog} onChange={(e) => setProg(e.target.value)}
              className="bg-ft-bg border border-ft-card rounded px-2 py-1 text-xs font-mono text-ft-white focus:outline-none focus:border-ft-dim">
              {PROGRESSION_TYPES.map((t) => (
                <option key={t} value={t}>{PROGRESSION_LABELS[t] || t}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setAdding(false); setSelected(null); setSearch(""); }}
              className="text-ft-dim text-xs font-mono hover:text-ft-light">Cancel</button>
            <button onClick={handleAdd}
              className="bg-ft-white text-ft-bg font-mono text-xs font-bold px-3 py-1 rounded hover:bg-ft-light">Add</button>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Flat Exercise List (fallback for non-generated programs)
// ---------------------------------------------------------------------------

function FlatExerciseList({
  dayId,
  exercises,
  onUpdate,
  onDelete,
  onReorder,
  onAddExercise,
}: {
  dayId: string;
  exercises: ExerciseRow[];
  onUpdate: (exerciseId: string, field: string, value: string | number | null) => void;
  onDelete: (exerciseId: string) => void;
  onReorder: (exerciseIds: string[]) => void;
  onAddExercise: (dayId: string, exerciseId: string, data: {
    targetSets: number | null;
    targetRepRange: string | null;
    targetRpe: string | null;
    progressionType: string;
    progressionIncrement: number | null;
  }) => void;
}) {
  // Re-use the existing EditableExerciseTable inline
  // Import is avoided here to keep this self-contained
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return; }
    const newOrder = [...exercises];
    const [moved] = newOrder.splice(dragIdx, 1);
    newOrder.splice(idx, 0, moved);
    onReorder(newOrder.map((e) => e.id));
    setDragIdx(null);
    setDragOverIdx(null);
  };

  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-ft-muted mb-1 px-1 grid grid-cols-[24px_1fr_44px_56px_40px_48px_20px] gap-1">
        <span>#</span><span>Exercise</span><span>Sets</span><span>Reps</span><span>RPE</span><span>Prog</span><span></span>
      </div>
      {exercises.map((ex, idx) => (
        <div
          key={ex.id}
          draggable
          onDragStart={() => setDragIdx(idx)}
          onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
          onDrop={() => handleDrop(idx)}
          onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
          className={`grid grid-cols-[24px_1fr_44px_56px_40px_48px_20px] gap-1 items-center py-1 px-1 rounded ${dragOverIdx === idx ? "bg-ft-card/50" : "hover:bg-ft-surface/50"}`}
        >
          <span className="text-ft-muted text-xs font-mono">{idx + 1}</span>
          <span className="text-ft-light text-xs font-mono font-bold truncate">{ex.exercise.name}</span>
          <InlineCell value={ex.targetSets} field="targetSets" id={ex.id} onUpdate={onUpdate} type="number" />
          <InlineCell value={ex.targetRepRange} field="targetRepRange" id={ex.id} onUpdate={onUpdate} />
          <InlineCell value={ex.targetRpe} field="targetRpe" id={ex.id} onUpdate={onUpdate} />
          <select value={ex.progressionType} onChange={(e) => onUpdate(ex.id, "progressionType", e.target.value)}
            className="w-full bg-transparent text-[10px] font-mono text-ft-dim focus:outline-none cursor-pointer">
            {PROGRESSION_TYPES.map((t) => (<option key={t} value={t}>{PROGRESSION_LABELS[t] || t}</option>))}
          </select>
          <button onClick={() => onDelete(ex.id)} className="text-ft-muted text-xs hover:text-ft-danger">×</button>
        </div>
      ))}
      <AddExerciseRow dayId={dayId} onAddExercise={onAddExercise} />
    </div>
  );
}

function InlineCell({ value, field, id, onUpdate, type }: {
  value: string | number | null; field: string; id: string;
  onUpdate: (id: string, field: string, value: string | number | null) => void;
  type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value?.toString() ?? "");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing && ref.current) { ref.current.focus(); ref.current.select(); } }, [editing]);

  const commit = () => {
    let v: string | number | null = val.trim() || null;
    if (type === "number" && v) v = parseInt(v as string) || null;
    onUpdate(id, field, v);
    setEditing(false);
  };

  if (editing) {
    return (
      <input ref={ref} type={type || "text"} value={val} onChange={(e) => setVal(e.target.value)}
        onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        className="w-full bg-ft-bg border border-ft-dim rounded px-1 py-0.5 text-xs font-mono text-ft-white focus:outline-none" />
    );
  }
  return (
    <button onClick={() => { setEditing(true); setVal(value?.toString() ?? ""); }}
      className="w-full text-left text-xs font-mono text-ft-light hover:text-ft-white hover:bg-ft-card/50 px-1 py-0.5 rounded transition-colors">
      {value ?? "—"}
    </button>
  );
}
