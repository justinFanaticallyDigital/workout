"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui";
import EmptyState from "@/components/ui/EmptyState";
import { authCheck } from "@/lib/fetch-helpers";

interface Exercise {
  id: string;
  name: string;
  movementPattern: string | null;
  primaryMuscle: string | null;
  equipment: string | null;
}

const COLUMNS = [
  { key: "name", label: "Exercise", className: "min-w-[200px]" },
  { key: "movementPattern", label: "Pattern" },
  { key: "primaryMuscle", label: "Primary" },
  { key: "equipment", label: "Equipment" },
];

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [filters, setFilters] = useState<string[]>(["All"]);
  const router = useRouter();

  // Read ?pattern= from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pattern = params.get("pattern");
    if (pattern) setActiveFilter(pattern);
  }, []);

  useEffect(() => {
    fetch("/api/exercises")
      .then(authCheck)
      .then((res) => res.json())
      .then((data) => {
        const exs: Exercise[] = data.exercises ?? [];
        setExercises(exs);

        // Build unique movement pattern filters from data
        const patterns = new Set<string>();
        for (const ex of exs) {
          if (ex.movementPattern) patterns.add(ex.movementPattern);
        }
        setFilters(["All", ...Array.from(patterns).sort()]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeFilter === "All"
      ? exercises
      : exercises.filter((e) => e.movementPattern === activeFilter);

  return (
    <div className="min-h-screen bg-ft-bg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-ft-white font-mono font-bold text-2xl uppercase tracking-wider">
            Exercise Library
          </h1>
          <p className="text-ft-dim font-mono text-xs mt-1">
            {exercises.length} exercises · {filters.length - 1} movement patterns
          </p>
        </div>
        <Link
          href="/exercises/new"
          className="bg-ft-white text-ft-bg font-mono text-sm font-bold px-4 py-2 rounded-lg hover:bg-ft-light transition-colors"
        >
          + Add Exercise
        </Link>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-mono rounded-md transition-colors ${
              activeFilter === filter
                ? "bg-ft-white text-ft-bg"
                : "bg-ft-card text-ft-light hover:bg-ft-muted"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Exercise Table */}
      {loading ? (
        <div className="text-ft-dim font-mono text-sm">Loading exercises...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No exercises found"
          description={activeFilter !== "All" ? `No exercises match the "${activeFilter}" filter. Try a different filter.` : "No exercises available yet."}
          actionLabel={activeFilter !== "All" ? "Clear Filter" : undefined}
          onAction={activeFilter !== "All" ? () => setActiveFilter("All") : undefined}
        />
      ) : (
        <DataTable
          columns={COLUMNS}
          data={filtered.map((e) => ({
            id: e.id,
            name: e.name,
            movementPattern: e.movementPattern || "—",
            primaryMuscle: e.primaryMuscle || "—",
            equipment: e.equipment || "—",
          }))}
          onRowClick={(row: Record<string, unknown>) =>
            router.push(`/exercises/${row.id}`)
          }
        />
      )}
    </div>
  );
}
