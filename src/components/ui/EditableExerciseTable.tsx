"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface ExerciseRow {
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

interface SearchResult {
  id: string;
  name: string;
  primaryMuscle: string | null;
}

interface EditableExerciseTableProps {
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
  onSetAlternative?: (exerciseId: string, altExerciseId: string | null) => void;
}

const PROGRESSION_TYPES = ["none", "linear", "double", "wave", "rpe_based", "percentage_based"];

const PROGRESSION_LABELS: Record<string, string> = {
  none: "None",
  linear: "Linear",
  double: "Double",
  wave: "Wave",
  rpe_based: "RPE",
  percentage_based: "%1RM",
};

const PROGRESSION_DESCRIPTIONS: Record<string, string> = {
  none: "No auto-progression",
  linear: "Add fixed weight each session",
  double: "Increase reps first, then weight",
  wave: "4-week wave: accumulate \u2192 intensify \u2192 peak \u2192 deload",
  rpe_based: "Adjust weight based on RPE target",
  percentage_based: "Work at % of estimated 1RM",
};

export default function EditableExerciseTable({
  dayId,
  exercises,
  onUpdate,
  onDelete,
  onReorder,
  onAddExercise,
  onSetAlternative,
}: EditableExerciseTableProps) {
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [altPickerOpen, setAltPickerOpen] = useState<string | null>(null);
  const [altSearch, setAltSearch] = useState("");
  const [altResults, setAltResults] = useState<SearchResult[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const altInputRef = useRef<HTMLInputElement>(null);

  // New exercise row state
  const [addingNew, setAddingNew] = useState(false);
  const [newSearch, setNewSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedNew, setSelectedNew] = useState<SearchResult | null>(null);
  const [newSets, setNewSets] = useState("3");
  const [newReps, setNewReps] = useState("8-12");
  const [newRpe, setNewRpe] = useState("");
  const [newProg, setNewProg] = useState("none");
  const [newIncrement, setNewIncrement] = useState("5");

  // Search for alternative exercise
  useEffect(() => {
    if (!altSearch.trim() || altSearch.length < 2) {
      setAltResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/exercises?search=${encodeURIComponent(altSearch)}`)
        .then((r) => r.json())
        .then((d) => setAltResults(d.exercises?.slice(0, 10) ?? []))
        .catch(() => setAltResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [altSearch]);

  useEffect(() => {
    if (altPickerOpen && altInputRef.current) altInputRef.current.focus();
  }, [altPickerOpen]);

  // Search for new exercise
  useEffect(() => {
    if (!newSearch.trim() || newSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/exercises?search=${encodeURIComponent(newSearch)}`)
        .then((r) => r.json())
        .then((d) => setSearchResults(d.exercises ?? []))
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [newSearch]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const startEdit = (id: string, field: string, currentValue: string | number | null) => {
    setEditingCell({ id, field });
    setEditValue(currentValue?.toString() ?? "");
  };

  const commitEdit = useCallback(() => {
    if (!editingCell) return;
    const { id, field } = editingCell;
    let val: string | number | null = editValue.trim() || null;
    if (field === "targetSets" && val) val = parseInt(val as string) || null;
    if (field === "progressionIncrement" && val) val = parseFloat(val as string) || null;
    onUpdate(id, field, val);
    setEditingCell(null);
  }, [editingCell, editValue, onUpdate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      setEditingCell(null);
    } else if (e.key === "Tab") {
      e.preventDefault();
      commitEdit();
      // Move to next cell
      if (editingCell) {
        const fields = ["targetSets", "targetRepRange", "targetRpe", "progressionIncrement"];
        const curFieldIdx = fields.indexOf(editingCell.field);
        const curRowIdx = exercises.findIndex((ex) => ex.id === editingCell.id);
        let nextFieldIdx = curFieldIdx + (e.shiftKey ? -1 : 1);
        let nextRowIdx = curRowIdx;
        if (nextFieldIdx >= fields.length) {
          nextFieldIdx = 0;
          nextRowIdx++;
        } else if (nextFieldIdx < 0) {
          nextFieldIdx = fields.length - 1;
          nextRowIdx--;
        }
        if (nextRowIdx >= 0 && nextRowIdx < exercises.length) {
          const nextEx = exercises[nextRowIdx];
          const nextField = fields[nextFieldIdx];
          const val = nextEx[nextField as keyof ExerciseRow];
          startEdit(nextEx.id, nextField, val as string | number | null);
        }
      }
    }
  };

  // Drag and drop
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const newOrder = [...exercises];
    const [moved] = newOrder.splice(dragIdx, 1);
    newOrder.splice(idx, 0, moved);
    onReorder(newOrder.map((e) => e.id));
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const handleAddNew = () => {
    if (!selectedNew) return;
    onAddExercise(dayId, selectedNew.id, {
      targetSets: newSets ? parseInt(newSets) : null,
      targetRepRange: newReps.trim() || null,
      targetRpe: newRpe.trim() || null,
      progressionType: newProg,
      progressionIncrement: newProg !== "none" && newIncrement ? parseFloat(newIncrement) : null,
    });
    setAddingNew(false);
    setSelectedNew(null);
    setNewSearch("");
    setNewSets("3");
    setNewReps("8-12");
    setNewRpe("");
    setNewProg("none");
    setNewIncrement("5");
  };

  const renderCell = (ex: ExerciseRow, field: string, value: string | number | null, width: string) => {
    const isEditing = editingCell?.id === ex.id && editingCell?.field === field;
    const isNumeric = field === "targetSets" || field === "progressionIncrement";
    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type={isNumeric ? "number" : "text"}
          step={field === "progressionIncrement" ? "0.5" : undefined}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className={`${width} bg-ft-bg border border-ft-dim rounded px-1.5 py-0.5 text-xs font-body text-ft-white focus:outline-none`}
        />
      );
    }
    return (
      <button
        onClick={() => startEdit(ex.id, field, value)}
        className={`${width} text-left text-xs font-body text-ft-light hover:text-ft-white hover:bg-ft-card/50 px-1.5 py-0.5 rounded transition-colors`}
      >
        {value ?? "—"}
      </button>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-[20px_24px_1fr_52px_64px_44px_72px_44px_24px] gap-1 text-[10px] font-body uppercase tracking-wider text-ft-muted mb-1 px-1">
        <span></span>
        <span>#</span>
        <span>Exercise</span>
        <span>Sets</span>
        <span>Reps</span>
        <span>RPE</span>
        <span>Prog</span>
        <span>Inc</span>
        <span></span>
      </div>

      {/* Rows */}
      {exercises.map((ex, idx) => (
        <div
          key={ex.id}
          draggable
          onDragStart={() => handleDragStart(idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={() => handleDrop(idx)}
          onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
          className={`grid grid-cols-[20px_24px_1fr_52px_64px_44px_72px_44px_24px] gap-1 items-center py-1 px-1 rounded transition-colors ${
            dragOverIdx === idx ? "bg-ft-card/50" : "hover:bg-ft-surface/50"
          }`}
        >
          {/* Drag handle */}
          <span className="text-ft-muted text-[10px] cursor-grab select-none">⋮⋮</span>
          <span className="text-ft-muted text-xs font-body">{idx + 1}</span>
          <div className="truncate">
            <span className="text-ft-light text-xs font-body font-bold" title={ex.exercise.name}>
              {ex.exercise.name}
            </span>
            {ex.altExercise && (
              <span className="text-ft-muted text-[10px] font-body ml-1" title={`Alt: ${ex.altExercise.name}`}>
                / {ex.altExercise.name}
              </span>
            )}
          </div>
          {renderCell(ex, "targetSets", ex.targetSets, "w-full")}
          {renderCell(ex, "targetRepRange", ex.targetRepRange, "w-full")}
          {renderCell(ex, "targetRpe", ex.targetRpe, "w-full")}
          {/* Progression (select) */}
          <select
            value={ex.progressionType}
            onChange={(e) => onUpdate(ex.id, "progressionType", e.target.value)}
            className="w-full bg-transparent text-[10px] font-body text-ft-dim focus:outline-none cursor-pointer"
            title={PROGRESSION_DESCRIPTIONS[ex.progressionType] ?? ex.progressionType}
          >
            {PROGRESSION_TYPES.map((t) => (
              <option key={t} value={t}>{PROGRESSION_LABELS[t] ?? t}</option>
            ))}
          </select>
          {/* Progression Increment */}
          {ex.progressionType !== "none" ? (
            renderCell(ex, "progressionIncrement", ex.progressionIncrement, "w-full")
          ) : (
            <span className="text-ft-muted text-[10px] font-body px-1.5">—</span>
          )}
          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => { setMenuOpen(menuOpen === ex.id ? null : ex.id); setConfirmDeleteId(null); }}
              className="text-ft-muted text-xs hover:text-ft-light w-full text-center"
            >
              ⋮
            </button>
            {menuOpen === ex.id && (
              <div className="absolute right-0 top-full mt-1 bg-ft-surface border border-ft-card rounded shadow-lg z-30 min-w-[120px]">
                <button
                  onClick={() => {
                    if (idx > 0) {
                      const newOrder = [...exercises];
                      [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
                      onReorder(newOrder.map((e) => e.id));
                    }
                    setMenuOpen(null);
                  }}
                  disabled={idx === 0}
                  className="w-full text-left px-3 py-1.5 text-xs font-body text-ft-light hover:bg-ft-card disabled:opacity-30"
                >
                  Move Up
                </button>
                <button
                  onClick={() => {
                    if (idx < exercises.length - 1) {
                      const newOrder = [...exercises];
                      [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
                      onReorder(newOrder.map((e) => e.id));
                    }
                    setMenuOpen(null);
                  }}
                  disabled={idx === exercises.length - 1}
                  className="w-full text-left px-3 py-1.5 text-xs font-body text-ft-light hover:bg-ft-card disabled:opacity-30"
                >
                  Move Down
                </button>
                {onSetAlternative && (
                  <button
                    onClick={() => {
                      setMenuOpen(null);
                      setAltPickerOpen(ex.id);
                      setAltSearch("");
                      setAltResults([]);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-body text-ft-light hover:bg-ft-card"
                  >
                    {ex.altExercise ? "Change Alt" : "Set Alternative"}
                  </button>
                )}
                {onSetAlternative && ex.altExercise && (
                  <button
                    onClick={() => {
                      onSetAlternative(ex.id, null);
                      setMenuOpen(null);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-body text-ft-warn hover:bg-ft-card"
                  >
                    Remove Alt
                  </button>
                )}
                <div className="border-t border-ft-border/50" />
                {confirmDeleteId === ex.id ? (
                  <button
                    onClick={() => {
                      onDelete(ex.id);
                      setMenuOpen(null);
                      setConfirmDeleteId(null);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-body text-ft-danger font-bold bg-ft-danger/10 hover:bg-ft-danger/20"
                  >
                    Confirm Delete?
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(ex.id)}
                    className="w-full text-left px-3 py-1.5 text-xs font-body text-ft-danger hover:bg-ft-card"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Alt exercise picker */}
      {altPickerOpen && (
        <div className="my-2 p-3 bg-ft-surface border border-ft-card rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-ft-dim text-[10px] font-body uppercase tracking-wider">
              Set Alternative Exercise
            </span>
            <button
              onClick={() => { setAltPickerOpen(null); setAltSearch(""); }}
              className="text-ft-dim text-xs hover:text-ft-light"
            >
              &times;
            </button>
          </div>
          <div className="relative">
            <input
              ref={altInputRef}
              type="text"
              value={altSearch}
              onChange={(e) => setAltSearch(e.target.value)}
              placeholder="Search for alternative..."
              className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-body text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
            />
            {altResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-ft-surface border border-ft-card rounded max-h-36 overflow-y-auto z-20">
                {altResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      if (onSetAlternative) onSetAlternative(altPickerOpen, r.id);
                      setAltPickerOpen(null);
                      setAltSearch("");
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs font-body text-ft-light hover:bg-ft-card"
                  >
                    {r.name}
                    {r.primaryMuscle && <span className="text-ft-muted ml-2">{r.primaryMuscle}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add row */}
      {addingNew ? (
        <div className="mt-2 pt-2 border-t border-ft-border/50 space-y-2">
          {selectedNew ? (
            <div className="flex items-center gap-2">
              <span className="text-ft-white text-xs font-body flex-1">{selectedNew.name}</span>
              <button
                onClick={() => { setSelectedNew(null); setNewSearch(""); }}
                className="text-ft-dim text-[10px] hover:text-ft-light"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={newSearch}
                onChange={(e) => setNewSearch(e.target.value)}
                placeholder="Type to search exercises..."
                className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-body text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                autoFocus
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-ft-surface border border-ft-card rounded max-h-36 overflow-y-auto z-20">
                  {searchResults.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setSelectedNew(r); setSearchResults([]); }}
                      className="w-full text-left px-2 py-1.5 text-xs font-body text-ft-light hover:bg-ft-card"
                    >
                      {r.name}
                      {r.primaryMuscle && <span className="text-ft-muted ml-2">{r.primaryMuscle}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {selectedNew && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={newSets}
                  onChange={(e) => setNewSets(e.target.value)}
                  placeholder="Sets"
                  className="bg-ft-bg border border-ft-card rounded px-2 py-1 text-xs font-body text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                />
                <input
                  type="text"
                  value={newReps}
                  onChange={(e) => setNewReps(e.target.value)}
                  placeholder="Reps"
                  className="bg-ft-bg border border-ft-card rounded px-2 py-1 text-xs font-body text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                />
                <input
                  type="text"
                  value={newRpe}
                  onChange={(e) => setNewRpe(e.target.value)}
                  placeholder="RPE"
                  className="bg-ft-bg border border-ft-card rounded px-2 py-1 text-xs font-body text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <select
                    value={newProg}
                    onChange={(e) => setNewProg(e.target.value)}
                    className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1 text-xs font-body text-ft-white focus:outline-none focus:border-ft-dim"
                  >
                    {PROGRESSION_TYPES.map((t) => (
                      <option key={t} value={t}>{PROGRESSION_LABELS[t] ?? t}</option>
                    ))}
                  </select>
                  {newProg !== "none" && (
                    <p className="text-ft-muted text-[10px] font-body mt-0.5">
                      {PROGRESSION_DESCRIPTIONS[newProg]}
                    </p>
                  )}
                </div>
                {newProg !== "none" && (
                  <input
                    type="number"
                    step="0.5"
                    value={newIncrement}
                    onChange={(e) => setNewIncrement(e.target.value)}
                    placeholder={newProg === "percentage_based" ? "% (e.g. 75)" : "Increment (lbs)"}
                    className="bg-ft-bg border border-ft-card rounded px-2 py-1 text-xs font-body text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                  />
                )}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => { setAddingNew(false); setSelectedNew(null); setNewSearch(""); }} className="text-ft-dim text-xs font-body hover:text-ft-light">
              Cancel
            </button>
            {selectedNew && (
              <button onClick={handleAddNew} className="bg-ft-white text-ft-bg font-body text-xs font-bold px-3 py-1 rounded hover:bg-ft-light">
                Add
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingNew(true)}
          className="mt-1 text-ft-dim text-xs font-body hover:text-ft-light transition-colors py-1"
        >
          + Add Exercise
        </button>
      )}
    </div>
  );
}
