"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import SectionHeader from "@/components/ui/SectionHeader";

interface Exercise {
  id: string;
  name: string;
  movementPattern: string | null;
  primaryMuscle: string | null;
}

interface BlockDayExercise {
  id: string;
  exercise: { name: string; movementPattern: string | null };
  altExercise: { name: string } | null;
  targetSets: number | null;
  targetRepRange: string | null;
  targetRpe: string | null;
  progressionType: string;
  progressionIncrement: number | null;
  notes: string | null;
}

interface DayData {
  id: string;
  dayNumber: number;
  name: string;
  dayType: string;
  block: { name: string; description: string | null };
  exercises: BlockDayExercise[];
}

const PROGRESSION_TYPES = ["none", "linear", "double", "wave", "rpe_based", "percentage_based"];

export default function DayTemplatePage({
  params,
}: {
  params: { programId: string; blockId: string; dayId: string };
}) {
  const { programId, blockId, dayId } = params;
  const [day, setDay] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);

  // Add exercise form state
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [targetSets, setTargetSets] = useState("3");
  const [targetRepRange, setTargetRepRange] = useState("8-12");
  const [targetRpe, setTargetRpe] = useState("");
  const [progressionType, setProgressionType] = useState("none");
  const [exNotes, setExNotes] = useState("");
  const [savingExercise, setSavingExercise] = useState(false);

  useEffect(() => {
    fetch(`/api/blocks/day/${dayId}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        setDay(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dayId]);

  // Search exercises
  useEffect(() => {
    if (!exerciseSearch.trim() || exerciseSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/exercises?search=${encodeURIComponent(exerciseSearch)}`)
        .then((res) => res.json())
        .then((data) => setSearchResults(data.exercises ?? []))
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [exerciseSearch]);

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise) return;
    setSavingExercise(true);
    try {
      const res = await fetch(`/api/blocks/day/${dayId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: selectedExercise.id,
          targetSets: targetSets ? parseInt(targetSets) : null,
          targetRepRange: targetRepRange.trim() || null,
          targetRpe: targetRpe.trim() || null,
          progressionType,
          notes: exNotes.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const bde = await res.json();
      setDay((prev) =>
        prev ? { ...prev, exercises: [...prev.exercises, { ...bde, altExercise: null, progressionIncrement: null }] } : prev
      );
      // Reset form
      setShowAddExercise(false);
      setSelectedExercise(null);
      setExerciseSearch("");
      setTargetSets("3");
      setTargetRepRange("8-12");
      setTargetRpe("");
      setProgressionType("none");
      setExNotes("");
    } catch {
      alert("Failed to add exercise.");
    }
    setSavingExercise(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ft-bg text-ft-white flex items-center justify-center">
        <p className="text-ft-dim font-mono text-sm">Loading...</p>
      </div>
    );
  }

  if (!day) {
    return (
      <div className="min-h-screen bg-ft-bg text-ft-white p-6">
        <p className="text-ft-light font-mono">Day not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href={`/programs/${programId}/blocks/${blockId}`}
        className="inline-flex items-center gap-1.5 text-ft-dim text-sm font-mono hover:text-ft-light transition-colors mb-6"
      >
        <span>&larr;</span>
        <span>
          {day.block.name}
          {day.block.description ? ` · ${day.block.description}` : ""}
        </span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight mb-1">
            Day {day.dayNumber} &middot; {day.name}
          </h1>
          <p className="text-ft-dim text-sm font-mono">
            Day template &middot; {day.exercises.length} exercises
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tag>{day.dayType}</Tag>
          <Link
            href="/log"
            className="bg-ft-white text-ft-bg font-mono text-sm font-bold px-4 py-2 rounded hover:bg-ft-light transition-colors"
          >
            Log Session &rarr;
          </Link>
        </div>
      </div>

      {/* Add Exercise Button */}
      <SectionHeader
        title="Exercises"
        action={
          <button
            onClick={() => setShowAddExercise(!showAddExercise)}
            className="text-ft-dim text-xs font-mono hover:text-ft-light transition-colors border border-ft-border rounded px-3 py-1"
          >
            + Add Exercise
          </button>
        }
      />

      {/* Add Exercise Form */}
      {showAddExercise && (
        <Card className="mb-4">
          <form onSubmit={handleAddExercise} className="space-y-3">
            {/* Exercise search */}
            <div>
              <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                Exercise *
              </label>
              {selectedExercise ? (
                <div className="flex items-center gap-2 bg-ft-bg border border-ft-card rounded px-3 py-2">
                  <span className="text-ft-white text-sm font-mono flex-1">
                    {selectedExercise.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedExercise(null);
                      setExerciseSearch("");
                    }}
                    className="text-ft-dim text-xs hover:text-ft-light"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                    placeholder="Search exercises..."
                    className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-ft-surface border border-ft-card rounded max-h-48 overflow-y-auto z-10">
                      {searchResults.map((ex) => (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() => {
                            setSelectedExercise(ex);
                            setSearchResults([]);
                          }}
                          className="w-full text-left px-3 py-2 text-sm font-mono text-ft-light hover:bg-ft-card transition-colors"
                        >
                          {ex.name}
                          {ex.primaryMuscle && (
                            <span className="text-ft-muted text-xs ml-2">
                              {ex.primaryMuscle}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Sets
                </label>
                <input
                  type="number"
                  value={targetSets}
                  onChange={(e) => setTargetSets(e.target.value)}
                  min="1"
                  className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Rep Range
                </label>
                <input
                  type="text"
                  value={targetRepRange}
                  onChange={(e) => setTargetRepRange(e.target.value)}
                  placeholder="8-12"
                  className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  RPE
                </label>
                <input
                  type="text"
                  value={targetRpe}
                  onChange={(e) => setTargetRpe(e.target.value)}
                  placeholder="e.g. 7-8"
                  className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Progression
                </label>
                <select
                  value={progressionType}
                  onChange={(e) => setProgressionType(e.target.value)}
                  className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
                >
                  {PROGRESSION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                Notes
              </label>
              <input
                type="text"
                value={exNotes}
                onChange={(e) => setExNotes(e.target.value)}
                placeholder="Optional notes..."
                className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddExercise(false)}
                className="px-3 py-1.5 text-ft-dim text-xs font-mono hover:text-ft-light"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingExercise || !selectedExercise}
                className="bg-ft-white text-ft-bg font-mono text-xs font-bold px-4 py-1.5 rounded hover:bg-ft-light transition-colors disabled:opacity-50"
              >
                {savingExercise ? "Adding..." : "Add Exercise"}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Exercises */}
      {day.exercises.length === 0 && !showAddExercise ? (
        <Card className="border-dashed">
          <p className="text-ft-muted font-mono text-sm text-center py-4">
            No exercises assigned to this day
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {day.exercises.map((bde, idx) => (
            <Card key={bde.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-ft-muted text-xs font-mono font-bold mt-0.5 w-5">
                    {idx + 1}.
                  </span>
                  <div>
                    <h3 className="font-mono text-sm font-bold mb-1">
                      {bde.exercise.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs font-mono text-ft-dim">
                      {bde.targetSets && <span>{bde.targetSets} sets</span>}
                      {bde.targetRepRange && (
                        <>
                          <span className="text-ft-muted">&times;</span>
                          <span>{bde.targetRepRange} reps</span>
                        </>
                      )}
                      {bde.targetRpe && (
                        <>
                          <span className="text-ft-muted">&middot;</span>
                          <span>RPE {bde.targetRpe}</span>
                        </>
                      )}
                    </div>
                    {bde.altExercise && (
                      <p className="text-ft-muted text-xs font-mono mt-1">
                        Alt: {bde.altExercise.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {(bde.progressionType !== "none" || bde.notes) && (
                <div className="mt-3 pt-3 border-t border-ft-border ml-8">
                  {bde.progressionType !== "none" && (
                    <div className="flex items-center gap-2">
                      <span className="text-ft-muted text-[10px] font-mono uppercase tracking-wider">
                        Progression
                      </span>
                      <span className="text-ft-light text-xs font-mono">
                        {bde.progressionType}
                        {bde.progressionIncrement
                          ? ` (+${Number(bde.progressionIncrement)})`
                          : ""}
                      </span>
                    </div>
                  )}
                  {bde.notes && (
                    <p className="text-ft-dim text-xs font-mono mt-1">
                      {bde.notes}
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
