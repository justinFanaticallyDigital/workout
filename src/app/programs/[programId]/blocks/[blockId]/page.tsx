"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import Stat from "@/components/ui/Stat";
import SectionHeader from "@/components/ui/SectionHeader";
import StatusIcon from "@/components/ui/StatusIcon";
import { useToast } from "@/components/ui/Toast";

interface BlockDayExercise {
  id: string;
  exercise: { name: string; movementPattern: string | null };
  targetSets: number | null;
  targetRepRange: string | null;
}

interface BlockDay {
  id: string;
  dayNumber: number;
  name: string;
  dayType: string;
  exercises: BlockDayExercise[];
}

interface Block {
  id: string;
  name: string;
  description: string | null;
  durationWeeks: number | null;
  scheduleDaysPerWeek: number | null;
  focus: string | null;
  status: string;
  program: { name: string };
  days: BlockDay[];
  _count: { workouts: number };
}

const DAY_TYPES = ["lifting", "cardio", "conditioning", "mobility", "rest"];

export default function BlockDetailPage({
  params,
}: {
  params: { programId: string; blockId: string };
}) {
  const { programId, blockId } = params;
  const toast = useToast();
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDayForm, setShowDayForm] = useState(false);
  const [dayName, setDayName] = useState("");
  const [dayType, setDayType] = useState("lifting");
  const [savingDay, setSavingDay] = useState(false);

  useEffect(() => {
    fetch(`/api/blocks/${blockId}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        setBlock(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [blockId]);

  const handleAddDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayName.trim()) return;
    setSavingDay(true);
    try {
      const res = await fetch(`/api/blocks/${blockId}/days`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dayName.trim(),
          dayType,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const day = await res.json();
      setBlock((prev) =>
        prev
          ? { ...prev, days: [...prev.days, { ...day, exercises: [] }] }
          : prev
      );
      setShowDayForm(false);
      setDayName("");
      setDayType("lifting");
    } catch {
      toast.error("Failed to create day.");
    }
    setSavingDay(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ft-bg text-ft-white flex items-center justify-center">
        <p className="text-ft-dim font-body text-sm">Loading...</p>
      </div>
    );
  }

  if (!block) {
    return (
      <div className="min-h-screen bg-ft-bg text-ft-white p-6">
        <p className="text-ft-light font-body">Block not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href={`/programs/${programId}`}
        className="inline-flex items-center gap-1.5 text-ft-dim text-sm font-body hover:text-ft-light transition-colors mb-6"
      >
        <span>&larr;</span>
        <span>Programs / {block.program.name}</span>
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-body text-2xl font-bold tracking-tight mb-1">
          {block.name}
          {block.description ? ` · ${block.description}` : ""}
        </h1>
        <p className="text-ft-dim text-sm font-body">
          {block.durationWeeks ? `${block.durationWeeks} weeks · ` : ""}
          {block.days.length} day split
          {block.focus ? ` · ${block.focus} focus` : ""}
        </p>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <Card>
          <Stat
            label="Weeks"
            value={block.durationWeeks ? `${block.durationWeeks}` : "—"}
            small
          />
        </Card>
        <Card>
          <Stat label="Sessions" value={block._count.workouts} small />
        </Card>
        <Card>
          <Stat label="Days/Week" value={block.scheduleDaysPerWeek ?? block.days.length} small />
        </Card>
        <Card>
          <Stat
            label="Status"
            value={block.status.charAt(0).toUpperCase() + block.status.slice(1)}
            small
          />
        </Card>
      </div>

      {/* Training Days */}
      <SectionHeader
        title="Training Days"
        action={
          <button
            onClick={() => setShowDayForm(!showDayForm)}
            className="text-ft-dim text-xs font-body hover:text-ft-light transition-colors border border-ft-border rounded px-3 py-1"
          >
            + Add Day
          </button>
        }
      />

      {/* Add Day Form */}
      {showDayForm && (
        <Card className="mb-4">
          <form onSubmit={handleAddDay} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-ft-dim text-xs font-body uppercase tracking-wider mb-1">
                  Day Name *
                </label>
                <input
                  type="text"
                  value={dayName}
                  onChange={(e) => setDayName(e.target.value)}
                  placeholder="e.g. Upper Push"
                  required
                  className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-body text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-body uppercase tracking-wider mb-1">
                  Day Type
                </label>
                <select
                  value={dayType}
                  onChange={(e) => setDayType(e.target.value)}
                  className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-body text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
                >
                  {DAY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDayForm(false)}
                className="px-3 py-1.5 text-ft-dim text-xs font-body hover:text-ft-light"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingDay || !dayName.trim()}
                className="bg-ft-white text-ft-bg font-body text-xs font-bold px-4 py-1.5 rounded hover:bg-ft-light transition-colors disabled:opacity-50"
              >
                {savingDay ? "Saving..." : "Add Day"}
              </button>
            </div>
          </form>
        </Card>
      )}

      {block.days.length === 0 && !showDayForm ? (
        <Card className="border-dashed">
          <p className="text-ft-muted font-body text-sm text-center py-4">
            No training days created yet
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {block.days.map((day) => (
            <Link
              key={day.id}
              href={`/programs/${programId}/blocks/${blockId}/days/${day.id}`}
            >
              <Card className="hover:border-ft-dim transition-colors h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <StatusIcon type="day" dayType={day.dayType as "lifting" | "cardio" | "conditioning" | "mobility" | "rest"} />
                    <h3 className="font-body text-sm font-bold">
                      Day {day.dayNumber} &middot; {day.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag>{day.dayType}</Tag>
                    <span className="text-ft-dim text-[10px] font-body">
                      {day.exercises.length}
                    </span>
                  </div>
                </div>
                {day.exercises.length > 0 ? (
                  <ul className="space-y-1.5">
                    {day.exercises.map((bde) => (
                      <li
                        key={bde.id}
                        className="text-ft-dim text-xs font-body flex items-center gap-2"
                      >
                        <span className="text-ft-muted">&middot;</span>
                        {bde.exercise.name}
                        {bde.targetSets && bde.targetRepRange && (
                          <span className="text-ft-muted">
                            {bde.targetSets}&times;{bde.targetRepRange}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-ft-muted text-xs font-body">
                    No exercises assigned
                  </p>
                )}
                <div className="mt-3 pt-3 border-t border-ft-border">
                  <span className="text-ft-dim text-[10px] font-body uppercase tracking-wider">
                    {day.exercises.length} exercises
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
