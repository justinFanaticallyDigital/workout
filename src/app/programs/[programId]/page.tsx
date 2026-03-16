"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import ProgressBar from "@/components/ui/ProgressBar";
import Stat from "@/components/ui/Stat";
import SectionHeader from "@/components/ui/SectionHeader";
import { useToast } from "@/components/ui/Toast";

const activeTagClass = "bg-ft-white text-ft-bg";

interface Block {
  id: string;
  name: string;
  description: string | null;
  blockNumber: number;
  durationWeeks: number | null;
  status: string;
  _count: { workouts: number };
}

interface Program {
  id: string;
  name: string;
  description: string | null;
  durationWeeks: number | null;
  startDate: string | null;
  status: string;
  goal: { title: string } | null;
  blocks: Block[];
}

export default function ProgramDetailPage({
  params,
}: {
  params: { programId: string };
}) {
  const { programId } = params;
  const toast = useToast();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockName, setBlockName] = useState("");
  const [blockDesc, setBlockDesc] = useState("");
  const [blockWeeks, setBlockWeeks] = useState("");
  const [blockFocus, setBlockFocus] = useState("");
  const [savingBlock, setSavingBlock] = useState(false);

  useEffect(() => {
    fetch(`/api/programs/${programId}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        setProgram(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [programId]);

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
      setProgram((prev) =>
        prev
          ? { ...prev, blocks: [...prev.blocks, { ...block, _count: { workouts: 0 } }] }
          : prev
      );
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

  // Calculate progress
  const totalWeeks = program.durationWeeks ?? 0;
  let currentWeek = 0;
  if (program.startDate && totalWeeks > 0) {
    const start = new Date(program.startDate);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    currentWeek = Math.min(
      Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)),
      totalWeeks
    );
  }

  const totalSessions = program.blocks.reduce(
    (sum, b) => sum + (b._count?.workouts ?? 0),
    0
  );

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/programs"
        className="inline-flex items-center gap-1.5 text-ft-dim text-sm font-mono hover:text-ft-light transition-colors mb-6"
      >
        <span>&larr;</span>
        <span>Programs</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-mono text-2xl font-bold tracking-tight">
              {program.name}
            </h1>
            {program.status === "active" && (
              <Tag className={activeTagClass}>Active</Tag>
            )}
            {program.status === "completed" && <Tag>Completed</Tag>}
          </div>
          {program.description && (
            <p className="text-ft-dim text-sm font-mono mb-1">
              {program.description}
            </p>
          )}
          {program.durationWeeks && (
            <p className="text-ft-muted text-xs font-mono">
              {program.durationWeeks} weeks
            </p>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8">
        {totalWeeks > 0 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-ft-dim text-xs font-mono">
                Week {currentWeek} of {totalWeeks} &middot;{" "}
                {Math.round((currentWeek / totalWeeks) * 100)}%
              </span>
            </div>
            <ProgressBar value={currentWeek} max={totalWeeks} />
          </>
        )}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-ft-border">
          <Stat label="Sessions" value={totalSessions} small />
          <Stat label="Blocks" value={program.blocks.length} small />
          <Stat
            label="Duration"
            value={program.durationWeeks ? `${program.durationWeeks}wk` : "—"}
            small
          />
          <Stat
            label="Goal"
            value={program.goal?.title ?? "—"}
            small
          />
        </div>
      </Card>

      {/* Blocks List */}
      <SectionHeader
        title="Blocks"
        action={
          <button
            onClick={() => setShowBlockForm(!showBlockForm)}
            className="text-ft-dim text-xs font-mono hover:text-ft-light transition-colors border border-ft-border rounded px-3 py-1"
          >
            + Add Block
          </button>
        }
      />

      {/* Add Block Form */}
      {showBlockForm && (
        <Card className="mb-4">
          <form onSubmit={handleAddBlock} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Block Name *
                </label>
                <input
                  type="text"
                  value={blockName}
                  onChange={(e) => setBlockName(e.target.value)}
                  placeholder="e.g. Hypertrophy"
                  required
                  className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Focus
                </label>
                <input
                  type="text"
                  value={blockFocus}
                  onChange={(e) => setBlockFocus(e.target.value)}
                  placeholder="e.g. Upper body"
                  className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={blockDesc}
                  onChange={(e) => setBlockDesc(e.target.value)}
                  placeholder="Optional description"
                  className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Weeks
                </label>
                <input
                  type="number"
                  value={blockWeeks}
                  onChange={(e) => setBlockWeeks(e.target.value)}
                  placeholder="e.g. 4"
                  min="1"
                  className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBlockForm(false)}
                className="px-3 py-1.5 text-ft-dim text-xs font-mono hover:text-ft-light"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingBlock || !blockName.trim()}
                className="bg-ft-white text-ft-bg font-mono text-xs font-bold px-4 py-1.5 rounded hover:bg-ft-light transition-colors disabled:opacity-50"
              >
                {savingBlock ? "Saving..." : "Add Block"}
              </button>
            </div>
          </form>
        </Card>
      )}

      {program.blocks.length === 0 && !showBlockForm ? (
        <Card className="border-dashed">
          <p className="text-ft-muted font-mono text-sm text-center py-4">
            No blocks created yet
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {program.blocks.map((block) => (
            <Link
              key={block.id}
              href={`/programs/${programId}/blocks/${block.id}`}
            >
              <Card
                className={`mb-1 ${
                  block.status === "active"
                    ? "border-ft-white"
                    : block.status === "completed"
                    ? "border-ft-muted"
                    : ""
                } hover:border-ft-dim transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        block.status === "completed"
                          ? "bg-ft-success"
                          : block.status === "active"
                          ? "bg-ft-white"
                          : "bg-ft-card"
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-sm font-bold">
                          {block.name}
                        </h3>
                        {block.description && (
                          <span className="text-ft-dim text-xs font-mono">
                            &middot; {block.description}
                          </span>
                        )}
                      </div>
                      {block.durationWeeks && (
                        <p className="text-ft-muted text-xs font-mono">
                          {block.durationWeeks} weeks
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {block.status === "active" && (
                      <Tag className={activeTagClass}>Current</Tag>
                    )}
                    {block.status === "completed" && <Tag>Done</Tag>}
                    {block.status === "upcoming" && (
                      <span className="text-ft-muted text-xs font-mono">
                        Upcoming
                      </span>
                    )}
                    {block._count?.workouts > 0 && (
                      <div className="text-ft-dim text-xs font-mono">
                        {block._count.workouts} sessions
                      </div>
                    )}
                    <span className="text-ft-muted text-sm">&rarr;</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
