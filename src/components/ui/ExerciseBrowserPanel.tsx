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

const MUSCLES = [
  "Chest", "Back", "Shoulders", "Biceps", "Triceps", "Quads",
  "Hamstrings", "Glutes", "Calves", "Core", "Forearms", "Traps",
];

const EQUIPMENT = [
  "Barbell", "Dumbbell", "Cable", "Machine", "Bodyweight",
  "Kettlebell", "Band", "Smith Machine",
];

const MOVEMENTS = [
  "Push", "Pull", "Squat", "Hinge", "Carry", "Isolation",
];

export default function ExerciseBrowserPanel({
  open,
  onClose,
  onSelect,
  title = "Add Exercise",
}: ExerciseBrowserPanelProps) {
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState("");
  const [equipment, setEquipment] = useState("");
  const [movement, setMovement] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchExercises = useCallback(
    (s: string, m: string, eq: string, mv: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      const params = new URLSearchParams();
      if (s) params.set("search", s);
      if (m) params.set("muscle", m);
      if (eq) params.set("equipment", eq);
      if (mv) params.set("movement", mv);

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
    []
  );

  // Debounced search
  useEffect(() => {
    if (!open) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fetchExercises(search, muscle, equipment, movement);
    }, 200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [search, muscle, equipment, movement, open, fetchExercises]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearch("");
      setMuscle("");
      setEquipment("");
      setMovement("");
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

  const hasFilters = muscle || equipment || movement;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-ft-surface border-l border-ft-border z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-ft-border flex items-center justify-between shrink-0">
          <h2 className="font-mono text-sm font-bold text-ft-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-ft-dim text-lg hover:text-ft-light transition-colors"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-ft-border shrink-0 space-y-2">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
          />

          {/* Filter chips */}
          <div className="flex flex-wrap gap-1.5">
            <FilterSelect
              value={muscle}
              onChange={setMuscle}
              options={MUSCLES}
              placeholder="Muscle"
            />
            <FilterSelect
              value={equipment}
              onChange={setEquipment}
              options={EQUIPMENT}
              placeholder="Equipment"
            />
            <FilterSelect
              value={movement}
              onChange={setMovement}
              options={MOVEMENTS}
              placeholder="Movement"
            />
            {hasFilters && (
              <button
                onClick={() => {
                  setMuscle("");
                  setEquipment("");
                  setMovement("");
                }}
                className="text-ft-dim text-[10px] font-mono hover:text-ft-light px-2 py-0.5"
              >
                Clear
              </button>
            )}
          </div>
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
                {search || hasFilters ? "No exercises found" : "Type to search"}
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
                      <div className="flex items-center gap-2 mt-0.5">
                        {ex.primaryMuscle && (
                          <span className="text-ft-dim text-[10px] font-mono">
                            {ex.primaryMuscle}
                          </span>
                        )}
                        {ex.equipment && (
                          <span className="text-ft-muted text-[10px] font-mono">
                            {ex.equipment}
                          </span>
                        )}
                        {ex.movementPattern && (
                          <span className="text-ft-muted text-[10px] font-mono">
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

// ─── Filter Chip Select ─────────────────────────────────
function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-ft-bg border rounded px-2 py-0.5 text-[10px] font-mono focus:outline-none transition-colors ${
        value
          ? "border-ft-white text-ft-light"
          : "border-ft-card text-ft-muted"
      }`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
