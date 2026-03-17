"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Exercise {
  id: string;
  name: string;
  movementPattern: string | null;
  primaryMuscle: string | null;
  equipment: string | null;
}

interface ExerciseBrowserPanelProps {
  open: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  title?: string;
}

// ─── Filter data (matches actual DB values from seed) ────
const MUSCLES = [
  "Chest", "Lats", "Shoulders", "Biceps", "Triceps", "Quadriceps",
  "Hamstrings", "Glutes", "Calves", "Core", "Forearms", "Traps",
  "Rhomboids", "Rear Delts", "Lower Back", "Obliques",
  "Hip Flexors", "Adductors", "Abductors", "Full Body",
];

const EQUIPMENT = [
  "Barbell", "Dumbbell", "Cable", "Machine", "Bodyweight",
  "Kettlebell", "Resistance Band", "Smith Machine", "EZ Bar",
  "Hex Bar", "TRX", "Plate",
];

// Grouped movement labels → actual DB movementPattern values
const MOVEMENT_MAP: Record<string, string[]> = {
  "Push": ["Horizontal Push", "Vertical Push"],
  "Pull": ["Horizontal Pull", "Vertical Pull"],
  "Squat": ["Squat"],
  "Hinge": ["Hip Hinge", "Hip Extension"],
  "Lunge": ["Lunge", "Step"],
  "Carry": ["Carry"],
  "Core": ["Core Stability", "Core Extension"],
  "Power": ["Power"],
  "Isolation": ["Elbow Extension", "Knee Extension", "Knee Flexion", "Shoulder Isolation"],
  "Cardio": ["Cardio"],
};
const MOVEMENT_LABELS = Object.keys(MOVEMENT_MAP);

type FilterCategory = "muscle" | "equipment" | "movement";

export default function ExerciseBrowserPanel({
  open,
  onClose,
  onSelect,
  title = "Add Exercise",
}: ExerciseBrowserPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState<Set<string>>(new Set());
  const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(new Set());
  const [selectedMovements, setSelectedMovements] = useState<Set<string>>(new Set());
  const [expandedCategory, setExpandedCategory] = useState<FilterCategory | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleFilter = (category: FilterCategory, value: string) => {
    const setter = category === "muscle" ? setSelectedMuscles
      : category === "equipment" ? setSelectedEquipment
      : setSelectedMovements;
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const clearAllFilters = () => {
    setSelectedMuscles(new Set());
    setSelectedEquipment(new Set());
    setSelectedMovements(new Set());
  };

  // Resolve movement labels to actual DB values
  const resolveMovements = useCallback((labels: Set<string>): string[] => {
    const patterns: string[] = [];
    labels.forEach((label) => {
      const mapped = MOVEMENT_MAP[label];
      if (mapped) patterns.push(...mapped);
    });
    return patterns;
  }, []);

  const fetchExercises = useCallback(
    (s: string, muscles: Set<string>, equip: Set<string>, moves: Set<string>) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      const params = new URLSearchParams();
      if (s) params.set("search", s);
      if (muscles.size > 0) params.set("muscle", Array.from(muscles).join(","));
      if (equip.size > 0) params.set("equipment", Array.from(equip).join(","));
      const resolvedMoves = resolveMovements(moves);
      if (resolvedMoves.length > 0) params.set("movement", resolvedMoves.join(","));

      fetch(`/api/exercises?${params.toString()}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          setExercises(data.exercises ?? []);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== "AbortError") setLoading(false);
        });
    },
    [resolveMovements]
  );

  // Debounced search
  useEffect(() => {
    if (!open) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fetchExercises(search, selectedMuscles, selectedEquipment, selectedMovements);
    }, 200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [search, selectedMuscles, selectedEquipment, selectedMovements, open, fetchExercises]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearch("");
      clearAllFilters();
      setExpandedCategory(null);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const totalFilters = selectedMuscles.size + selectedEquipment.size + selectedMovements.size;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ft-bg/60 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-ft-surface border-l border-ft-border z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-ft-border flex items-center justify-between shrink-0">
          <h2 className="font-mono text-sm font-bold text-ft-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-ft-dim text-lg hover:text-ft-light transition-colors"
          >
            ×
          </button>
        </div>

        {/* Search + Filters */}
        <div className="p-3 border-b border-ft-border shrink-0 space-y-2">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
          />

          {/* Filter category headers */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <FilterCategoryPill
              label="Muscle"
              count={selectedMuscles.size}
              expanded={expandedCategory === "muscle"}
              onClick={() => setExpandedCategory(expandedCategory === "muscle" ? null : "muscle")}
            />
            <FilterCategoryPill
              label="Equipment"
              count={selectedEquipment.size}
              expanded={expandedCategory === "equipment"}
              onClick={() => setExpandedCategory(expandedCategory === "equipment" ? null : "equipment")}
            />
            <FilterCategoryPill
              label="Movement"
              count={selectedMovements.size}
              expanded={expandedCategory === "movement"}
              onClick={() => setExpandedCategory(expandedCategory === "movement" ? null : "movement")}
            />
            {totalFilters > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-ft-danger text-[10px] font-mono hover:text-ft-danger/70 px-1.5 py-0.5"
              >
                Clear {totalFilters}
              </button>
            )}
          </div>

          {/* Expanded pill row */}
          {expandedCategory === "muscle" && (
            <PillRow
              options={MUSCLES}
              selected={selectedMuscles}
              onToggle={(v) => toggleFilter("muscle", v)}
            />
          )}
          {expandedCategory === "equipment" && (
            <PillRow
              options={EQUIPMENT}
              selected={selectedEquipment}
              onToggle={(v) => toggleFilter("equipment", v)}
            />
          )}
          {expandedCategory === "movement" && (
            <PillRow
              options={MOVEMENT_LABELS}
              selected={selectedMovements}
              onToggle={(v) => toggleFilter("movement", v)}
            />
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading && exercises.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-ft-dim text-xs font-mono">Loading...</p>
            </div>
          ) : exercises.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-ft-muted text-xs font-mono">
                {search || totalFilters > 0 ? "No exercises found" : "Type to search or select filters"}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {exercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => onSelect(ex)}
                  className="w-full text-left p-2.5 rounded hover:bg-ft-card transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-ft-light text-xs font-mono font-bold truncate group-hover:text-ft-white">
                        {ex.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {ex.primaryMuscle && (
                          <span className="text-[10px] font-mono px-1.5 py-0 rounded bg-ft-bg text-ft-dim">
                            {ex.primaryMuscle}
                          </span>
                        )}
                        {ex.equipment && (
                          <span className="text-[10px] font-mono px-1.5 py-0 rounded bg-ft-bg text-ft-muted">
                            {ex.equipment}
                          </span>
                        )}
                        {ex.movementPattern && (
                          <span className="text-[10px] font-mono px-1.5 py-0 rounded bg-ft-bg text-ft-muted">
                            {ex.movementPattern}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-ft-muted text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                      +
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-ft-border shrink-0">
          <p className="text-ft-muted text-[10px] font-mono text-center">
            {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Filter Category Header Pill ─────────────────────────
function FilterCategoryPill({
  label,
  count,
  expanded,
  onClick,
}: {
  label: string;
  count: number;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-colors border ${
        expanded
          ? "bg-ft-white text-ft-bg border-ft-white"
          : count > 0
          ? "bg-ft-card text-ft-light border-ft-light"
          : "bg-ft-bg text-ft-dim border-ft-card hover:border-ft-dim"
      }`}
    >
      {label}
      {count > 0 && (
        <span className={`text-[9px] ${expanded ? "text-ft-bg/70" : "text-ft-dim"}`}>
          {count}
        </span>
      )}
      <span className="text-[8px]">{expanded ? "▾" : "▸"}</span>
    </button>
  );
}

// ─── Pill Row (multi-select toggle pills) ────────────────
function PillRow({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 py-1">
      {options.map((opt) => {
        const isActive = selected.has(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors border ${
              isActive
                ? "bg-ft-white text-ft-bg border-ft-white font-bold"
                : "bg-ft-bg text-ft-dim border-ft-border hover:border-ft-dim hover:text-ft-light"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
