"use client";

import { useEffect, useRef, useState } from "react";
import Sheet from "./Sheet";
import CategoryChip from "./CategoryChip";
import { SearchIcon } from "./icons";

export interface PickedExercise {
  id: string;
  name: string;
  movementPattern: string | null;
  primaryMuscle: string | null;
  equipment: string | null;
}

interface ExercisePickerSheetProps {
  open: boolean;
  onClose: () => void;
  onPick: (exercise: PickedExercise) => void;
  title?: string;
}

/** Search the exercise library. Recently used exercises show before a query is typed. */
export default function ExercisePickerSheet({ open, onClose, onPick, title = "Pick exercise" }: ExercisePickerSheetProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickedExercise[]>([]);
  const [recent, setRecent] = useState<PickedExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    fetch("/api/exercises/recent")
      .then((r) => (r.ok ? r.json() : { exercises: [] }))
      .then((d) => setRecent((d.exercises ?? []) as PickedExercise[]))
      .catch(() => setRecent([]));
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      fetch(`/api/exercises?search=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : { exercises: [] }))
        .then((d) => setResults(((d.exercises ?? []) as PickedExercise[]).slice(0, 40)))
        .catch(() => undefined)
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, open]);

  const list = query.trim().length >= 2 ? results : recent;
  const heading = query.trim().length >= 2 ? (loading ? "Searching" : `${list.length} results`) : "Recent";

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <label className="flex items-center gap-2 rounded-ft-md border border-ft-border bg-ft-surface-raised px-3 py-2.5">
        <SearchIcon size={16} className="text-ft-dim" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises"
          className="w-full bg-transparent font-body text-[14px] text-ft-white outline-none placeholder:text-ft-muted"
        />
      </label>
      <div className="t-eyebrow mt-4 mb-1.5">{heading}</div>
      <ul className="divide-y divide-ft-border-faint">
        {list.map((ex) => (
          <li key={ex.id}>
            <button type="button" onClick={() => onPick(ex)} className="flex w-full items-center gap-3 py-2.5 text-left">
              <div className="min-w-0 flex-1">
                <div className="truncate font-data text-[13.5px] font-semibold text-ft-white">{ex.name}</div>
                <div className="mt-0.5 flex items-center gap-2">
                  <CategoryChip movementPattern={ex.movementPattern} primaryMuscle={ex.primaryMuscle} />
                  {ex.equipment && <span className="font-body text-[11.5px] text-ft-dim">{ex.equipment}</span>}
                </div>
              </div>
              <span className="font-data text-[14px] text-ft-accent">›</span>
            </button>
          </li>
        ))}
        {list.length === 0 && !loading && (
          <li className="py-6 text-center font-body text-[13px] text-ft-dim">{query.trim().length >= 2 ? "No matches" : "Type to search the library"}</li>
        )}
      </ul>
    </Sheet>
  );
}
